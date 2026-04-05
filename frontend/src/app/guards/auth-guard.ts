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

    if (!loggedIn) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // Role Check
    const expectedRole = route.data['role']; // e.g. 'admin' or ['student', 'employee']

    if (expectedRole) {

      const hasRole = Array.isArray(expectedRole) 
        ? expectedRole.includes(userRole) 
        : userRole === expectedRole;

      if (!hasRole) {
        // Unauthorized Role → go to their respective dashboard
        if (userRole === 'admin') {
          this.router.navigate(['/admin-dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/user-dashboard'], { replaceUrl: true });
        }
        return false;
      }
    }

    return true;
  }
}