import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    private auth: AuthService
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

    /* FIRST LOGIN MUST BE ONLINE */

    const token = localStorage.getItem('token');

    if (!navigator.onLine && !token) {
      alert('First login requires internet connection');
      return;
    }

    if (!this.username || !this.password) {
      alert('Enter username and password');
      return;
    }

    const cleanUsername = this.username.trim().toLowerCase();
    const cleanPassword = this.password;

    this.auth.login(cleanUsername, cleanPassword).subscribe({

      next: (res: any) => {

        // ✅ ROLE CHECK
        if (this.selectedRole === 'admin' && res.role !== 'admin') {
          alert('This is not an admin account');
          return;
        }

        if (this.selectedRole === 'user' && res.role === 'admin') {
          alert('Admins cannot login as Users');
          return;
        }

        this.auth.saveSession(res.token, res.role, res.userId);

        // ✅ NAVIGATION
        if (res.role === 'admin') {
          this.router.navigate(['/admin-dashboard'], { replaceUrl: true });
        } 
        else {
          this.router.navigate(['/user-dashboard'], { replaceUrl: true });
        }

      },

      error: (err) => {

        if (err.status === 403) {
          alert('Your ID has been deactivated by admin');
        }

        else if (err.status === 404) {
          alert('Your account has been deleted');
        }

        else if (err.status === 401) {
          alert('Invalid username or password');
        }

        else {
          alert('Server error. Please try again later');
        }

      }

    });

  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
