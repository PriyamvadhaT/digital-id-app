import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    const loggedIn = this.auth.isLoggedIn();
    const role = this.auth.getRole()?.toLowerCase();
    const isOnline = navigator.onLine;
    const token = localStorage.getItem('token');

    // ✅ If already logged in
    if (loggedIn) {

      // ✅ Allow offline users even without token
      if (!token && !isOnline) {
        return false; // block login page
      }

      // 🔁 Redirect properly
      if (role === 'admin') {
        this.router.navigate(['/admin-dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/user-dashboard'], { replaceUrl: true });
      }

      return false;
    }

    return true;
  }

}
