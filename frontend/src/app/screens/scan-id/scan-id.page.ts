import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { environment } from '../../../environments/environment';

import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  shieldCheckmark,
  alertCircle,
  checkmark,
  close,
  closeCircle,
  flashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-scan-id',
  templateUrl: './scan-id.page.html',
  styleUrls: ['./scan-id.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton,
    ZXingScannerModule
  ]
})
export class ScanIdPage {

  scanResult: any = null;
  verification: string = '';
  scanned = false;
  role: string = '';
  allowedFormats = [ BarcodeFormat.QR_CODE ];

  constructor(private http: HttpClient) {

    addIcons({
      qrCodeOutline,
      shieldCheckmark,
      alertCircle,
      checkmark,
      close,
      closeCircle,
      flashOutline
    });

  }

  ionViewWillEnter() {

    this.role = localStorage.getItem('role') || '';

    // ❌ BLOCK STUDENTS
    if (this.role === 'Student') {
      alert('❌ Students cannot access scanner');
      window.history.back();
      return;
    }

  }

  onCodeResult(result: string) {

    if (this.scanned) return;

    this.scanned = true;

    const token = localStorage.getItem('token');
    const scannerRole = localStorage.getItem('role');

    this.http.post(`${environment.apiUrl}/id/verify-qr`, {
      token: result
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({

      next: (res: any) => {

        // 🚨 EMPLOYEE RESTRICTION
        if (scannerRole === 'Employee' && res.role !== 'Student') {

          this.verification = "❌ NOT ALLOWED (ONLY STUDENTS)";
          this.scanResult = null;

          this.resetScanner();
          return;
        }

        // ✅ ADMIN → NO RESTRICTION

        this.scanResult = res;

        if (res.valid) {
          this.verification = "VALID";
        } else {
          this.verification = res.message || "INVALID";
        }

        this.resetScanner();
      },

      error: () => {
        this.verification = "VERIFICATION FAILED";
        this.resetScanner();
      }

    });

  }

  resetScanner() {
    // Only reset scan lock so scanner can detect again after user dismisses the result
    // The result stays on screen until the user clicks "Scan Another"
  }

  dismissResult() {
    this.scanResult = null;
    this.verification = '';
    this.scanned = false;
  }

  /* Department short code */

  getDeptCode(dept: string){

    const map:any = {

      "Computer Science and Engineering":"CSE",
      "Electronics and Communication Engineering":"ECE",
      "Mechanical Engineering":"MECH",
      "Civil Engineering":"CIV",
      "Electrical and Electronics Engineering":"EEE",
      "Information Technology":"IT",
      "Artificial Intelligence and Machine Learning":"AIML",
      "Artificial Intelligence and Data Science":"AIDS",
      "Aeronautical Engineering":"AERO",
      "Biotechnology":"BIO",
      "Textile Technology":"TEXT"
    };

    return map[dept] || dept;

  }

}