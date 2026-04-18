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

  saveSession(token: string, role: string, userId: string, username?: string, password?: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('loggedIn', 'true');
    
    if (username && password) {
      localStorage.setItem('offline_user', username.toLowerCase());
      localStorage.setItem('offline_pass', btoa(password)); // Simple obfuscation for offline check
    }

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
    const offUser = localStorage.getItem('offline_user');
    const offPass = localStorage.getItem('offline_pass');
    const offIdToken = localStorage.getItem('offlineIdToken');
    const offQrToken = localStorage.getItem('offlineQrToken');
    const offProfile = localStorage.getItem('offline_profile');
    const role = localStorage.getItem('role'); // ⭐ IMPORTANT
  
    localStorage.clear();
  
    // restore offline essentials
    if (offUser) localStorage.setItem('offline_user', offUser);
    if (offPass) localStorage.setItem('offline_pass', offPass);
    if (offIdToken) localStorage.setItem('offlineIdToken', offIdToken);
    if (offQrToken) localStorage.setItem('offlineQrToken', offQrToken);
    if (offProfile) localStorage.setItem('offline_profile', offProfile);
    if (role) localStorage.setItem('role', role); // ⭐ FIX
  }

  verifyOffline(username: string, password: string): boolean {
    const savedUser = localStorage.getItem('offline_user');
    const savedPass = localStorage.getItem('offline_pass');

    if (!savedUser || !savedPass) return false;

    return username.toLowerCase() === savedUser && btoa(password) === savedPass;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}
