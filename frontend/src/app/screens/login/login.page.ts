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

  ionViewWillEnter() {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {

      if (role === 'admin') {
        this.router.navigate(['/admin-dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/user-dashboard'], { replaceUrl: true });
      }

    }

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
  
    /* 🔵 OFFLINE LOGIN */
    if (!navigator.onLine) {
  
      if (this.auth.verifyOffline(cleanUsername, cleanPassword)) {
  
        const savedRole = localStorage.getItem('role');
        if (!savedRole) {
          alert('Offline data missing. Please login once online.');
          return;
        }
  
        // role validation
        if (this.selectedRole === 'admin' && savedRole !== 'admin') {
          alert('This is not an admin account');
          return;
        }
        if (this.selectedRole === 'user' && savedRole === 'admin') {
          alert('Admins cannot login as Users');
          return;
        }
  
        // ✅ Mark session as active
        localStorage.setItem('loggedIn', 'true');
  
        // ✅ update checkin time
        this.auth.updateLastCheckin();
  
        // ⭐ FIRST fetch profile, THEN navigate
        this.http.get<any>(`${environment.apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${res.token}` }
        }).subscribe({
          next: (profileRes) => {
        
            // ✅ Save profile BEFORE navigation
            localStorage.setItem('offline_profile', JSON.stringify(profileRes.profile));
        
            console.log("✅ Profile cached before navigation");
        
            // ✅ NOW navigate
            this.router.navigate(
              res.role === 'admin' ? ['/admin-dashboard'] : ['/user-dashboard'],
              { replaceUrl: true }
            );
          },
          error: () => {
            // fallback navigation if profile fails
            this.router.navigate(
              res.role === 'admin' ? ['/admin-dashboard'] : ['/user-dashboard'],
              { replaceUrl: true }
            );
          }
        });
  
        return;
  
      } else {
        alert('Offline login failed. First login must be online.');
        return;
      }
    }
  
    /* 🟢 ONLINE LOGIN */
    this.auth.login(cleanUsername, cleanPassword).subscribe({
  
      next: (res: any) => {
  
        // role validation
        if (this.selectedRole === 'admin' && res.role !== 'admin') {
          alert('This is not an admin account');
          return;
        }
  
        if (this.selectedRole === 'user' && res.role === 'admin') {
          alert('Admins cannot login as Users');
          return;
        }
  
        // ✅ Save session
        this.auth.saveSession(
          res.token,
          res.role.toLowerCase(),
          res.userId,
          cleanUsername,
          cleanPassword
        );
  
        // ✅ FIX: allow ALL non-admin users
        if (res.role !== 'admin') {
          this.http.get<any>(`${environment.apiUrl}/id/my-id`, {
            headers: { Authorization: `Bearer ${res.token}` }
          }).subscribe({
            next: (idRes: any) => {
        
              console.log("ID API RESPONSE:", idRes);
        
              if (idRes.idToken) {
                localStorage.setItem('offlineIdToken', idRes.idToken);
                console.log("offlineIdToken saved");
              } else {
                console.log("idToken missing!");
              }
        
              if (idRes.qrToken) {
                localStorage.setItem('offlineQrToken', idRes.qrToken);
              }
        
            },
            error: (err) => {
              console.log("ID fetch failed", err);
            }
          });
        }
  
        // navigate
        this.router.navigate(
          res.role === 'admin' ? ['/admin-dashboard'] : ['/user-dashboard'],
          { replaceUrl: true }
        );
  
      },
  
      error: (err) => {
  
        if (err.status === 403) {
          alert('Your ID has been deactivated by admin');
        } else if (err.status === 404) {
          alert('Your account has been deleted');
        } else if (err.status === 401) {
          alert('Invalid username or password');
        } else {
          alert('Server error. Please try again later');
        }
  
      }
  
    });
  
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
