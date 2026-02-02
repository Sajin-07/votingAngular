import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { 
  LucideAngularModule, 
  Building2, // Icon for Tenant/Org
  User, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-angular';

@Component({
  selector: 'app-org-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './org-login.component.html',
  styleUrls: ['./org-login.component.css']
})
export class OrgLoginComponent {
  // Visual Assets
  logoImg = '/dataSoft.svg';
  readonly icons = { 
    Building2, User, Lock, ArrowRight, Loader2, ArrowLeft, ShieldCheck, AlertCircle 
  };

  // Logic State
  loginData = {
    tenantId: '',
    adminId: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;

    // Validate input
    if (!this.loginData.tenantId || !this.loginData.adminId || !this.loginData.password) {
      this.errorMessage = 'All fields are required';
      this.isLoading = false;
      return;
    }

    // Call login API
    this.http.post<any>('http://localhost:3000/api/auth/admin-login', this.loginData, {
      withCredentials: true // Important for cookies
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // After successful login, get user role to route correctly
        this.checkRoleAndRedirect();
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }

  private checkRoleAndRedirect() {
    // Check authentication status to get role
    this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
      withCredentials: true
    }).subscribe({
      next: (status) => {
        console.log('User status:', status);
        
        // Route based on role
        if (status.role === 'ORG_ADMIN' || status.role === 'tenant_admin') {
          this.router.navigate(['/org-dashboard']);
        } else if (status.role === 'MODERATOR') {
          this.router.navigate(['/mod-dashboard']);
        } else if (status.role === 'super_admin') {
          // If super admin accidentally uses this page
          this.router.navigate(['/super-dashboard']);
        } else {
          this.errorMessage = 'Unknown role. Please contact support.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Failed to get user status:', error);
        this.errorMessage = 'Authentication failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}




// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-org-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './org-login.component.html',
//   styleUrls: ['./org-login.component.css']
// })
// export class OrgLoginComponent {
//   loginData = {
//     tenantId: '',
//     adminId: '',
//     password: ''
//   };

//   errorMessage = '';
//   isLoading = false;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   onSubmit() {
//     this.errorMessage = '';
//     this.isLoading = true;

//     // Validate input
//     if (!this.loginData.tenantId || !this.loginData.adminId || !this.loginData.password) {
//       this.errorMessage = 'All fields are required';
//       this.isLoading = false;
//       return;
//     }

//     // Call login API
//     this.http.post<any>('http://localhost:3000/api/auth/admin-login', this.loginData, {
//       withCredentials: true // Important for cookies
//     }).subscribe({
//       next: (response) => {
//         console.log('Login successful:', response);
        
//         // After successful login, get user role to route correctly
//         this.checkRoleAndRedirect();
//       },
//       error: (error) => {
//         console.error('Login failed:', error);
//         this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
//         this.isLoading = false;
//       }
//     });
//   }

//   private checkRoleAndRedirect() {
//     // Check authentication status to get role
//     this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
//       withCredentials: true
//     }).subscribe({
//       next: (status) => {
//         console.log('User status:', status);
        
//         // Route based on role
//         if (status.role === 'ORG_ADMIN' || status.role === 'tenant_admin') {
//           this.router.navigate(['/org-dashboard']);
//         } else if (status.role === 'MODERATOR') {
//           this.router.navigate(['/mod-dashboard']);
//         } else if (status.role === 'super_admin') {
//           // If super admin accidentally uses this page
//           this.router.navigate(['/super-dashboard']);
//         } else {
//           this.errorMessage = 'Unknown role. Please contact support.';
//           this.isLoading = false;
//         }
//       },
//       error: (error) => {
//         console.error('Failed to get user status:', error);
//         this.errorMessage = 'Authentication failed. Please try again.';
//         this.isLoading = false;
//       }
//     });
//   }
// }