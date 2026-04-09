import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  schoolOutline, 
  personOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  shieldCheckmarkOutline 
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    FormsModule,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule
  ]
})
export class LoginPage {

  username = '';
  password = '';
  showPassword = false;
  selectedRole: 'user' | 'admin' = 'user';

  constructor(
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {
    addIcons({
      schoolOutline,
      personOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      shieldCheckmarkOutline
    });
  }

  togglePassword(){
    this.showPassword = !this.showPassword;
  }

  login() {

    const cleanUsername = this.username.trim().toLowerCase();
    const cleanPassword = this.password;

    if (!cleanUsername || !cleanPassword) {
      alert('Enter username and password');
      return;
    }

    /* 🔴 OFFLINE LOGIN */
    if (!navigator.onLine) {
      if (this.auth.verifyOffline(cleanUsername, cleanPassword)) {

        const savedRole = localStorage.getItem('role') || 'user';

        localStorage.setItem('loggedIn', 'true');

        if (savedRole === 'admin') {
          this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
        }

        return;
      } else {
        alert('Offline login failed. First login must be online.');
        return;
      }
    }

    /* 🟢 ONLINE LOGIN */
    this.auth.login(cleanUsername, cleanPassword).subscribe({

      next: (res: any) => {

        console.log('LOGIN SUCCESS:', res);

        // ✅ NORMALIZE ROLE
        let normalizedRole = res.role;

        if (res.role === 'Student' || res.role === 'Employee') {
          normalizedRole = 'user';
        }

        // ✅ SAVE SESSION
        this.auth.saveSession(
          res.token,
          normalizedRole,
          res.userId,
          cleanUsername,
          cleanPassword
        );

        // ✅ IMMEDIATE NAVIGATION (IMPORTANT)
        if (normalizedRole === 'admin') {
          this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
        }

        // ✅ BACKGROUND FETCH (NON-BLOCKING)
        if (normalizedRole === 'user') {
          setTimeout(() => {
            this.http.get<any>(`${environment.apiUrl}/id/my-id`, {
              headers: { Authorization: `Bearer ${res.token}` }
            }).subscribe({
              next: (idRes: any) => {
                if (idRes.idToken) {
                  localStorage.setItem('offlineIdToken', idRes.idToken);
                }
                if (idRes.qrToken) {
                  localStorage.setItem('offlineQrToken', idRes.qrToken);
                }
              },
              error: () => {}
            });
          }, 1000);
        }

        // clear fields
        this.username = '';
        this.password = '';
      },

      error: (err) => {
        console.log('LOGIN ERROR:', err);

        if (err.status === 403) {
          alert('Your ID has been deactivated');
        }
        else if (err.status === 404) {
          alert('Account not found');
        }
        else if (err.status === 401) {
          alert('Invalid credentials');
        }
        else {
          alert('Server error');
        }
      }

    });

  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
