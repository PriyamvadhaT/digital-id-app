import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.apiUrl}/id`;

  constructor(private http: HttpClient) { }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  getStudents() {
    return this.http.get<any[]>(`${this.baseUrl}/students`, this.getHeaders());
  }

  getEmployees() {
    return this.http.get<any[]>(`${this.baseUrl}/employees`, this.getHeaders());
  }

  toggleStudentStatus(student: any) {
    return this.http.patch(
      `${this.baseUrl}/student/${student._id}/status`,
      { isActive: !student.isActive },
      this.getHeaders()
    );
  }

  toggleEmployeeStatus(employee: any) {
    return this.http.patch(
      `${this.baseUrl}/employee/${employee._id}/status`,
      { isActive: !employee.isActive },
      this.getHeaders()
    );
  }

  deleteStudent(studentId: string) {
    return this.http.delete(
      `${this.baseUrl}/student/${studentId}`,
      this.getHeaders()
    );
  }

  deleteEmployee(employeeId: string) {
    return this.http.delete(
      `${this.baseUrl}/employee/${employeeId}`,
      this.getHeaders()
    );
  }
}
