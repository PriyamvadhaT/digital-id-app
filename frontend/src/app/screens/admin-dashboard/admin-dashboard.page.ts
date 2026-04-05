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
  statsChartOutline
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
      statsChartOutline
    });

  }

  ionViewWillEnter() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/id/get-stats`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).subscribe({
      next: (data) => {
        this.studentCount = data.students || 0;
        this.employeeCount = data.employees || 0;
        this.scanCount = data.scans || 0;
      },
      error: (err) => console.error('Error fetching stats:', err)
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

}