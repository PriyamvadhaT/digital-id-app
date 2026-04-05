import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.apiUrl}/api/id`;

  constructor(private http: HttpClient) {}

  /* ================= READ ================= */

  getStudents() {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  getEmployees() {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
  }

  /* ================= UPDATE STATUS ================= */

  toggleStudentStatus(student: any) {
    return this.http.patch(
      `${this.baseUrl}/student/${student._id}/status`,
      { isActive: !student.isActive }
    );
  }

  toggleEmployeeStatus(employee: any) {
    return this.http.patch(
      `${this.baseUrl}/employee/${employee._id}/status`,
      { isActive: !employee.isActive }
    );
  }

  /* ================= DELETE ================= */

  deleteStudent(studentId: string) {
    return this.http.delete(
      `${this.baseUrl}/student/${studentId}`
    );
  }

  deleteEmployee(employeeId: string) {
    return this.http.delete(
      `${this.baseUrl}/employee/${employeeId}`
    );
  }
}