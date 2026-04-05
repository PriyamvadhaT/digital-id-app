import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private router: Router,
    private auth: AuthService
  ) {

    addIcons({
      'card-outline': cardOutline
    });

  }

  ngOnInit() {

    const interval = setInterval(() => {

      if (this.progress < 100) {
        this.progress += 5;
      }

      if (this.progress >= 100) {

        clearInterval(interval);

        const loggedIn = this.auth.isLoggedIn();
        const role = this.auth.getRole();

        if (loggedIn) {

          if (role === 'Admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }

        } else {

          this.router.navigate(['/login']);

        }

      }

    }, 70);

  }

}