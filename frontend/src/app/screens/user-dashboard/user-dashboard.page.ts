import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  idCardOutline, 
  chevronForwardOutline, 
  lockClosedOutline, 
  scanCircleOutline, 
  logOutOutline,
  person
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class UserDashboardPage {

  profile: any = null;
  role = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {
    addIcons({
      person,
      idCardOutline,
      chevronForwardOutline,
      lockClosedOutline,
      scanCircleOutline,
      logOutOutline
    });

  }

  ionViewWillEnter() {

    // check login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.loadProfile();

  }

  loadProfile() {

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({

      next: (res) => {

        this.role = res.role;
        this.profile = res.profile;

      },

      error: (err) => {

        console.log("Session error:", err);

        this.auth.logout();
        this.router.navigate(['/login'], { replaceUrl: true });

      }

    });

  }

  goToIdCard() {

    if (!this.profile) {
      alert('Profile still loading...');
      return;
    }

    this.router.navigate(['/id-card']);

  }

  goToChangePassword() {

    this.router.navigate(['/change-password']);

  }

  goToScan() {
    this.router.navigate(['/scan-id']);
  }

  logout() {

    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });

  }

}