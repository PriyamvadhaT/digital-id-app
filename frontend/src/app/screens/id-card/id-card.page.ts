import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  chevronBackOutline,
  downloadOutline
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
    private router: Router,
    private auth: AuthService
  ) {
    addIcons({ 
      shieldCheckmarkOutline, 
      refreshOutline, 
      alertCircleOutline,
      chevronBackOutline,
      downloadOutline
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

    // 🔒 Safety Check: Expiry check for offline users
    if (!navigator.onLine && !this.auth.isCheckinValid()) {
      this.errorMessage = 'Security Check Required: Please connect to the internet to verify your ID status.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    /* 1. TRY OFFLINE TOKEN FIRST (FOR INSTANT UI) */
    const savedToken = localStorage.getItem('offlineIdToken');
    const savedQrToken = localStorage.getItem('offlineQrToken');
    if (savedToken) {
      console.log("Loading offline token...");
      this.profile = this.decodeToken(savedToken);
      if (this.profile) {
        this.role = this.profile.role;
        this.qrValue = savedQrToken || ''; // Use lightweight QR token
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
          if (res.qrToken) {
            localStorage.setItem('offlineQrToken', res.qrToken);
            this.qrValue = res.qrToken; // ✅ Use lightweight QR token (no photo)
          }
          const newProfile = this.decodeToken(res.idToken);
          
          if (newProfile) {
            this.profile = newProfile;
            this.role = this.profile.role;
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
    // qrValue is now set directly when token is received — no-op kept for safety
    if (!this.qrValue) {
      this.qrValue = localStorage.getItem('offlineIdToken') || '';
    }
  }

  async downloadPDF() {
    const data = document.getElementById('id-card-to-export');
    if (!data) {
      alert('ID Card content not found');
      return;
    }

    this.isLoading = true;

    try {
      console.log('PDF Export: Manual Assembly Start...');
      // 📐 Define PDF dimensions and margins
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageWidth = 140; // Card width in PDF (slightly smaller for elegance)
      const xStart = (pdfWidth - pageWidth) / 2;
      const yStart = 40;

      // 1️⃣ DRAW HEADER (Blue Section)
      pdf.setFillColor(37, 99, 235); // Blue primary (#2563eb)
      pdf.roundedRect(xStart, yStart, pageWidth, 50, 5, 5, 'F');
      
      // 2️⃣ ADD DOCUMENT TITLE
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('DIGITAL IDENTIFICATION CARD', pdfWidth / 2, yStart + 15, { align: 'center' });
      
      let currentY = yStart + 60;

      // 3️⃣ ADD PROFILE PHOTO
      if (this.profile.photo) {
        try {
          const photoBase64 = this.profile.photo.startsWith('data:') 
            ? this.profile.photo 
            : 'data:image/jpeg;base64,' + this.profile.photo;
          pdf.addImage(photoBase64, 'JPEG', xStart + 10, currentY, 40, 40);
        } catch (photoErr) {
          console.warn('Could not add photo to PDF:', photoErr);
          pdf.rect(xStart + 10, currentY, 40, 40); // Placeholder box
          pdf.text('PHOTO', xStart + 20, currentY + 20);
        }
      }

      // 4️⃣ ADD USER'S PERSONAL DETAILS
      pdf.setTextColor(15, 23, 42); // Dark slate (#0f172a)
      const detailsX = xStart + 60;
      let textY = currentY + 5;

      pdf.setFontSize(18);
      pdf.text(this.profile.name || 'Unknown', detailsX, textY);
      
      textY += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`ID: ${this.profile.id}`, detailsX, textY);
      
      textY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text(this.role.toUpperCase(), detailsX, textY);

      currentY += 50;

      // 5️⃣ ADD OTHER DETAILS (Department, etc.)
      pdf.setDrawColor(241, 245, 249);
      pdf.line(xStart + 10, currentY, xStart + pageWidth - 10, currentY);
      currentY += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100);
      pdf.text('Department:', xStart + 10, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      pdf.text(this.profile.department || 'N/A', xStart + 40, currentY);

      if (this.profile.batch) {
        currentY += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100);
        pdf.text('Batch:', xStart + 10, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(this.profile.batch, xStart + 40, currentY);
      }

      currentY += 15;

      // 6️⃣ ADD QR CODE (EXTRACT FROM PAGE CANVAS)
      try {
        const qrCanvas = document.querySelector('canvas');
        if (qrCanvas) {
          const qrData = qrCanvas.toDataURL('image/png');
          const qrSize = 45;
          pdf.addImage(qrData, 'PNG', (pdfWidth - qrSize) / 2, currentY, qrSize, qrSize);
          currentY += qrSize + 10;
        }
      } catch (qrErr) {
        console.warn('QR Code extraction failed:', qrErr);
      }

      // 7️⃣ FOOTER & BRANDING
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text('Generated via Official Digital ID Portal', pdfWidth / 2, currentY + 10, { align: 'center' });
      pdf.text(`Document Ref: ${this.profile.id}-${Date.now()}`, pdfWidth / 2, currentY + 15, { align: 'center' });

      // 🏁 FINISH & DOWNLOAD
      const fileName = `DigitalID_${this.profile.name?.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      console.log('PDF Export: Manual Assembly Success');

    } catch (error: any) {
      console.error('Manual PDF Error:', error);
      alert(`Export Failed: ${error.message || 'System error during assembly'}. Please try again.`);
    } finally {
      this.isLoading = false;
    }
  }

}