import { Injectable } from '@angular/core';

export interface DigitalId {
  name: string;
  id: string;
  role: 'Student' | 'Employee';
  department: string;
  batch?: string;
  email: string;
  phone: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IdService {

  constructor() {}

  // 🔹 ADMIN: get all users
  getAllUsers(): DigitalId[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  // 🔹 ADMIN: add new user
  addUser(user: DigitalId) {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  // 🔹 ADMIN: update active/inactive
  updateUser(updatedUser: DigitalId) {
    const users = this.getAllUsers().map(u =>
      u.id === updatedUser.id ? updatedUser : u
    );
    localStorage.setItem('users', JSON.stringify(users));
  }

  // 🔹 USER: store logged-in user
  setDigitalId(user: DigitalId) {
    localStorage.setItem('digitalId', JSON.stringify(user));
  }

  // 🔹 USER: get logged-in user
  getDigitalId(): DigitalId | null {
    const stored = localStorage.getItem('digitalId');
    return stored ? JSON.parse(stored) : null;
  }

  clearDigitalId() {
    localStorage.removeItem('digitalId');
  }
}
