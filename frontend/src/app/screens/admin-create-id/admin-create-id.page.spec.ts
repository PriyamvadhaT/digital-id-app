import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreateIdPage } from './admin-create-id.page';

describe('AdminCreateIdPage', () => {
  let component: AdminCreateIdPage;
  let fixture: ComponentFixture<AdminCreateIdPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
