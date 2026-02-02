// admin-login.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  LucideAngularModule, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  Fingerprint, 
  ArrowLeft 
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  readonly icons = { 
    Lock, User, ShieldCheck, ArrowRight, 
    BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft 
  };
  logoImg = '/dataSoft.svg';

  // Form State
  adminId = '';
  password = '';
  loading = false;
  error = '';

  // Mining Animation State
  miningProgress = 0;
  isMining = false;
  isMined = false;
  currentHash = '0x0000000000000000';
  
  private mineInterval: any;
  private hashInterval: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startHashGenerator();
    
    // FIXED: Remove the automatic redirect check on init
    // This was causing premature /admin-status calls
    // The guard will handle authentication checks during navigation
  }

  ngOnDestroy() {
    this.clearAllIntervals();
  }

  // --- VISUAL EFFECTS ---
  startHashGenerator() {
    this.hashInterval = setInterval(() => {
      if (this.isMining && !this.isMined) {
        const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        this.currentHash = `0x${randomHex}...`;
        this.cdr.detectChanges();
      } else if (this.isMined) {
        this.currentHash = '0xSUCCESS_VERIFIED';
        this.cdr.detectChanges();
      } else {
        this.currentHash = '0xWAITING_FOR_MINER';
        this.cdr.detectChanges();
      }
    }, 50);
  }

  startMining() {
    if (this.isMined) return;
    this.isMining = true;
    
    this.mineInterval = setInterval(() => {
      if (this.miningProgress >= 100) {
        this.finishMining();
      } else {
        this.miningProgress += 2; 
        this.cdr.detectChanges();
      }
    }, 30);
  }

  stopMining() {
    if (this.isMined) return;
    this.isMining = false;
    this.miningProgress = 0; 
    clearInterval(this.mineInterval);
    this.cdr.detectChanges();
  }

  finishMining() {
    clearInterval(this.mineInterval);
    this.isMined = true;
    this.isMining = false;
    this.miningProgress = 100;
    this.cdr.detectChanges();
  }

  clearAllIntervals() {
    if (this.mineInterval) clearInterval(this.mineInterval);
    if (this.hashInterval) clearInterval(this.hashInterval);
  }

  // --- LOGIN ---
  handleLogin(event: Event) {
    event.preventDefault();
    this.error = '';

    // Validate mining requirement
    if (!this.isMined) {
      this.error = 'Proof of Work Required: Please mine the block first.';
      return;
    }

    // Validate inputs
    if (!this.adminId.trim() || !this.password.trim()) {
      this.error = 'Please enter both Admin ID and Password';
      return;
    }

    this.loading = true;

    // Call backend (will set HTTP-only cookie if successful)
    this.authService.loginAdmin(this.adminId, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        
        if (success) {
          console.log('✅ Login Successful - Cookie Set');
          
          // FIXED: Small delay to ensure cookie is set before navigation
          // This prevents the guard from checking before the cookie exists
          setTimeout(() => {
            const returnUrl = this.authService.getAdminReturnUrl();
            if (returnUrl) {
              this.authService.clearAdminReturnUrl();
              this.router.navigateByUrl(returnUrl);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 100); // 100ms delay ensures cookie propagation
        } else {
          this.handleLoginError();
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Login Error:', err);
        this.loading = false;
        this.handleLoginError();
        this.cdr.detectChanges();
      }
    });
  }

  private handleLoginError() {
    this.error = 'Invalid Credentials. Blockchain rejected access.';
    // Reset mining state to force re-mine
    this.isMined = false;
    this.miningProgress = 0;
  }
}



// // admin-login.component.ts
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { 
//   LucideAngularModule, 
//   Lock, 
//   User, 
//   ShieldCheck, 
//   ArrowRight, 
//   BrainCircuit, 
//   CheckCircle2, 
//   Fingerprint, 
//   ArrowLeft 
// } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-admin-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
//   templateUrl: './admin-login.component.html',
//   styleUrls: ['./admin-login.component.css']
// })
// export class AdminLoginComponent implements OnInit, OnDestroy {
//   readonly icons = { 
//     Lock, User, ShieldCheck, ArrowRight, 
//     BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft 
//   };
//   logoImg = '/dataSoft.svg';

//   // Form State
//   adminId = '';
//   password = '';
//   loading = false;
//   error = '';

//   // Mining Animation State
//   miningProgress = 0;
//   isMining = false;
//   isMined = false;
//   currentHash = '0x0000000000000000';
  
//   private mineInterval: any;
//   private hashInterval: any;

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.startHashGenerator();
    
//     // Check if already authenticated via server
//     this.authService.isAdminAuthenticated().subscribe(isAuth => {
//       if (isAuth) {
//         console.log('✅ Already authenticated - redirecting');
//         const returnUrl = this.authService.getAdminReturnUrl();
//         if (returnUrl) {
//           this.authService.clearAdminReturnUrl();
//           this.router.navigateByUrl(returnUrl);
//         } else {
//           this.router.navigate(['/dashboard']);
//         }
//       }
//     });
//   }

//   ngOnDestroy() {
//     this.clearAllIntervals();
//   }

//   // --- VISUAL EFFECTS ---
//   startHashGenerator() {
//     this.hashInterval = setInterval(() => {
//       if (this.isMining && !this.isMined) {
//         const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
//         this.currentHash = `0x${randomHex}...`;
//         this.cdr.detectChanges();
//       } else if (this.isMined) {
//         this.currentHash = '0xSUCCESS_VERIFIED';
//         this.cdr.detectChanges();
//       } else {
//         this.currentHash = '0xWAITING_FOR_MINER';
//         this.cdr.detectChanges();
//       }
//     }, 50);
//   }

//   startMining() {
//     if (this.isMined) return;
//     this.isMining = true;
    
//     this.mineInterval = setInterval(() => {
//       if (this.miningProgress >= 100) {
//         this.finishMining();
//       } else {
//         this.miningProgress += 2; 
//         this.cdr.detectChanges();
//       }
//     }, 30);
//   }

//   stopMining() {
//     if (this.isMined) return;
//     this.isMining = false;
//     this.miningProgress = 0; 
//     clearInterval(this.mineInterval);
//     this.cdr.detectChanges();
//   }

//   finishMining() {
//     clearInterval(this.mineInterval);
//     this.isMined = true;
//     this.isMining = false;
//     this.miningProgress = 100;
//     this.cdr.detectChanges();
//   }

//   clearAllIntervals() {
//     if (this.mineInterval) clearInterval(this.mineInterval);
//     if (this.hashInterval) clearInterval(this.hashInterval);
//   }

//   // --- LOGIN ---
//   handleLogin(event: Event) {
//     event.preventDefault();
//     this.error = '';

//     // Validate mining requirement
//     if (!this.isMined) {
//       this.error = 'Proof of Work Required: Please mine the block first.';
//       return;
//     }

//     // Validate inputs
//     if (!this.adminId.trim() || !this.password.trim()) {
//       this.error = 'Please enter both Admin ID and Password';
//       return;
//     }

//     this.loading = true;

//     // Call backend (will set HTTP-only cookie if successful)
//     this.authService.loginAdmin(this.adminId, this.password).subscribe({
//       next: (success) => {
//         this.loading = false;
        
//         if (success) {
//           console.log('✅ Login Successful - Cookie Set');
          
//           // Navigate to return URL or dashboard
//           const returnUrl = this.authService.getAdminReturnUrl();
//           if (returnUrl) {
//             this.authService.clearAdminReturnUrl();
//             this.router.navigateByUrl(returnUrl);
//           } else {
//             this.router.navigate(['/dashboard']);
//           }
//         } else {
//           this.handleLoginError();
//         }
        
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         console.error('❌ Login Error:', err);
//         this.loading = false;
//         this.handleLoginError();
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   private handleLoginError() {
//     this.error = 'Invalid Credentials. Blockchain rejected access.';
//     // Reset mining state to force re-mine
//     this.isMined = false;
//     this.miningProgress = 0;
//   }
// }




















// //admin-login.component.ts JAN 13
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { LucideAngularModule, Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-admin-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink],
//   templateUrl: './admin-login.component.html',
//   styleUrls: ['./admin-login.component.css']
// })
// export class AdminLoginComponent implements OnInit, OnDestroy {
//   // --- ASSETS ---
//   readonly icons = { Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft };
//   logoImg = '/dataSoft.svg';

//   // --- STATE ---
//   adminId = '';
//   password = '';
//   loading = false;
//   error = '';

//   // --- "Hold to Mine" Logic ---
//   miningProgress = 0;
//   isMining = false;
//   isMined = false;
//   currentHash = '0x0000000000000000';
  
//   private mineInterval: any;
//   private hashInterval: any;

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.startHashGenerator();
    
//     // If already logged in, redirect to return URL or dashboard
//     if (this.authService.isAdminLoggedIn()) {
//       const returnUrl = this.authService.getAdminReturnUrl();
//       if (returnUrl) {
//         this.authService.clearAdminReturnUrl();
//         this.router.navigateByUrl(returnUrl);
//       } else {
//         this.router.navigate(['/dashboard']);
//       }
//     }
//   }

//   ngOnDestroy() {
//     this.clearAllIntervals();
//   }

//   // --- HASH GENERATOR (Visual Effect) ---
//   startHashGenerator() {
//     this.hashInterval = setInterval(() => {
//       if (this.isMining && !this.isMined) {
//         const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
//         this.currentHash = `0x${randomHex}...`;
//         this.cdr.detectChanges();
//       } else if (this.isMined) {
//         this.currentHash = '0xSUCCESS_VERIFIED';
//         this.cdr.detectChanges();
//       } else {
//         this.currentHash = '0xWAITING_FOR_MINER';
//         this.cdr.detectChanges();
//       }
//     }, 50);
//   }

//   // --- MINING ACTIONS ---
//   startMining() {
//     if (this.isMined) return;
//     this.isMining = true;
    
//     this.mineInterval = setInterval(() => {
//       if (this.miningProgress >= 100) {
//         this.finishMining();
//       } else {
//         this.miningProgress += 2; 
//         this.cdr.detectChanges();
//       }
//     }, 30);
//   }

//   stopMining() {
//     if (this.isMined) return;
//     this.isMining = false;
//     this.miningProgress = 0; 
//     clearInterval(this.mineInterval);
//     this.cdr.detectChanges();
//   }

//   finishMining() {
//     clearInterval(this.mineInterval);
//     this.isMined = true;
//     this.isMining = false;
//     this.miningProgress = 100;
//     this.cdr.detectChanges();
//   }

//   clearAllIntervals() {
//     if (this.mineInterval) clearInterval(this.mineInterval);
//     if (this.hashInterval) clearInterval(this.hashInterval);
//   }

//   // --- LOGIN ---
//   handleLogin(event: Event) {
//     event.preventDefault();
//     this.error = '';

//     if (!this.isMined) {
//       this.error = 'Proof of Work Required: Please mine the block first.';
//       return;
//     }

//     this.loading = true;

//     this.authService.loginAdmin(this.adminId, this.password).subscribe({
//       next: (success) => {
//         this.loading = false;
//         if (success) {
//           console.log('Login Successful');
          
//           // Check if there's a return URL, otherwise go to dashboard
//           const returnUrl = this.authService.getAdminReturnUrl();
//           if (returnUrl) {
//             this.authService.clearAdminReturnUrl();
//             this.router.navigateByUrl(returnUrl);
//           } else {
//             this.router.navigate(['/dashboard']);
//           }
//         } else {
//           this.handleLoginError();
//         }
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         console.error(err);
//         this.loading = false;
//         this.handleLoginError();
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   private handleLoginError() {
//     this.error = 'Invalid Credentials. Blockchain rejected access.';
//     this.isMined = false;
//     this.miningProgress = 0;
//   }
// }



////main
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router'; // 1. Import RouterLink
// import { LucideAngularModule, Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft } from 'lucide-angular'; // 2. Import ArrowLeft
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-admin-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink], // 3. Add RouterLink here
//   templateUrl: './admin-login.component.html',
//   styleUrls: ['./admin-login.component.css']
// })
// export class AdminLoginComponent implements OnInit, OnDestroy {
//   // --- ASSETS ---
//   // 4. Add ArrowLeft to the icons object
//   readonly icons = { Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint, ArrowLeft };
//   logoImg = '/dataSoft.svg';

//   // --- STATE ---
//   adminId = '';
//   password = '';
//   loading = false;
//   error = '';

//   // --- "Hold to Mine" Logic ---
//   miningProgress = 0;
//   isMining = false;
//   isMined = false;
//   currentHash = '0x0000000000000000';
  
//   private mineInterval: any;
//   private hashInterval: any;

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.startHashGenerator();
    
//     if (this.authService.isAdminLoggedIn()) {
//       this.router.navigate(['/dashboard']);
//     }
//   }

//   ngOnDestroy() {
//     this.clearAllIntervals();
//   }

//   // --- HASH GENERATOR (Visual Effect) ---
//   startHashGenerator() {
//     this.hashInterval = setInterval(() => {
//       if (this.isMining && !this.isMined) {
//         const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
//         this.currentHash = `0x${randomHex}...`;
//         this.cdr.detectChanges();
//       } else if (this.isMined) {
//         this.currentHash = '0xSUCCESS_VERIFIED';
//         this.cdr.detectChanges();
//       } else {
//         this.currentHash = '0xWAITING_FOR_MINER';
//         this.cdr.detectChanges();
//       }
//     }, 50);
//   }

//   // --- MINING ACTIONS ---
//   startMining() {
//     if (this.isMined) return;
//     this.isMining = true;
    
//     this.mineInterval = setInterval(() => {
//       if (this.miningProgress >= 100) {
//         this.finishMining();
//       } else {
//         this.miningProgress += 2; 
//         this.cdr.detectChanges();
//       }
//     }, 30);
//   }

//   stopMining() {
//     if (this.isMined) return;
//     this.isMining = false;
//     this.miningProgress = 0; 
//     clearInterval(this.mineInterval);
//     this.cdr.detectChanges();
//   }

//   finishMining() {
//     clearInterval(this.mineInterval);
//     this.isMined = true;
//     this.isMining = false;
//     this.miningProgress = 100;
//     this.cdr.detectChanges();
//   }

//   clearAllIntervals() {
//     if (this.mineInterval) clearInterval(this.mineInterval);
//     if (this.hashInterval) clearInterval(this.hashInterval);
//   }

//   // --- LOGIN ---
//   handleLogin(event: Event) {
//     event.preventDefault();
//     this.error = '';

//     if (!this.isMined) {
//       this.error = 'Proof of Work Required: Please mine the block first.';
//       return;
//     }

//     this.loading = true;

//     this.authService.loginAdmin(this.adminId, this.password).subscribe({
//       next: (success) => {
//         this.loading = false;
//         if (success) {
//           console.log('Login Successful');
//           this.router.navigate(['/dashboard']);
//         } else {
//           this.handleLoginError();
//         }
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         console.error(err);
//         this.loading = false;
//         this.handleLoginError();
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   private handleLoginError() {
//     this.error = 'Invalid Credentials. Blockchain rejected access.';
//     this.isMined = false;
//     this.miningProgress = 0;
//   }
// }

