import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  personAddOutline,
  schoolOutline,
  briefcaseOutline,
  scanCircleOutline,
  shieldCheckmarkOutline,
  powerOutline,
  statsChartOutline,
  cloudOfflineOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class AdminDashboardPage {

  studentCount = 0;
  employeeCount = 0;
  scanCount = 0;
  isOffline = !navigator.onLine;

  onlineHandler = () => {
    console.log("🌐 Back Online → syncing stats...");
    this.isOffline = false;
    this.loadStats(); // 🔥 auto sync
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
      personAddOutline,
      schoolOutline,
      briefcaseOutline,
      scanCircleOutline,
      shieldCheckmarkOutline,
      powerOutline,
      statsChartOutline,
      cloudOfflineOutline
    });

  }

  ionViewWillEnter() {
    this.isOffline = !navigator.onLine;

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
    this.isOffline = !navigator.onLine;
    this.loadStats();
  }

  loadStats() {

    if (!navigator.onLine) {
      console.log("🚫 Offline → skipping stats fetch");
      return;
    }
    
    // 🟠 Offline Support: Load from cache first
    const cachedStats = localStorage.getItem('offline_admin_stats');
    if (cachedStats) {
      const data = JSON.parse(cachedStats);
      this.studentCount = data.students || 0;
      this.employeeCount = data.employees || 0;
      this.scanCount = data.scans || 0;
    }

    this.http.get<any>(`${environment.apiUrl}/id/get-stats`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).subscribe({
      next: (data) => {

        const newData = JSON.stringify(data);
        const oldData = localStorage.getItem('offline_admin_stats');
      
        // 🧠 ONLY UPDATE IF CHANGED
        if (newData !== oldData) {
      
          console.log("🔄 Stats updated from server");
      
          this.studentCount = data.students || 0;
          this.employeeCount = data.employees || 0;
          this.scanCount = data.scans || 0;
      
          localStorage.setItem('offline_admin_stats', newData);
          window.dispatchEvent(new Event('dataUpdated'));
      
        } else {
          console.log("✅ Stats already up-to-date (no sync needed)");
        }
      
        this.auth.updateLastCheckin();
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        // Do NOT logout on network errors (status 0)
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  goCreateId() {
    this.router.navigate(['/admin-create-id']);
  }

  goStudents() {
    this.router.navigate(['/admin-students']);
  }

  goEmployees() {
    this.router.navigate(['/admin-employees']);
  }

  goScan() {
    this.router.navigate(['/scan-id']);
  }

  goToLogs() {
    this.router.navigate(['/logs']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ionViewWillLeave() {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

}
