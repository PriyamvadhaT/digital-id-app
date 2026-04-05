import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { LoginGuard } from './guards/login-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },

  {
    path: 'splash',
    loadComponent: () =>
      import('./screens/splash/splash.page').then(m => m.SplashPage)
  },

  {
    path: 'login',
    canActivate: [LoginGuard],
    loadComponent: () =>
      import('./screens/login/login.page').then(m => m.LoginPage),
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./screens/forgot-password/forgot-password.page')
      .then(m => m.ForgotPasswordPage)
  },

  /* ADMIN */

  {
    path: 'admin-dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/admin-dashboard/admin-dashboard.page')
      .then(m => m.AdminDashboardPage)
  },

  {
    path: 'admin-create-id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/admin-create-id/admin-create-id.page')
      .then(m => m.AdminCreateIdPage)
  },

  {
    path: 'admin-students',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/admin-students/admin-students.page')
      .then(m => m.AdminStudentsPage)
  },

  {
    path: 'admin-employees',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/admin-employees/admin-employees.page')
      .then(m => m.AdminEmployeesPage)
  },

  /* USER */

  {
    path: 'user-dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/user-dashboard/user-dashboard.page')
      .then(m => m.UserDashboardPage)
  },

  {
    path: 'id-card',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/id-card/id-card.page')
      .then(m => m.IdCardPage)
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/change-password/change-password.page')
      .then(m => m.ChangePasswordPage)
  },
  {
    path: 'scan-id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./screens/scan-id/scan-id.page').then(m => m.ScanIdPage)
  },
  {
    path: 'logs',
    canActivate: [AuthGuard],
    loadComponent: () => import('./screens/logs/logs.page').then( m => m.LogsPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }

];