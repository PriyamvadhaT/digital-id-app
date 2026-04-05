import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

import { IonContent } from '@ionic/angular/standalone';

import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.page.html',
  styleUrls: ['./id-card.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    QRCodeComponent
  ]
})
export class IdCardPage {

  profile: any = null;
  role = '';
  qrValue = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.loadId();
  }

  loadId() {

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    /* LOAD OFFLINE TOKEN */

    const savedToken = localStorage.getItem('offlineIdToken');

    if (savedToken) {

      const payload = JSON.parse(atob(savedToken.split('.')[1]));

      this.profile = payload;
      this.role = payload.role;

      this.generateQR();
    }

    /* IF ONLINE → GET LATEST ID */

    if (navigator.onLine) {

      this.http.get<any>(`${environment.apiUrl}/id/my-id`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({

        next: (res) => {

          if (!res.idToken) return;

          /* SAVE TOKEN FOR OFFLINE */

          localStorage.setItem('offlineIdToken', res.idToken);

          const payload = JSON.parse(atob(res.idToken.split('.')[1]));

          this.profile = payload;
          this.role = payload.role;

          this.generateQR();
        },

        error: () => {
          console.log("Could not sync ID (offline or server issue)");
        }

      });

    }

  }

  generateQR() {

    if (!this.profile) return;

    this.qrValue = localStorage.getItem('offlineIdToken') || '';

  }

}