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
          const currentUrl = this.router.url;
          const targetDashboard = (userRole === 'admin') ? '/admin-dashboard' : '/user-dashboard';

          if (currentUrl !== targetDashboard) {
            this.router.navigate([targetDashboard], { replaceUrl: true });
          } else {
            // If already on the target but role still mismatched, fallback to login
            this.auth.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
          return false;
        }
    }

    return true;
  }
}