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

    // ✅ Check login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.isOffline = !navigator.onLine;

    // ✅ LOAD CACHED PROFILE FIRST (instant UI)
    const cachedProfile = localStorage.getItem('offline_profile');
    if (cachedProfile) {
      try {
        this.profile = JSON.parse(cachedProfile);
      } catch (e) {
        console.log('Invalid cached profile');
      }
    }

    // ✅ FALLBACK PROFILE (prevents blank screen)
    if (!this.profile) {
      this.profile = { name: 'User' };
    }

    // ✅ LOAD FROM SERVER IN BACKGROUND (non-blocking)
    if (navigator.onLine) {
      setTimeout(() => {
        this.loadProfile();
      }, 1000);
    }
  }

  loadProfile() {

     if (!navigator.onLine) {
       console.log("🚫 Offline → skipping profile fetch");
       return;
     }
    
    const token = localStorage.getItem('token');

    // ❌ DON'T REDIRECT if token missing immediately
    if (!token) {
      console.log('No token, skipping profile fetch');
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.role = res.role;
        this.profile = res.profile;

        // ✅ CACHE FOR OFFLINE USE
        localStorage.setItem('offline_profile', JSON.stringify(res.profile));

        // ✅ UPDATE SESSION TIME
        this.auth.updateLastCheckin();
      },
      error: (err) => {
        console.log("Profile load failed:", err);

        // ❌ ONLY logout for real auth errors
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      }
    });
  }

  goToIdCard() {
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
