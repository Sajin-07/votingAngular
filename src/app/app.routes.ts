import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'step1',
    loadComponent: () => import('./features/step1/step1.component').then(m => m.Step1Component)
  },
  {
    path: 'step2',
    loadComponent: () => import('./features/step2/step2.component').then(m => m.Step2Component)
  },
  {
    path: 'step3',
    loadComponent: () => import('./features/step3/step3.component').then(m => m.Step3Component)
  },
  {
    path: 'step4',
    loadComponent: () => import('./features/step4/step4.component').then(m => m.Step4Component)
  },
  {
    path: 'step5',
    loadComponent: () => import('./features/step5/step5.component').then(m => m.Step5Component)
  },
  {
    path: 'registerEmployee',
    loadComponent: () => import('./features/register-employee/register-employee.component').then(m => m.RegisterEmployeeComponent)
  },
  {
    path: 'adminLogin',
    loadComponent: () => import('./features/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
