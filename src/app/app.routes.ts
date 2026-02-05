import { Routes } from '@angular/router';
import { votingGuard } from './core/guards/voting.guard';
import { adminGuard } from './core/guards/admin.guard'; 
import { orgAdminGuard, moderatorGuard, orgUserGuard} from './core/guards/auth-guard';
import { VoterAuthGuard } from './core/guards/voter-auth.guard';
import { LandingComponent } from './features/landing/landing.component';


export const routes: Routes = [
  { 
    path: '', component: LandingComponent 
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'step1', // Login Page
    loadComponent: () => import('./features/step1/step1.component').then(m => m.Step1Component)
    // canActivate: [votingGuard] // Guard checks if already logged in
  },
  {
    path: 'step2',
    loadComponent: () => import('./features/step2/step2.component').then(m => m.Step2Component)
    // canActivate: [VoterAuthGuard] // Checks Auth + Step Logic
  },
  {
    path: 'step3',
    loadComponent: () => import('./features/step3/step3.component').then(m => m.Step3Component)
    // canActivate: [votingGuard]
  },
   {
    path: 'step4',
    loadComponent: () => import('./features/step4/step4.component').then(m => m.Step4Component)
    // canActivate: [votingGuard]
  },

   {
    path: 'vote-result',
    loadComponent: () => import('./features/vote-result/vote-result.component').then(m => m.VoteResultComponent),
    canActivate: [orgAdminGuard]
    // canActivate: [votingGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard] 
  },
  {
    path: 'super-login',
    loadComponent: () => import('./features/SuperAdminLogin/super-login.component').then(m => m.SuperLoginComponent)
  },
  {
    path: 'super-dashboard',
    loadComponent: () => import('./features/super-admin-dashboard/super-admin-dashboard.component').then(m => m.SuperDashboardComponent)
  },
  {
    path: 'org-login',
    loadComponent: () => import('./features/org-admin-login/org-login.component').then(m => m.OrgLoginComponent)
  },
   {
    path: 'org-dashboard',
    loadComponent: () => import('./features/org-admin-dashboard/org-dashboard.component').then(m => m.OrgDashboardComponent),
    canActivate: [orgAdminGuard]
  },
  {
    path: 'mod-dashboard',
    loadComponent: () => import('./features/moderator-dashboard/moderator-dashboard.component').then(m => m.ModeratorDashboardComponent),
    canActivate: [moderatorGuard]
  },
  {
    path: 'add-candidate',
    loadComponent: () => import('./features/add-candidate/add-candidate.component').then(m => m.AddCandidateComponent),
    canActivate: [orgUserGuard]
  },
  {
    path: 'add-voter',
    loadComponent: () => import('./features/add-voter/add-voter.component').then(m => m.AddVoterComponent),
    canActivate: [orgUserGuard]
  },
   {
    path: 'org-settings',
    loadComponent: () => import('./features/org-settings/org-settings.component').then(m => m.OrgSettingsComponent),
    canActivate: [orgAdminGuard]
  },
  ///////////////////////////////////////////////inside org-dashboard///////////////////////////////////////////////

   {
    path: 'all-candidates',
    loadComponent: () => import('./features/org-dashboard-inside/all-candidates/all-candidates.component').then(m => m.AllCandidatesComponent),
    canActivate: [orgAdminGuard]
  },
   {
    path: 'all-voters',
    loadComponent: () => import('./features/org-dashboard-inside/all-voters/all-voters.component').then(m => m.AllVotersComponent),
    canActivate: [orgAdminGuard]
  },
  ////////////////////////////////////////////////////////////
  // ADMIN ROUTES (Protected by adminGuard if you wish)
 
  {
    path: 'qr-generator/:dsId',
    loadComponent: () => import('./features/qr-generator/qr-generator.component').then(m => m.QrGeneratorComponent),
    canActivate: [adminGuard] // <--- PROTECTED
  },
  {
    path: 'verify-qr',
    loadComponent: () => import('./features/verify-qr/verify-qr.component').then(m => m.VerifyQrComponent)
  },
   {
    path: 'qr-verify',
    loadComponent: () => import('./features/qr-verify-landing/qr-verify-landing').then(m => m.QrVerifyLandingComponent)
  },

  {
    path: 'registerEmployee',
    loadComponent: () => import('./features/register-employee/register-employee.component').then(m => m.RegisterEmployeeComponent),
    canActivate: [adminGuard] 
  },
  {
    path: 'registerCandidate',
    loadComponent: () => import('./features/register-candidate/register-candidate.component').then(m => m.RegisterCandidateComponent),
    canActivate: [adminGuard] // <--- PROTECTED
  },
  {
    path: 'adminLogin',
    loadComponent: () => import('./features/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'candidatae-list',
    loadComponent: () => import('./features/candidate-list/candidate-list.component').then(m => m.CandidateListComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register-organization/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./features/payment-status/payment-success.components').then(m => m.PaymentSuccessComponent)
  },
  {
    path: 'fail',
    loadComponent: () => import('./features/payment-status/payment-fail.components').then(m => m.PaymentFailComponent)
  },
  {
    path: 'cancel',
    loadComponent: () => import('./features/payment-status/payment-cancel.components').then(m => m.PaymentCancelComponent)
  },
   {
    path: 'qr-login',
    loadComponent: () => import('./features/qr-login/qr-login.component').then(m => m.QrLoginComponent),
    canActivate: [moderatorGuard] 
  },

  {
    path: '**',
    redirectTo: ''
  }
];
