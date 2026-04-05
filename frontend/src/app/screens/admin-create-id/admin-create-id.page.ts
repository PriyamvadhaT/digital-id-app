import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personOutline,
  callOutline,
  cameraOutline,
  cloudUploadOutline,
  schoolOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-create-id',
  templateUrl: './admin-create-id.page.html',
  styleUrls: ['./admin-create-id.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonLabel,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton
  ]
})
export class AdminCreateIdPage {

  constructor(private http: HttpClient) {
    addIcons({
      personOutline,
      callOutline,
      cameraOutline,
      cloudUploadOutline,
      schoolOutline
    });
  }

  role: 'Student' | 'Employee' = 'Student';

  previewId = '';
  photo: string = '';
  photoPreview: any;

  form = {
    name: '',
    department: '',
    batch: '',
    course: '',
    email: '',
    phone: '',
    parentMobile: ''
  };

  generatePreview(){

    const deptMap:any = {
      "Computer Science and Engineering":"CSE",
      "Electronics and Communication Engineering":"ECE",
      "Mechanical Engineering":"MECH",
      "Civil Engineering":"CIV",
      "Electrical and Electronics Engineering":"EEE",
      "Information Technology":"IT",
      "Artificial Intelligence and Machine Learning":"AIML",
      "Artificial Intelligence and Data Science":"AIDS",
      "Aeronautical Engineering":"AERO",
      "Biotechnology":"BIO",
      "Textile Technology":"TEXT"
    };

    const dept = deptMap[this.form.department];

    if(!dept) return;

    if(this.role === 'Employee'){
      this.previewId = dept + "001";
      return;
    }

    if(!this.form.batch || !this.form.course){
      this.previewId = '';
      return;
    }

    const batch = this.form.batch.slice(2,4);

    const courseCode =
      this.form.course === "Bachelor of Engineering"
      ? "1"
      : "2";

    this.previewId = dept + batch + courseCode + "001";
  }

  onFileSelected(event: any) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      this.photo = base64.split(',')[1];
      this.photoPreview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  submit() {

    const url =
      this.role === 'Student'
        ? `${environment.apiUrl}/id/student`
        : `${environment.apiUrl}/id/employee`;

    const payload: any = {
      name: this.form.name,
      department: this.form.department,
      email: this.form.email,
      phone: this.form.phone,
      photo: this.photo   
    };

    if (this.role === 'Student') {
      payload.batch = this.form.batch;
      payload.course = this.form.course;
      payload.parentMobile = this.form.parentMobile;
    }

    this.http.post<any>(url, payload , this.getHeaders()).subscribe({
      next: (res) => {

        alert(
          `ID Created Successfully\n\nID: ${res.generatedId || res.studentId}\n\nUsername: ${res.username}\nPassword: ${res.password}`
        );

        this.previewId = '';

        this.form = {
          name: '',
          department: '',
          batch: '',
          course: '',
          email: '',
          phone: '',
          parentMobile: ''
        };

      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create ID');
      }
    });
  }

  getHeaders() {
    return {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    };
  }
}