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
      // 🕒 Ensure all assets are loaded (especially images and QR)
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(data, {
        scale: 2.5, // 🚀 Optimized for both quality and memory
        useCORS: true,
        allowTaint: false, // 🔒 Taint must be false for export to work
        logging: true, // Enable for better debugging if it fails again
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById('id-card-to-export');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = 'none';
            
            // Hide decorative elements that often cause capture artifacts
            const toHide = ['.card-glint', '.card-pattern', '.card-bg-glow', '.avatar-ring'];
            toHide.forEach(selector => {
              const el = clonedCard.querySelector(selector) as HTMLElement;
              if (el) el.style.display = 'none';
            });
            
            // Fix any sizing issues in capture
            clonedCard.style.width = '340px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = 160; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = 30;

      // 🎨 Add Header Branding
      pdf.setFillColor(37, 99, 235); // Blue primary
      pdf.rect(0, 0, pdfWidth, 20, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('OFFICIAL DIGITAL IDENTIFICATION', pdfWidth / 2, 13, { align: 'center' });
      
      // 📄 Add Body Content
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.setFontSize(10);
      pdf.text(`Document Type: Digital ID Card - ${this.role}`, xPos, yPos - 5);
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      
      // 📋 Footer Info
      const footerY = yPos + imgHeight + 15;
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text('This is a verified digital document generated via the Digital ID Portal.', pdfWidth / 2, footerY, { align: 'center' });
      pdf.text(`Generated Date: ${new Date().toLocaleString()}`, pdfWidth / 2, footerY + 5, { align: 'center' });
      pdf.text(`Security Hash: ${btoa(this.profile.id + Date.now()).substring(0, 24)}`, pdfWidth / 2, footerY + 10, { align: 'center' });

      // 🏁 Save File
      const fileName = `DigitalID_${this.profile.name.replace(/\s+/g, '_')}_${this.profile.id}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

}