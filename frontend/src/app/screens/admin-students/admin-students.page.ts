import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  schoolOutline,
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
  selector: 'app-admin-students',
  templateUrl: './admin-students.page.html',
  styleUrls: ['./admin-students.page.scss'],
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
export class AdminStudentsPage {

  students: any[] = [];
  searchText: string = '';
  editingStudent: any = null;

  sortBatch = false;
  sortDepartment = false;
  sortId = false;
  sortName = false;

  isSortModalOpen = false;
  isEditModalOpen = false;

  baseUrl = `${environment.apiUrl}/id`;

  constructor(private http: HttpClient) {

    addIcons({
      schoolOutline,
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
    this.loadStudents();
  }

  loadStudents() {
    this.http.get<any[]>(`${this.baseUrl}/students`, this.getHeaders())
      .subscribe(data => this.students = data);
  }

  /* DEPARTMENT SHORT CODE */

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

  filteredStudents() {

    let list = [...this.students];

    if (this.searchText) {

      const text = this.searchText.toLowerCase();

      list = list.filter(student =>
        student.name?.toLowerCase().includes(text) ||
        student.department?.toLowerCase().includes(text) ||
        student.batch?.toLowerCase().includes(text) ||
        student.id?.toLowerCase().includes(text)
      );

    }

    list.sort((a,b) => {

      if (this.sortBatch) {
        const r = (a.batch || '').localeCompare(b.batch || '');
        if (r !== 0) return r;
      }

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

  toggleStatus(student: any) {

    this.http.patch(
      `${this.baseUrl}/student/${student._id}/status`,
      { isActive: !student.isActive }, this.getHeaders()
    ).subscribe(() => {

      student.isActive = !student.isActive;

    });

  }

  deleteStudent(id: string) {

    if (!confirm('Delete this student?')) return;

    this.http.delete(`${this.baseUrl}/student/${id}`, this.getHeaders())
      .subscribe(() => this.loadStudents());

  }

  editStudent(student:any){
    this.editingStudent = {...student};
  }

  updateStudent(){

    this.http.put(
      `${this.baseUrl}/student/${this.editingStudent._id}`, this.getHeaders(),
      this.editingStudent
    ).subscribe(()=>{

      alert("Student updated");

      this.editingStudent = null;

      this.loadStudents();

    });

  }

  cancelEdit(){
    this.editingStudent = null;
  }

  getHeaders() {
    return {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    };
  }

}