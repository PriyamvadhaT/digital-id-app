import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
    private router: Router
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
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    /* 1. TRY OFFLINE TOKEN FIRST (FOR INSTANT UI) */
    const savedToken = localStorage.getItem('offlineIdToken');
    if (savedToken) {
      console.log("Loading offline token...");
      this.profile = this.decodeToken(savedToken);
      if (this.profile) {
        this.role = this.profile.role;
        this.generateQR();
        // We still continue to fetch online to sync latest data
      }
    }

    /* 2. SYNC WITH SERVER */
    if (navigator.onLine) {
      this.http.get<any>(`${environment.apiUrl}/id/my-id`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (!res.idToken) {
            if (!this.profile) this.errorMessage = 'No ID data found on server.';
            return;
          }

          localStorage.setItem('offlineIdToken', res.idToken);
          const newProfile = this.decodeToken(res.idToken);
          
          if (newProfile) {
            this.profile = newProfile;
            this.role = this.profile.role;
            this.generateQR();
          } else if (!this.profile) {
            this.errorMessage = 'Failed to process Digital ID payload.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Sync Error:", err);
          if (!this.profile) {
            this.errorMessage = 'Unable to connect to server. Please check your connection.';
          }
        }
      });
    } else {
      this.isLoading = false;
      if (!this.profile) {
        this.errorMessage = 'You are offline and no local ID was found.';
      }
    }
  }

  decodeToken(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode Error:", e);
      return null;
    }
  }

  generateQR() {
    if (!this.profile) return;
    this.qrValue = localStorage.getItem('offlineIdToken') || '';
  }

}