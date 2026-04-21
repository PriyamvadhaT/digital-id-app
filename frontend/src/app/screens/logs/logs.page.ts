import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import {
  filterOutline,
  documentOutline,
  personCircleOutline,
  calendarOutline,
  searchOutline,
  funnelOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,   
    FormsModule,    
    DatePipe,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent   
  ]
})
export class LogsPage {

  logs: any[] = [];
  fromDate = '';
  toDate = '';
  resultFilter = '';
  verifierRoleFilter = '';
  searchText = '';

  constructor(private http: HttpClient) {
    addIcons({
      'filter-outline': filterOutline,
      'document-outline': documentOutline,
      'person-circle-outline': personCircleOutline,
      'calendar-outline': calendarOutline,
      'search-outline': searchOutline,
      'funnel-outline': funnelOutline,
      'time-outline': timeOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }

  get stats() {
    const total = this.logs.length;
    const valid = this.logs.filter(l => l.result === 'VALID').length;
    const invalid = this.logs.filter(l => l.result !== 'VALID').length;
    return { total, valid, invalid };
  }

  ionViewWillEnter() {
    this.loadLogs();
  }

  loadLogs() {

    const token = localStorage.getItem('token');

    let url = `${environment.apiUrl}/id/logs?`;

    if (this.fromDate && this.toDate) {
      url += `from=${this.fromDate}&to=${this.toDate}&`;
    }

    if (this.resultFilter) {
      url += `result=${this.resultFilter}&`;
    }

    if (this.verifierRoleFilter) {
      url += `verifierRole=${this.verifierRoleFilter}`;
    }

    this.http.get<any[]>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.logs = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  filteredLogs() {
    return this.logs.filter(log => {
      const search = this.searchText.toLowerCase();
      const matchesSearch =
        !this.searchText ||
        log.scannedName?.toLowerCase().includes(search) ||
        log.scannedId?.toLowerCase().includes(search) ||
        log.result?.toLowerCase().includes(search);

      return matchesSearch;
    });
  }

  deleteLogs() {

    if (!confirm('Delete filtered logs?')) return;
  
    const token = localStorage.getItem('token');
  
    let url = `${environment.apiUrl}/id/logs?`;
  
    if (this.fromDate && this.toDate) {
      url += `from=${this.fromDate}&to=${this.toDate}&`;
    }
  
    if (this.resultFilter) {
      url += `result=${this.resultFilter}&`;
    }
  
    if (this.verifierRoleFilter) {
      url += `verifierRole=${this.verifierRoleFilter}`;
    }
  
    this.http.delete<any>(url, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        alert(`Deleted ${res.count} logs`);
        this.loadLogs();
      },
      error: () => {
        alert('Failed to delete logs');
      }
    });
  
  }

  handleRefresh(event: any) {
    this.loadLogs();
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

}
