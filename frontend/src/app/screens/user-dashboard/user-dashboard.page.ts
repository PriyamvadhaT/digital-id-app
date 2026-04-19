import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
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
    IonIcon,
    IonSpinner
  ]
})
export class UserDashboardPage {

  profile: any = null;
  role = '';
  isOffline = !navigator.onLine;

  onlineHandler = () => {
    console.log("🌐 Back Online → syncing profile...");
    this.isOffline = false;
    this.loadProfile(); // 🔥 auto sync
  };
  
  offlineHandler = () => {
    console.log("📴 You are offline");
    this.isOffline = true;
  };

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

    this.isOffline = !navigator.onLine;

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      this.role = savedRole.toLowerCase(); // ✅ fix case issue
    }

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
      // wait for data instead of showing empty
      return;
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

        const newProfile = JSON.stringify(res.profile);
        const oldProfile = localStorage.getItem('offline_profile');
      
        // 🧠 ONLY UPDATE IF CHANGED
        if (newProfile !== oldProfile) {
      
          console.log("🔄 Profile updated from server");
      
          this.role = res.role?.toLowerCase();
          this.profile = res.profile;
      
          localStorage.setItem('offline_profile', newProfile);
          window.dispatchEvent(new Event('dataUpdated'));
      
        } else {
          console.log("✅ Profile already up-to-date (no sync needed)");
        }
      
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

  ionViewWillLeave() {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

}
