import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { statsChartOutline } from 'ionicons/icons';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  addCircleOutline,
  schoolOutline,
  peopleOutline,
  scanOutline,
  logOutOutline
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

  constructor(
    private router: Router,
    private auth: AuthService
  ) {

    addIcons({
      'add-circle-outline': addCircleOutline,
      'school-outline': schoolOutline,
      'people-outline': peopleOutline,
      'scan-outline': scanOutline,
      'log-out-outline': logOutOutline,
      'stats-chart-outline': statsChartOutline
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