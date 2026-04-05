import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEmployeesPage } from './admin-employees.page';

describe('AdminEmployeesPage', () => {
  let component: AdminEmployeesPage;
  let fixture: ComponentFixture<AdminEmployeesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEmployeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
