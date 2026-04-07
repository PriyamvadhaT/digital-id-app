import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {

    return this.http.post<any>(`${this.apiUrl}/auth/login`, {
      username,
      password
    });

  }

  saveSession(token: string, role: string, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('loggedIn', 'true');
    this.updateLastCheckin(); // Initial check-in on login
  }

  updateLastCheckin() {
    localStorage.setItem('last_checkin', Date.now().toString());
  }

  isCheckinValid(): boolean {
    const lastCheckin = localStorage.getItem('last_checkin');
    if (!lastCheckin) return false;

    const twelveHours = 12 * 60 * 60 * 1000;
    const timePassed = Date.now() - parseInt(lastCheckin);
    
    return timePassed < twelveHours;
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}