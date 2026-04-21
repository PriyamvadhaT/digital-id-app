import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonItem,
  IonInput,
  IonButton,
  IonModal,
  IonLabel,
  IonCheckbox,
  IonSearchbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  peopleOutline,
  searchOutline,
  personCircleOutline,
  createOutline,
  powerOutline,
  trashOutline,
  filterOutline,
  chevronBackOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-employees',
  templateUrl: './admin-employees.page.html',
  styleUrls: ['./admin-employees.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonItem,
    IonInput,
    IonButton,
    IonModal,
    IonLabel,
    IonCheckbox,
    IonSearchbar
  ]
})
export class AdminEmployeesPage {

  employees: any[] = [];
  searchText: string = '';
  editingEmployee: any = null;

  sortDepartment = false;
  sortId = false;
  sortName = false;

  isSortModalOpen = false;
  isEditModalOpen = false;

  baseUrl = `${environment.apiUrl}/id`;

  constructor(private http: HttpClient) {

    addIcons({
      peopleOutline,
      searchOutline,
      personCircleOutline,
      createOutline,
      powerOutline,
      trashOutline,
      filterOutline,
      chevronBackOutline,
      closeOutline
    });

  }

  ionViewWillEnter() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<any[]>(`${this.baseUrl}/employees` , this.getHeaders())
      .subscribe(data => this.employees = data);
  }

  getDeptCode(dept: string){

    const map:any = {

      "Computer Science and Engineering": "CSE",
      "Electronics and Communication Engineering": "ECE",
      "Mechanical Engineering": "MECH",
      "Civil Engineering": "CIVIL",
      "Electrical and Electronics Engineering": "EEE",
      "Information Technology": "IT",
      "Artificial Intelligence and Machine Learning": "AIML",
      "Artificial Intelligence and Data Science": "AIDS",
      "Aeronautical/Aerospace Engineering": "AERO",
      "Biotechnology": "BIO",
      "Textile Technology/Engineering": "TEXT"

    };

    return map[dept] || dept;

  }

  filteredEmployees() {

    let list = [...this.employees];

    /* SEARCH */

    if (this.searchText) {

      const text = this.searchText.toLowerCase();

      list = list.filter(employee =>
        employee.name?.toLowerCase().includes(text) ||
        employee.department?.toLowerCase().includes(text) ||
        employee.id?.toLowerCase().includes(text)
      );

    }

    /* MULTI SORTING */

    list.sort((a,b) => {

      if (this.sortDepartment) {
        const r = (a.department || '').localeCompare(b.department || '');
        if (r !== 0) return r;
      }

      if (this.sortId) {
        const r = (a.id || '').localeCompare(b.id || '');
        if (r !== 0) return r;
      }

      if (this.sortName) {
        const r = (a.name || '').localeCompare(b.name || '');
        if (r !== 0) return r;
      }

      return 0;

    });

    return list;

  }

  toggleStatus(employee: any) {

    this.http.patch(
      `${this.baseUrl}/employee/${employee._id}/status`,
      { isActive: !employee.isActive }, this.getHeaders()
    ).subscribe(() => {

      employee.isActive = !employee.isActive;

      this.loadEmployees();

    });

  }

  deleteEmployee(id: string) {

    if (!confirm('Delete this employee?')) return;

    this.http.delete(`${this.baseUrl}/employee/${id}`, this.getHeaders())
      .subscribe(() => this.loadEmployees());

  }

  editEmployee(emp:any){
    this.editingEmployee = {...emp};
  }

  updateEmployee(){

    this.http.put(
      `${this.baseUrl}/employee/${this.editingEmployee._id}`,
      this.editingEmployee, this.getHeaders()
    ).subscribe(()=>{

      alert("Employee updated");

      this.editingEmployee = null;

      this.loadEmployees();

    });

  }

  cancelEdit(){
    this.editingEmployee = null;
  }

  getHeaders() {
    return {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    };
  }

}
