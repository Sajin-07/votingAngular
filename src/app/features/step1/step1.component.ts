import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, User, IdCard, Loader2, AlertCircle, Camera } from 'lucide-angular';

// --- Shared Components ---
import { HeaderComponent } from '../../shared/components/header/header.component'; 
import { StepperComponent } from '../../shared/components/stepper/stepper.component';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    RouterModule, 
    HttpClientModule,
    HeaderComponent,
    StepperComponent
  ],
  templateUrl: './step1.component.html',
  styleUrls: [] // removed css file as we use tailwind
})
export class Step1Component {
  // Added 'Camera' to icons
  readonly icons = { User, IdCard, Loader2, AlertCircle, Camera };

  employeeId = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {}

  // --- Logic ---

  // Mock function to simulate opening camera/scanning
  openCamera() {
    console.log('Opening Camera...');
    // Here you would typically trigger your QR Scanner library (e.g. ngx-scanner)
    // For now, we can just simulate a successful scan for demonstration if needed,
    // or just leave it as a UI trigger.
    
    // Example: Simulate a scan after 1 second
    // this.onScanSuccess('DS00615'); 
  }

  // Existing logic kept for reference or integration with QR scanner result
  async verifyId(scannedId?: string) {
    const idToVerify = scannedId || this.employeeId;
    
    if (!idToVerify || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await firstValueFrom(
        this.http.post(
          `${API_URL}/api/auth/login`,
          { dsId: idToVerify },
          { withCredentials: true }
        )
      );

      this.router.navigate(['/step2']);

    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.status === 401 || error.status === 404) {
        this.errorMessage = 'ID not found in blockchain records.';
      } else {
        this.errorMessage = 'Connection error. Please try again.';
      }
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}


// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, Check, User, IdCard, Loader2, AlertCircle } from 'lucide-angular';
// import { Router, RouterModule } from '@angular/router';
// import { firstValueFrom } from 'rxjs';
// import { AuthService } from '../../core/services/auth.service';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step1',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, HttpClientModule],
//   templateUrl: './step1.component.html',
//   styleUrls: ['./step1.component.css']
// })
// export class Step1Component implements OnInit, OnDestroy {
//   // --- ASSETS & ICONS ---
//   readonly icons = { Check, User, IdCard, Loader2, AlertCircle };
//   logoImg = '/dataSoft.svg';

//   // --- STATE ---
//   employeeId = '';
//   isLoading = false;
//   errorMessage = '';

//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   // --- STEPPER CONFIG ---
//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "active" },
//     { id: 2, label: "Your Information", status: "pending" },
//     { id: 3, label: "Candidate Choice", status: "pending" },
//     { id: 4, label: "Finger Verification", status: "pending" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private http: HttpClient,
//     private router: Router,
//     private authService: AuthService // INJECTED AUTH SERVICE
//   ) {}

//   ngOnInit() {
//     // Initialize Timer
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   // --- 1. VALIDATION LOGIC ---
//   get isValidId(): boolean {
//     if (!this.employeeId) return false;
//     const regex = /^(DS|INT)\d{5}$/i;
//     return regex.test(this.employeeId);
//   }

//   onIdInput(value: string) {
//     this.employeeId = value.toUpperCase();
//     this.errorMessage = '';
//   }

//   // --- 2. AUTH LOGIC (JWT COOKIE) ---
//   async verifyId() {
//     if (!this.isValidId || this.isLoading) return;

//     this.isLoading = true;
//     this.errorMessage = '';

//     try {
//       // API CALL: POST to Login
//       await firstValueFrom(
//         this.http.post(
//           `${API_URL}/api/auth/login`,
//           { dsId: this.employeeId },
//           { withCredentials: true }
//         )
//       );

//       // --- SUCCESS ---
//       // 1. Tell Service we are moving to Step 2 (Unlocks Step 2 Guard)
//       this.authService.completeStep(1);

//       // 2. Navigate
//       this.router.navigate(['/step2']);

//     } catch (error: any) {
//       console.error('Login Error:', error);

//       if (error.status === 401 || error.status === 404) {
//         this.errorMessage = 'ID not found in blockchain records.';
//       } else {
//         this.errorMessage = 'Connection error. Please try again.';
//       }
//     } finally {
//       this.isLoading = false;
//       this.cdr.detectChanges();
//     }
//   }

//   // --- TIMER LOGIC ---
//   startTimer() {
//     this.timerId = setInterval(() => {
//       if (this.totalSeconds > 0) {
//         this.totalSeconds--;
//         this.updateTimeLeftString();
//         this.cdr.detectChanges();
//       } else {
//         clearInterval(this.timerId);
//       }
//     }, 1000);
//   }

//   private updateTimeLeftString() {
//     const h = Math.floor(this.totalSeconds / 3600);
//     const m = Math.floor((this.totalSeconds % 3600) / 60);
//     const s = this.totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }
// }
