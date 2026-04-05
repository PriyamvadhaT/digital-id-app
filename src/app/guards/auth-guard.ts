import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    const loggedIn = this.auth.isLoggedIn();

    if (loggedIn) {
      return true;
    }

    // user not logged in → go to login
    this.router.navigate(['/login'], { replaceUrl: true });
    return false;

  }

}