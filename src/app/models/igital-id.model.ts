export interface DigitalId {
  id: string;
  name: string;
  role: 'student' | 'employee';
  department: string;
  batch?: string;       // only for students
  address: string;
  phone: string;
  email: string;
  isActive: number;
}
