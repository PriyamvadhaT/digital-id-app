import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { lockClosedOutline, keyOutline, lockOpenOutline, checkmarkDoneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class ChangePasswordPage {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({
      lockClosedOutline,
      keyOutline,
      lockOpenOutline,
      checkmarkDoneOutline
    });
  }

  submit() {
    if (!this.currentPassword || !this.newPassword) {
      alert('All fields are required');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    this.loading = true;

    const token = localStorage.getItem('token');

    this.http.patch(
      `${environment.apiUrl}/auth/change-password`,
      {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      }, this.getHeaders()
    ).subscribe({
      next: () => {
        alert('Password changed successfully');
        localStorage.clear(); // 🔐 force re-login
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        alert(err.error?.message || 'Password change failed');
        this.loading = false;
      }
    });
  }

  getHeaders() {
    return {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    };
  }
}
