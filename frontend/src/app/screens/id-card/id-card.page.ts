import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonIcon,
  IonSpinner,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  shieldCheckmarkOutline, 
  refreshOutline, 
  alertCircleOutline,
  chevronBackOutline
} from 'ionicons/icons';

import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.page.html',
  styleUrls: ['./id-card.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonIcon,
    IonSpinner,
    IonButton,
    QRCodeComponent
  ]
})
export class IdCardPage {

  profile: any = null;
  role = '';
  qrValue = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({ 
      shieldCheckmarkOutline, 
      refreshOutline, 
      alertCircleOutline,
      chevronBackOutline
    });
  }

  ionViewWillEnter() {
    this.loadId();
  }

  loadId() {

    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    const savedToken = localStorage.getItem('offlineIdToken');
    const savedQrToken = localStorage.getItem('offlineQrToken');

    /* ✅ ALLOW OFFLINE ACCESS EVEN WITHOUT TOKEN */
    if (!token && !savedToken) {
      this.router.navigate(['/login']);
      return;
    }

    // 🔐 SECURITY CHECK
    if (!navigator.onLine && !this.auth.isCheckinValid()) {
      this.isLoading = false;
      this.errorMessage = 'Please connect to internet for security verification.';
      return;
    }

    /* ✅ STEP 1: LOAD OFFLINE DATA FIRST */
    if (savedToken) {
      try {
        const decoded = this.decodeToken(savedToken);

        if (decoded) {
          this.profile = decoded;
          this.role = decoded.role || 'user';
          this.qrValue = savedQrToken || savedToken;

          console.log("✅ Offline ID loaded");

          this.isLoading = false;

          // 🔥 IMPORTANT: stop here if offline
          if (!navigator.onLine) return;
        }

      } catch (e) {
        console.log("❌ Offline decode failed", e);
      }
    }

    /* ❌ OFFLINE WITHOUT DATA */
    if (!navigator.onLine) {
      this.isLoading = false;

      if (!this.profile) {
        this.errorMessage = 'No offline ID found. Please login once online.';
      }

      return;
    }

    /* 🌐 ONLINE FETCH */
    if (!token && navigator.onLine) {
      this.isLoading = false;
      this.errorMessage = 'Session expired. Please login again.';
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/id/my-id`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({

      next: (res) => {

        this.isLoading = false;

        if (res.idToken) {

          localStorage.setItem('offlineIdToken', res.idToken);

          if (res.qrToken) {
            localStorage.setItem('offlineQrToken', res.qrToken);
            this.qrValue = res.qrToken;
          }

          const decoded = this.decodeToken(res.idToken);

          if (decoded) {
            this.profile = decoded;
            this.role = decoded.role;
          }
        }
      },

      error: () => {
        this.isLoading = false;

        if (!this.profile) {
          this.errorMessage = 'Failed to load ID from server.';
        }
      }

    });
  }

  decodeToken(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);

    } catch (e) {
      console.error("JWT Decode Error:", e);
      return null;
    }
  }

  generateQR() {
    // qrValue is now set directly when token is received — no-op kept for safety
    if (!this.qrValue) {
      this.qrValue = localStorage.getItem('offlineIdToken') || '';
    }
  }

}
