import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from '../../core/services/registration.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { 
  LucideAngularModule, 
  CheckCircle2, 
  Shield, 
  Users, 
  Vote, 
  Loader2, 
  ChevronRight,
  AlertCircle
} from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  template: `
    <div class="min-h-screen relative w-full bg-black font-sans selection:bg-[#E50914] selection:text-white overflow-x-hidden">
      <div class="absolute inset-0 opacity-50 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc932/aaf29bc4-d629-4176-b8cc-585dc2a3079e/US-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center sm:hidden md:block"></div>
      <div class="absolute inset-0 bg-black/60 md:bg-gradient-to-b md:from-black/80 md:via-black/60 md:to-black"></div>

      <header class="relative z-20 flex justify-between items-center px-4 py-4 md:px-12">
        <img [src]="logoImg" alt="DataSoft Logo" class="h-8 md:h-10 w-auto drop-shadow-md"/>
        <a routerLink="/org-login" class="text-white font-medium hover:underline text-sm md:text-base">Sign In</a>
      </header>

      <div class="relative z-10 flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4">
        <div class="w-full max-w-[550px] bg-black/75 p-8 md:p-14 rounded-xl backdrop-blur-sm border border-white/5 shadow-2xl">
          
          <h2 class="text-3xl font-bold text-white mb-6">Create Account</h2>

          <div *ngIf="loading" class="mb-6 p-4 bg-[#E50914]/20 border border-[#E50914]/50 rounded text-white flex items-center gap-3 animate-pulse">
            <lucide-icon [img]="icons.Loader2" class="animate-spin"></lucide-icon>
            Processing registration...
          </div>

          <div *ngIf="errorMessage && !loading" class="mb-6 p-4 bg-[#e87c03]/20 border-l-4 border-[#e87c03] text-white rounded flex items-start gap-3">
             <lucide-icon [img]="icons.AlertCircle" class="text-[#e87c03] mt-1"></lucide-icon>
             <span>{{ errorMessage }}</span>
          </div>

          <form [formGroup]="regForm" (ngSubmit)="onSubmit()" *ngIf="!loading" class="space-y-8">
            
            <div class="space-y-4">
              <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 1: Organization Details</h3>
              <div class="relative group">
                <input formControlName="orgName" type="text" id="orgName" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
                <label for="orgName" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Organization Name</label>
              </div>
              <div class="relative">
                <select formControlName="orgType" class="block px-4 pt-4 pb-4 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] transition-colors cursor-pointer">
                  <option value="" class="text-gray-400">Select Organization Type</option>
                  <option value="Academic">Academic</option>
                  <option value="Creative">Creative</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Performance">Performance</option>
                  <option value="Civic">Civic</option>
                </select>
                <div class="absolute right-4 top-4 pointer-events-none text-[#8c8c8c]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 2: Admin Access</h3>
              <div class="relative group">
                <input formControlName="adminEmail" type="email" id="adminEmail" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
                <label for="adminEmail" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Admin Email</label>
              </div>
              <div class="relative group">
                <input formControlName="password" type="password" id="password" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
                <label for="password" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 3: Choose your plan</h3>
              <div class="grid grid-cols-1 gap-4">
                <div *ngFor="let plan of plans" (click)="selectPlan(plan._id)" class="cursor-pointer relative p-4 rounded-lg border-2 transition-all duration-200" [ngClass]="{'border-[#E50914] bg-[#E50914]/10': regForm.get('planId')?.value === plan._id, 'border-[#333] bg-transparent hover:border-gray-500': regForm.get('planId')?.value !== plan._id}">
                  <div class="flex justify-between items-center mb-2">
                    <div class="font-bold text-lg text-white">{{ plan.name }}</div>
                    <div *ngIf="regForm.get('planId')?.value === plan._id"><lucide-icon [img]="icons.CheckCircle2" class="text-[#E50914] w-6 h-6"></lucide-icon></div>
                  </div>
                  <div *ngIf="plan.price > 0" class="text-xl font-bold mb-3" [ngClass]="regForm.get('planId')?.value === plan._id ? 'text-[#E50914]' : 'text-gray-300'">
                    ৳{{ plan.price }}
                  </div>
                  <div class="border-t border-white/10 pt-3">
                    <ul class="space-y-2 text-sm text-[#d1d1d1]">
                      <li class="flex items-center gap-3"><lucide-icon [img]="icons.Shield" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Admins: <strong class="text-white">{{ plan.limits?.maxAdmins }}</strong></span></li>
                      <li class="flex items-center gap-3"><lucide-icon [img]="icons.Users" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Moderators: <strong class="text-white">{{ plan.limits?.maxModerators }}</strong></span></li>
                      <li class="flex items-center gap-3"><lucide-icon [img]="icons.Vote" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Elections: <strong class="text-white">{{ plan.limits?.maxSessions }}</strong></span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div *ngIf="regForm.get('planId')?.invalid && regForm.get('planId')?.touched" class="text-[#e87c03] text-xs flex items-center gap-1 mt-1">
                <lucide-icon [img]="icons.AlertCircle" class="w-3 h-3"></lucide-icon>Please select a plan to continue.
              </div>
            </div>

            <button type="submit" [disabled]="regForm.invalid || loading" class="w-full bg-[#E50914] hover:bg-[#f6121d] text-white font-bold text-lg py-3.5 px-4 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914] focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6 shadow-lg flex items-center justify-center gap-2 group">
              <span>{{ isPaidPlan() ? 'Proceed to Payment' : 'Complete Registration' }}</span>
              <lucide-icon [img]="icons.ChevronRight" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></lucide-icon>
            </button>

            <div class="text-[#737373] text-[13px] mt-4">
              This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" class="text-[#0071eb] hover:underline">Learn more.</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [] 
})
export class RegisterComponent implements OnInit {
  logoImg = '/dataSoft.svg';
  regForm: FormGroup;
  plans: any[] = [];
  loading = false;
  errorMessage = '';

  readonly icons = { 
    CheckCircle2, Shield, Users, Vote, Loader2, ChevronRight, AlertCircle 
  };

  constructor(
    private fb: FormBuilder,
    private regService: RegistrationService,
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Inject this
  ) {
    this.regForm = this.fb.group({
      orgName: ['', Validators.required],
      orgType: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      planId: ['', Validators.required],
      votingConfig: this.fb.group({
        method: ['SINGLE'],
        maxSelections: [1]
      })
    });
  }

  ngOnInit(): void {
    this.regService.getPlans().subscribe({
      next: (data) => this.plans = data,
      error: (err) => console.error('Failed to load plans', err)
    });
  }

  selectPlan(id: string) {
    this.regForm.patchValue({ planId: id });
  }

  isPaidPlan(): boolean {
    const selectedId = this.regForm.get('planId')?.value;
    const plan = this.plans.find(p => p._id === selectedId);
    return plan ? plan.price > 0 : false;
  }

  onSubmit() {
    if (this.regForm.invalid) return;

    // Start loading
    this.loading = true;
    this.errorMessage = '';

    this.regService.initiateRegistration(this.regForm.value).subscribe({
      next: (res) => {
        if (res.requiresPayment) {
          this.initiatePayment(res.registrationId);
        } else {
          this.router.navigate(['/success']);
        }
      },
      error: (err) => {
        // Stop loading immediately
        this.loading = false;
        
        // 3. FORCE UPDATE: Ensure Angular sees that loading is false
        this.cdr.detectChanges(); 

        // Handle specific error codes
        if (err.status === 409) {
          Swal.fire({
            title: 'Account Exists',
            text: err.error?.message || 'This email or organization is already registered.',
            icon: 'warning',
            background: '#000000', 
            color: '#ffffff',
            confirmButtonColor: '#E50914',
            confirmButtonText: 'Try again',
            customClass: {
              popup: 'border border-[#333]'
            }
          });
        } else {
          // Generic error message shown above form
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      }
    });
  }

  initiatePayment(regId: string) {
    this.regService.createPayment(regId).subscribe({
      next: (res) => {
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl; 
        } else {
          this.errorMessage = 'Payment gateway URL not received.';
          this.loading = false;
          this.cdr.detectChanges(); // Force update here too
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Payment initiation failed.';
        this.cdr.detectChanges(); // Force update here too
      }
    });
  }
}



// import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { RegistrationService } from '../../core/services/registration.service';
// import { Router, RouterLink } from '@angular/router';
// import Swal from 'sweetalert2';
// import { 
//   LucideAngularModule, 
//   CheckCircle2, 
//   Shield, 
//   Users, 
//   Vote, 
//   Loader2, 
//   ChevronRight,
//   AlertCircle
// } from 'lucide-angular';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
//   template: `
//     <div class="min-h-screen relative w-full bg-black font-sans selection:bg-[#E50914] selection:text-white overflow-x-hidden">
//       <div class="absolute inset-0 opacity-50 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc932/aaf29bc4-d629-4176-b8cc-585dc2a3079e/US-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center sm:hidden md:block"></div>
//       <div class="absolute inset-0 bg-black/60 md:bg-gradient-to-b md:from-black/80 md:via-black/60 md:to-black"></div>

//       <header class="relative z-20 flex justify-between items-center px-4 py-4 md:px-12">
//         <img [src]="logoImg" alt="DataSoft Logo" class="h-8 md:h-10 w-auto drop-shadow-md"/>
//         <a routerLink="/org-login" class="text-white font-medium hover:underline text-sm md:text-base">Sign In</a>
//       </header>

//       <div class="relative z-10 flex justify-center items-center min-h-[calc(100vh-80px)] py-8 px-4">
//         <div class="w-full max-w-[550px] bg-black/75 p-8 md:p-14 rounded-xl backdrop-blur-sm border border-white/5 shadow-2xl">
          
//           <h2 class="text-3xl font-bold text-white mb-6">Create Account</h2>

//           <div *ngIf="loading" class="mb-6 p-4 bg-[#E50914]/20 border border-[#E50914]/50 rounded text-white flex items-center gap-3 animate-pulse">
//             <lucide-icon [img]="icons.Loader2" class="animate-spin"></lucide-icon>
//             Processing registration...
//           </div>

//           <div *ngIf="errorMessage && !loading" class="mb-6 p-4 bg-[#e87c03]/20 border-l-4 border-[#e87c03] text-white rounded flex items-start gap-3">
//              <lucide-icon [img]="icons.AlertCircle" class="text-[#e87c03] mt-1"></lucide-icon>
//              <span>{{ errorMessage }}</span>
//           </div>

//           <form [formGroup]="regForm" (ngSubmit)="onSubmit()" *ngIf="!loading" class="space-y-8">
            
//             <div class="space-y-4">
//               <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 1: Organization Details</h3>
//               <div class="relative group">
//                 <input formControlName="orgName" type="text" id="orgName" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
//                 <label for="orgName" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Organization Name</label>
//               </div>
//               <div class="relative">
//                 <select formControlName="orgType" class="block px-4 pt-4 pb-4 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] transition-colors cursor-pointer">
//                   <option value="" class="text-gray-400">Select Organization Type</option>
//                   <option value="Academic">Academic</option>
//                   <option value="Creative">Creative</option>
//                   <option value="Corporate">Corporate</option>
//                   <option value="Performance">Performance</option>
//                   <option value="Civic">Civic</option>
//                 </select>
//                 <div class="absolute right-4 top-4 pointer-events-none text-[#8c8c8c]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div>
//               </div>
//             </div>

//             <div class="space-y-4">
//               <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 2: Admin Access</h3>
//               <div class="relative group">
//                 <input formControlName="adminEmail" type="email" id="adminEmail" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
//                 <label for="adminEmail" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Admin Email</label>
//               </div>
//               <div class="relative group">
//                 <input formControlName="password" type="password" id="password" class="block px-4 pb-2.5 pt-5 w-full text-white bg-[#333] rounded-md border-0 appearance-none focus:outline-none focus:ring-0 focus:bg-[#454545] peer transition-colors" placeholder=" "/>
//                 <label for="password" class="absolute text-sm text-[#8c8c8c] duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
//               </div>
//             </div>

//             <div class="space-y-4">
//               <h3 class="text-[#8c8c8c] text-sm font-medium uppercase tracking-wider">Step 3: Choose your plan</h3>
//               <div class="grid grid-cols-1 gap-4">
//                 <div *ngFor="let plan of plans" (click)="selectPlan(plan._id)" class="cursor-pointer relative p-4 rounded-lg border-2 transition-all duration-200" [ngClass]="{'border-[#E50914] bg-[#E50914]/10': regForm.get('planId')?.value === plan._id, 'border-[#333] bg-transparent hover:border-gray-500': regForm.get('planId')?.value !== plan._id}">
//                   <div class="flex justify-between items-center mb-2">
//                     <div class="font-bold text-lg text-white">{{ plan.name }}</div>
//                     <div *ngIf="regForm.get('planId')?.value === plan._id"><lucide-icon [img]="icons.CheckCircle2" class="text-[#E50914] w-6 h-6"></lucide-icon></div>
//                   </div>
//                   <div class="text-xl font-bold mb-3" [ngClass]="regForm.get('planId')?.value === plan._id ? 'text-[#E50914]' : 'text-gray-300'">{{ plan.price === 0 ? 'Free' : '৳' + plan.price }}</div>
//                   <div class="border-t border-white/10 pt-3">
//                     <ul class="space-y-2 text-sm text-[#d1d1d1]">
//                       <li class="flex items-center gap-3"><lucide-icon [img]="icons.Shield" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Admins: <strong class="text-white">{{ plan.limits?.maxAdmins }}</strong></span></li>
//                       <li class="flex items-center gap-3"><lucide-icon [img]="icons.Users" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Moderators: <strong class="text-white">{{ plan.limits?.maxModerators }}</strong></span></li>
//                       <li class="flex items-center gap-3"><lucide-icon [img]="icons.Vote" class="w-4 h-4 text-gray-400"></lucide-icon><span>Max Elections: <strong class="text-white">{{ plan.limits?.maxSessions }}</strong></span></li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//               <div *ngIf="regForm.get('planId')?.invalid && regForm.get('planId')?.touched" class="text-[#e87c03] text-xs flex items-center gap-1 mt-1">
//                 <lucide-icon [img]="icons.AlertCircle" class="w-3 h-3"></lucide-icon>Please select a plan to continue.
//               </div>
//             </div>

//             <button type="submit" [disabled]="regForm.invalid || loading" class="w-full bg-[#E50914] hover:bg-[#f6121d] text-white font-bold text-lg py-3.5 px-4 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914] focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6 shadow-lg flex items-center justify-center gap-2 group">
//               <span>{{ isPaidPlan() ? 'Proceed to Payment' : 'Complete Registration' }}</span>
//               <lucide-icon [img]="icons.ChevronRight" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></lucide-icon>
//             </button>

//             <div class="text-[#737373] text-[13px] mt-4">
//               This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" class="text-[#0071eb] hover:underline">Learn more.</a>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [] 
// })
// export class RegisterComponent implements OnInit {
//   logoImg = '/dataSoft.svg';
//   regForm: FormGroup;
//   plans: any[] = [];
//   loading = false;
//   errorMessage = '';

//   readonly icons = { 
//     CheckCircle2, Shield, Users, Vote, Loader2, ChevronRight, AlertCircle 
//   };

//   constructor(
//     private fb: FormBuilder,
//     private regService: RegistrationService,
//     private router: Router,
//     private cdr: ChangeDetectorRef // 2. Inject this
//   ) {
//     this.regForm = this.fb.group({
//       orgName: ['', Validators.required],
//       orgType: ['', Validators.required],
//       adminEmail: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       planId: ['', Validators.required],
//       votingConfig: this.fb.group({
//         method: ['SINGLE'],
//         maxSelections: [1]
//       })
//     });
//   }

//   ngOnInit(): void {
//     this.regService.getPlans().subscribe({
//       next: (data) => this.plans = data,
//       error: (err) => console.error('Failed to load plans', err)
//     });
//   }

//   selectPlan(id: string) {
//     this.regForm.patchValue({ planId: id });
//   }

//   isPaidPlan(): boolean {
//     const selectedId = this.regForm.get('planId')?.value;
//     const plan = this.plans.find(p => p._id === selectedId);
//     return plan ? plan.price > 0 : false;
//   }

//   onSubmit() {
//     if (this.regForm.invalid) return;

//     // Start loading
//     this.loading = true;
//     this.errorMessage = '';

//     this.regService.initiateRegistration(this.regForm.value).subscribe({
//       next: (res) => {
//         if (res.requiresPayment) {
//           this.initiatePayment(res.registrationId);
//         } else {
//           this.router.navigate(['/success']);
//         }
//       },
//       error: (err) => {
//         // Stop loading immediately
//         this.loading = false;
        
//         // 3. FORCE UPDATE: Ensure Angular sees that loading is false
//         this.cdr.detectChanges(); 

//         // Handle specific error codes
//         if (err.status === 409) {
//           Swal.fire({
//             title: 'Account Exists',
//             text: err.error?.message || 'This email or organization is already registered.',
//             icon: 'warning',
//             background: '#000000', 
//             color: '#ffffff',
//             confirmButtonColor: '#E50914',
//             confirmButtonText: 'Try again',
//             customClass: {
//               popup: 'border border-[#333]'
//             }
//           });
//         } else {
//           // Generic error message shown above form
//           this.errorMessage = err.error?.message || 'Registration failed.';
//         }
//       }
//     });
//   }

//   initiatePayment(regId: string) {
//     this.regService.createPayment(regId).subscribe({
//       next: (res) => {
//         if (res.paymentUrl) {
//           window.location.href = res.paymentUrl; 
//         } else {
//           this.errorMessage = 'Payment gateway URL not received.';
//           this.loading = false;
//           this.cdr.detectChanges(); // Force update here too
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Payment initiation failed.';
//         this.cdr.detectChanges(); // Force update here too
//       }
//     });
//   }
// }






//main
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common'; // standalone usage
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { RegistrationService } from '../../core/services/registration.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   template: `
//     <div class="container mx-auto p-6 max-w-2xl">
//       <h2 class="text-3xl font-bold mb-6 text-center">Organization Registration</h2>

//       <div *ngIf="loading" class="text-center p-4 bg-blue-100 rounded">
//         Processing... Please wait.
//       </div>

//       <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
//         {{ errorMessage }}
//       </div>

//       <form [formGroup]="regForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
        
//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">1. Organization Details</h3>
          
//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Organization Name</label>
//             <input formControlName="orgName" type="text" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="e.g. Dhaka University Scifi Club">
//           </div>

//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Organization Type</label>
//             <select formControlName="orgType" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//               <option value="">Select Type</option>
//               <option value="Academic">Academic</option>
//               <option value="Creative">Creative</option>
//               <option value="Corporate">Corporate</option>
//               <option value="Performance">Performance</option>
//               <option value="Civic">Civic</option>
//             </select>
//           </div>
//         </div>

//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">2. Admin Credentials</h3>
          
//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Admin Email</label>
//             <input formControlName="adminEmail" type="email" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="admin@example.com">
//           </div>

//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
//             <input formControlName="password" type="password" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="********">
//           </div>
//         </div>

//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">3. Select Plan</h3>
          
//           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div *ngFor="let plan of plans" 
//                  (click)="selectPlan(plan._id)"
//                  [class.border-blue-500]="regForm.get('planId')?.value === plan._id"
//                  [class.bg-blue-50]="regForm.get('planId')?.value === plan._id"
//                  class="cursor-pointer border-2 rounded p-4 hover:border-blue-300 transition relative">
              
//               <div class="flex justify-between items-start">
//                 <div class="font-bold text-lg">{{ plan.name }}</div>
//                 <div *ngIf="regForm.get('planId')?.value === plan._id" class="text-blue-500">
//                   <i class="fas fa-check-circle"></i>
//                 </div>
//               </div>

//               <div class="text-xl text-blue-600 font-bold my-1">
//                 {{ plan.price === 0 ? 'Free' : '৳' + plan.price }}
//               </div>

//               <div class="mt-3 pt-3 border-t border-gray-200">
//                 <p class="text-xs font-semibold text-gray-500 mb-2 uppercase">Plan Limits</p>
//                 <ul class="text-sm text-gray-700 space-y-1">
//                   <li class="flex items-center">
//                     <i class="fas fa-user-shield w-6 text-gray-400"></i>
//                     <span>Max Admins: <strong>{{ plan.limits?.maxAdmins }}</strong></span>
//                   </li>
//                   <li class="flex items-center">
//                     <i class="fas fa-users-cog w-6 text-gray-400"></i>
//                     <span>Max Moderators: <strong>{{ plan.limits?.maxModerators }}</strong></span>
//                   </li>
//                   <li class="flex items-center">
//                     <i class="fas fa-vote-yea w-6 text-gray-400"></i>
//                     <span>Max Elections: <strong>{{ plan.limits?.maxSessions }}</strong></span>
//                   </li>
//                 </ul>
//               </div>

//             </div>
//           </div>
//           <div *ngIf="regForm.get('planId')?.invalid && regForm.get('planId')?.touched" class="text-red-500 text-xs italic mt-2">
//             Please select a plan to continue.
//           </div>
//         </div>

//         <button type="submit" 
//                 [disabled]="regForm.invalid || loading"
//                 class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
//           <span *ngIf="!loading">{{ isPaidPlan() ? 'Proceed to Payment' : 'Complete Registration' }}</span>
//           <span *ngIf="loading"><i class="fas fa-spinner fa-spin"></i> Processing...</span>
//         </button>
//       </form>
//     </div>
//   `,
//   styles: [] 
// })
// export class RegisterComponent implements OnInit {
//   regForm: FormGroup;
//   plans: any[] = [];
//   loading = false;
//   errorMessage = '';

//   constructor(
//     private fb: FormBuilder,
//     private regService: RegistrationService,
//     private router: Router
//   ) {
//     this.regForm = this.fb.group({
//       orgName: ['', Validators.required],
//       orgType: ['', Validators.required],
//       adminEmail: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       planId: ['', Validators.required],
//       votingConfig: this.fb.group({
//         method: ['SINGLE'],
//         maxSelections: [1]
//       })
//     });
//   }

//   ngOnInit(): void {
//     this.regService.getPlans().subscribe({
//       next: (data) => this.plans = data,
//       error: (err) => console.error('Failed to load plans', err)
//     });
//   }

//   selectPlan(id: string) {
//     this.regForm.patchValue({ planId: id });
//   }

//   isPaidPlan(): boolean {
//     const selectedId = this.regForm.get('planId')?.value;
//     const plan = this.plans.find(p => p._id === selectedId);
//     return plan ? plan.price > 0 : false;
//   }

//   onSubmit() {
//     if (this.regForm.invalid) return;

//     this.loading = true;
//     this.errorMessage = '';

//     // 1. Initiate Registration
//     this.regService.initiateRegistration(this.regForm.value).subscribe({
//       next: (res) => {
//         if (res.requiresPayment) {
//           // 2. If Payment Needed -> Create Payment & Redirect
//           this.initiatePayment(res.registrationId);
//         } else {
//           // 3. If Free -> Done
//           this.router.navigate(['/success']);
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Registration failed.';
//       }
//     });
//   }

//   initiatePayment(regId: string) {
//     this.regService.createPayment(regId).subscribe({
//       next: (res) => {
//         if (res.paymentUrl) {
//           // Redirect to SSLCommerz
//           window.location.href = res.paymentUrl; 
//         } else {
//           this.errorMessage = 'Payment gateway URL not received.';
//           this.loading = false;
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Payment initiation failed.';
//       }
//     });
//   }
// }






// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common'; // standalone usage
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { RegistrationService } from '../../core/services/registration.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   template: `
//     <div class="container mx-auto p-6 max-w-2xl">
//       <h2 class="text-3xl font-bold mb-6 text-center">Organization Registration</h2>

//       <div *ngIf="loading" class="text-center p-4 bg-blue-100 rounded">
//         Processing... Please wait.
//       </div>

//       <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
//         {{ errorMessage }}
//       </div>

//       <form [formGroup]="regForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
        
//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">1. Organization Details</h3>
          
//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Organization Name</label>
//             <input formControlName="orgName" type="text" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="e.g. Dhaka University Scifi Club">
//           </div>

//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Organization Type</label>
//             <select formControlName="orgType" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
//               <option value="">Select Type</option>
//               <option value="Academic">Academic</option>
//               <option value="Creative">Creative</option>
//               <option value="Corporate">Corporate</option>
//               <option value="Performance">Performance</option>
//               <option value="Civic">Civic</option>
//             </select>
//           </div>
//         </div>

//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">2. Admin Credentials</h3>
          
//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Admin Email</label>
//             <input formControlName="adminEmail" type="email" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="admin@example.com">
//           </div>

//           <div class="mb-4">
//             <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
//             <input formControlName="password" type="password" 
//                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
//                    placeholder="********">
//           </div>
//         </div>

//         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
//           <h3 class="text-xl font-semibold mb-4 text-gray-700">3. Select Plan</h3>
          
//           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div *ngFor="let plan of plans" 
//                  (click)="selectPlan(plan._id)"
//                  [class.border-blue-500]="regForm.get('planId')?.value === plan._id"
//                  [class.bg-blue-50]="regForm.get('planId')?.value === plan._id"
//                  class="cursor-pointer border-2 rounded p-4 hover:border-blue-300 transition">
              
//               <div class="font-bold text-lg">{{ plan.name }}</div>
//               <div class="text-xl text-blue-600 font-bold my-1">
//                 {{ plan.price === 0 ? 'Free' : '৳' + plan.price }}
//               </div>
//               <ul class="text-sm text-gray-600 mt-2 list-disc pl-4">
//                 <li *ngFor="let feature of plan.features.slice(0, 3)">{{ feature }}</li>
//               </ul>
//             </div>
//           </div>
//           <div *ngIf="regForm.get('planId')?.invalid && regForm.get('planId')?.touched" class="text-red-500 text-xs italic mt-2">
//             Please select a plan.
//           </div>
//         </div>

//         <button type="submit" 
//                 [disabled]="regForm.invalid || loading"
//                 class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
//           {{ isPaidPlan() ? 'Proceed to Payment' : 'Complete Registration' }}
//         </button>
//       </form>
//     </div>
//   `,
//   styles: [] // No external CSS needed if using Tailwind
// })
// export class RegisterComponent implements OnInit {
//   regForm: FormGroup;
//   plans: any[] = [];
//   loading = false;
//   errorMessage = '';

//   constructor(
//     private fb: FormBuilder,
//     private regService: RegistrationService,
//     private router: Router
//   ) {
//     this.regForm = this.fb.group({
//       orgName: ['', Validators.required],
//       orgType: ['', Validators.required],
//       adminEmail: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       planId: ['', Validators.required],
//       votingConfig: this.fb.group({
//         method: ['SINGLE'],
//         maxSelections: [1]
//       })
//     });
//   }

//   ngOnInit(): void {
//     this.regService.getPlans().subscribe({
//       next: (data) => this.plans = data,
//       error: (err) => console.error('Failed to load plans', err)
//     });
//   }

//   selectPlan(id: string) {
//     this.regForm.patchValue({ planId: id });
//   }

//   isPaidPlan(): boolean {
//     const selectedId = this.regForm.get('planId')?.value;
//     const plan = this.plans.find(p => p._id === selectedId);
//     return plan ? plan.price > 0 : false;
//   }

//   onSubmit() {
//     if (this.regForm.invalid) return;

//     this.loading = true;
//     this.errorMessage = '';

//     // 1. Initiate Registration
//     this.regService.initiateRegistration(this.regForm.value).subscribe({
//       next: (res) => {
//         if (res.requiresPayment) {
//           // 2. If Payment Needed -> Create Payment & Redirect
//           this.initiatePayment(res.registrationId);
//         } else {
//           // 3. If Free -> Done
//           this.router.navigate(['/success']);
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Registration failed.';
//       }
//     });
//   }

//   initiatePayment(regId: string) {
//     this.regService.createPayment(regId).subscribe({
//       next: (res) => {
//         if (res.paymentUrl) {
//           // Redirect to SSLCommerz
//           window.location.href = res.paymentUrl; 
//         } else {
//           this.errorMessage = 'Payment gateway URL not received.';
//           this.loading = false;
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Payment initiation failed.';
//       }
//     });
//   }
// }