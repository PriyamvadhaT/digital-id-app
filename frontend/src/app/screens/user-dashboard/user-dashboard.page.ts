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
  person,
  cloudOfflineOutline
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
  isOffline = !navigator.onLine;

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
      logOutOutline,
      cloudOfflineOutline
    });

  }

  ionViewWillEnter() {

    // check login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.isOffline = !navigator.onLine;
    this.loadProfile();

  }

  loadProfile() {
    const token = localStorage.getItem('token');
    
    // 🟠 Offline Support: Load from cache first
    const cachedProfile = localStorage.getItem('offline_profile');
    if (cachedProfile) {
      this.profile = JSON.parse(cachedProfile);
    }

    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.role = res.role;
        this.profile = res.profile;
        // 🟢 Cache for offline use
        localStorage.setItem('offline_profile', JSON.stringify(res.profile));
        this.auth.updateLastCheckin();
      },
      error: (err) => {
        console.log("Profile load failed:", err);
        // 🔴 ONLY logout if session is strictly expired (401/403)
        // Network errors (0) are ignored so user stays in for offline access
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.router.navigate(['/login'], { replaceUrl: true });
        }
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