import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  shieldHalfOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkDoneOutline,
  fingerPrintOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent,
    IonIcon,
    IonItem,
    IonInput,
    IonButton
  ]
})
export class RegisterPage {

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = false;

  constructor(private router: Router, private http: HttpClient) {
    addIcons({
      shieldHalfOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      checkmarkDoneOutline,
      fingerPrintOutline
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('Please fill all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const body = {
      username: this.email.trim().toLowerCase(),
      password: this.password
    };

    this.http.post(`${environment.apiUrl}/auth/register-admin`, body)
      .subscribe({
        next: () => {
          alert('Admin created successfully');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message || 'Registration failed';
          alert(errorMsg);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}