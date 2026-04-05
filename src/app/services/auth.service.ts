import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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