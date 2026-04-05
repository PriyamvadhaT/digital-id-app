import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import {
  personOutline,
  keyOutline,
  lockOpenOutline,
  refreshOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class ForgotPasswordPage {

  username = '';
  newPassword = '';

  showPassword = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {

    addIcons({
      'person-outline': personOutline,
      'key-outline': keyOutline,
      'lock-open-outline': lockOpenOutline,
      'refresh-outline': refreshOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });

  }

  togglePassword(){
    this.showPassword = !this.showPassword;
  }

  resetPassword() {

    if (!this.username || !this.newPassword) {
      alert("Please enter username and new password");
      return;
    }

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      username: this.username,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        alert("Password reset successful");
        this.router.navigate(['/login']);
      },
      error: () => {
        alert("User not found");
      }
    });

  }

}