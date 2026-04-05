export interface User {
  id: string;
  name: string;
  role: 'Student' | 'Employee';
  department: string;
  batch?: string;
  email: string;
  phone: string;
  isActive: boolean;
}
