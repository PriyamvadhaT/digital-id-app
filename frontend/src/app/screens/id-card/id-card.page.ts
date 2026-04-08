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
      console.log('PDF Export: High-Fidelity Capture Start...');
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const canvas = await html2canvas(data, {
        scale: 2, // 🛡️ Balanced for quality and memory
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#f8fafc',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('id-card-to-export');
          if (card) {
            // 🛡️ PRESERVE FIDELITY: Keep shadows and layout
            // Only stop animations to prevent blurred capture
            card.style.animation = 'none';
            card.style.transition = 'none';
            
            // Fix Ionic Icons for Canvas capture (Shadow DOM workaround)
            const icons = card.querySelectorAll('ion-icon');
            icons.forEach(icon => {
              const name = icon.getAttribute('name');
              const span = clonedDoc.createElement('span');
              // Use high-quality symbols that render well in Canvas
              if (name?.includes('shield')) {
                span.innerHTML = '🛡️';
                span.style.color = '#6366f1';
              } else if (name?.includes('download')) {
                span.innerHTML = '⬇️';
              } else {
                span.innerHTML = '✓';
                span.style.color = '#22c55e';
              }
              span.style.fontSize = '20px';
              span.style.display = 'inline-flex';
              span.style.alignItems = 'center';
              span.style.justifyContent = 'center';
              icon.parentNode?.replaceChild(span, icon);
            });

            // Maintain dimensions
            card.style.width = '350px';
            card.style.margin = '0 auto';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 0.9);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgWidth = 170; // Larger for high-fidelity look
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = 20;

      // 📄 Add the high-fidelity capture to PDF
      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      
      // 📋 Minimalist Footer
      pdf.setFontSize(8);
      pdf.setTextColor(180);
      pdf.text(`Official Digital ID - Generated on ${new Date().toLocaleDateString()}`, pdfWidth / 2, yPos + imgHeight + 10, { align: 'center' });

      pdf.save(`DigitalID_${this.profile.name?.replace(/\s+/g, '_')}.pdf`);
      console.log('PDF Export: Success');

    } catch (error: any) {
      console.error('High-Fidelity Export Error:', error);
      alert('Failed to generate high-quality PDF. Please try again or ensure you are using a modern browser.');
    } finally {
      this.isLoading = false;
    }
  }

}