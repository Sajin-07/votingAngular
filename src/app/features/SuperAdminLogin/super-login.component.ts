// super-login.component.ts

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SuperAdminService } from '../../core/services/super-admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, // Replaces BrainCircuit for standard loading
  ArrowLeft 
} from 'lucide-angular';

@Component({
  selector: 'app-super-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  template: `
    <div
      class="min-h-screen text-white flex items-center justify-center font-sans relative overflow-hidden select-none"
      [style.background]="'radial-gradient(circle at 24.1% 68.8%, rgb(50, 50, 50) 0%, rgb(0, 0, 0) 99.4%)'"
    >
      <a 
        routerLink="/" 
        class="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 text-[#A1A1A1] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-lg backdrop-blur-md"
        title="Back to Home"
      >
        <lucide-icon 
          [img]="icons.ArrowLeft" 
          class="w-6 h-6 group-hover:-translate-x-1 transition-transform"
        ></lucide-icon>
      </a>

      <div class="absolute inset-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      <div class="w-full max-w-sm p-8 bg-[#00000054] rounded-2xl border border-[#3E3D45] shadow-[0px_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm relative z-10">
        
        <header class="flex flex-col items-center justify-center text-center mb-6 border-b border-white/5 pb-6">
          <img [src]="logoImg" alt="DataSoft Logo" class="h-8 opacity-90 mb-6" /> 
          <div class="relative flex items-center justify-center mb-4">
            <lucide-icon [img]="icons.ShieldCheck" class="w-14 h-14 text-[#529F2D] relative z-10" [strokeWidth]="1.25"></lucide-icon>
            <div class="absolute w-16 h-16 rounded-full bg-[#529F2D] opacity-20"></div>
          </div>
          <div class="flex flex-col">
              <span class="text-sm text-[#A1A1A1] uppercase tracking-wider font-medium">System Administration</span>
              <span class="text-2xl font-bold text-white tracking-tight uppercase mt-1">Super Admin Portal</span>
          </div>
        </header>

        <div *ngIf="errorMessage" class="mb-6 p-3.5 text-sm text-red-300 bg-red-950/30 border border-red-800 rounded-xl text-center">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onLogin()" class="space-y-5">
          
          <div class="space-y-1.5">
            <label class="block text-sm text-[#A1A1A1] font-medium flex items-center gap-2 ml-1">
              <lucide-icon [img]="icons.User" class="w-4 h-4"></lucide-icon> Admin ID
            </label>
            <input
              type="text"
              [(ngModel)]="credentials.adminId"
              name="adminId"
              required
              placeholder="Enter Admin ID"
              class="w-full px-4 py-2.5 bg-[#00000033] border border-[#3E3D45] rounded-xl focus:border-[#529F2D] focus:ring-1 focus:ring-[#529F2D]/30 outline-none text-white placeholder:text-[#707070] transition-colors" 
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm text-[#A1A1A1] font-medium flex items-center gap-2 ml-1">
              <lucide-icon [img]="icons.Lock" class="w-4 h-4"></lucide-icon> Password
            </label>
            <input
              type="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              placeholder="Enter Password"
              class="w-full px-4 py-2.5 bg-[#00000033] border border-[#3E3D45] rounded-xl focus:border-[#529F2D] focus:ring-1 focus:ring-[#529F2D]/30 outline-none text-white placeholder:text-[#707070] transition-colors" 
            />
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading" 
            class="w-full h-auto py-3 mt-4 font-bold text-lg text-white uppercase tracking-wider rounded-xl bg-gradient-to-r from-[#529F2D] to-[#1D3910] shadow-lg flex items-center justify-center gap-3 transition-all duration-200 hover:from-[#62bf36] hover:to-[#264d14] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ng-container *ngIf="isLoading; else btnText">
               Authenticating <lucide-icon [img]="icons.Loader2" class="w-6 h-6 animate-spin"></lucide-icon>
            </ng-container>
            <ng-template #btnText>
               Login <lucide-icon [img]="icons.ArrowRight" class="w-5 h-5 group-hover:translate-x-1"></lucide-icon>
            </ng-template>
          </button>

        </form>

        <div class="mt-8 text-center border-t border-white/5 pt-6">
          <p class="text-xs text-[#707070]">DataSoft Secure Access v2.0</p>
        </div>
      </div>
    </div>
  `
})
export class SuperLoginComponent {
  // Logic from Design 2 preserved
  credentials = { adminId: '', password: '' };
  isLoading = false;
  errorMessage = '';
  
  // Visual assets from Design 1
  logoImg = '/dataSoft.svg';
  readonly icons = { 
    Lock, User, ShieldCheck, ArrowRight, Loader2, ArrowLeft 
  };

  constructor(private api: SuperAdminService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = ''; // Clear previous errors
    
    this.api.login(this.credentials).subscribe({
      next: (res) => {
        // Logic from Design 2
        if (res.success) {
          this.router.navigate(['/super-dashboard']);
        } else {
            // Handle case where success is false but no error thrown
            this.errorMessage = 'Invalid Credentials';
            this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Invalid Credentials';
        this.isLoading = false;
      }
    });
  }
}




//main
// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { SuperAdminService } from '../../core/services/super-admin.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-super-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="login-container">
//       <div class="card">
//         <h2>Super Admin Portal</h2>
//         <form (ngSubmit)="onLogin()">
//           <div class="form-group">
//             <label>Admin ID</label>
//             <input type="text" [(ngModel)]="credentials.adminId" name="adminId" required>
//           </div>
//           <div class="form-group">
//             <label>Password</label>
//             <input type="password" [(ngModel)]="credentials.password" name="password" required>
//           </div>
//           <button type="submit" [disabled]="isLoading">
//             {{ isLoading ? 'Authenticating...' : 'Login' }}
//           </button>
//           <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
//         </form>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f6f8; }
//     .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 350px; }
//     .form-group { margin-bottom: 1rem; }
//     input { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; }
//     button { width: 100%; padding: 10px; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer; }
//     button:disabled { background: #95a5a6; }
//     .error { color: red; font-size: 0.9rem; margin-top: 10px; text-align: center; }
//   `]
// })
// export class SuperLoginComponent {
//   credentials = { adminId: '', password: '' };
//   isLoading = false;
//   errorMessage = '';

//   constructor(private api: SuperAdminService, private router: Router) {}

//   onLogin() {
//     this.isLoading = true;
//     this.api.login(this.credentials).subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.router.navigate(['/super-dashboard']);
//         }
//       },
//       error: (err) => {
//         this.errorMessage = 'Invalid Credentials';
//         this.isLoading = false;
//       }
//     });
//   }
// }