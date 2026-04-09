import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { cardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class SplashPage implements OnInit {

  progress = 0;

  constructor(private router: Router) {
    addIcons({
      'card-outline': cardOutline
    });
  }

  ngOnInit() {

    // simple progress animation (no blocking logic)
    const interval = setInterval(() => {
      if (this.progress < 90) {
        this.progress += 10;
      }
    }, 100);

    // ✅ MAIN LOGIC (NO FREEZE)
    setTimeout(() => {

      clearInterval(interval);
      this.progress = 100;

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      console.log('SPLASH:', { token, role });

      if (token) {
        if (role === 'admin') {
          this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
        }
      } else {
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }

    }, 1500);

  }

}
