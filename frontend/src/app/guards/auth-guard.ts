import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const loggedIn = this.auth.isLoggedIn();
    const userRole = this.auth.getRole()?.toLowerCase(); // admin, student, employee
    const isOnline = navigator.onLine;

    // 🔒 SECURITY: block if offline and check-in expired
    if (!isOnline && !this.auth.isCheckinValid()) {
      alert('Security Check Required: Please connect to the internet.');
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // ❌ NOT LOGGED IN
    if (!loggedIn) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // ✅ IMPORTANT FIX: allow offline users even without token
    const token = localStorage.getItem('token');
    if (!token && !isOnline) {
      const hasOffline = localStorage.getItem('offline_user') && localStorage.getItem('offline_profile');
      return !!hasOffline;
    }

    // 🔐 ROLE CHECK
    const expectedRole = route.data['role'];

    if (expectedRole) {

      const hasRole = Array.isArray(expectedRole)
        ? expectedRole.includes(userRole)
        : userRole === expectedRole;

      if (!hasRole) {
        this.router.navigate(['/login'], { replaceUrl: true });
        return false;
      }
    }

    return true;
  }
}
