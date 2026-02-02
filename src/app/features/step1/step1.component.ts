import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Check, User, IdCard, Loader2, AlertCircle } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule, HttpClientModule],
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class Step1Component implements OnInit, OnDestroy {
  // --- ASSETS & ICONS ---
  readonly icons = { Check, User, IdCard, Loader2, AlertCircle };
  logoImg = '/dataSoft.svg';

  // --- STATE ---
  employeeId = '';
  isLoading = false;
  errorMessage = '';

  timeLeft = "05:45:35";
  private timerId: any;
  private totalSeconds = 0;

  // --- STEPPER CONFIG ---
  STEPS = [
    { id: 1, label: "Scan QR Code", status: "active" },
    { id: 2, label: "Your Information", status: "pending" },
    { id: 3, label: "Candidate Choice", status: "pending" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // INJECTED AUTH SERVICE
  ) {}

  ngOnInit() {
    // Initialize Timer
    const [h, m, s] = this.timeLeft.split(":").map(Number);
    this.totalSeconds = (h * 3600) + (m * 60) + s;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  // --- 1. VALIDATION LOGIC ---
  get isValidId(): boolean {
    if (!this.employeeId) return false;
    const regex = /^(DS|INT)\d{5}$/i;
    return regex.test(this.employeeId);
  }

  onIdInput(value: string) {
    this.employeeId = value.toUpperCase();
    this.errorMessage = '';
  }

  // --- 2. AUTH LOGIC (JWT COOKIE) ---
  async verifyId() {
    if (!this.isValidId || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // API CALL: POST to Login
      await firstValueFrom(
        this.http.post(
          `${API_URL}/api/auth/login`,
          { dsId: this.employeeId },
          { withCredentials: true }
        )
      );

      // --- SUCCESS ---
      // 1. Tell Service we are moving to Step 2 (Unlocks Step 2 Guard)
      this.authService.completeStep(1);

      // 2. Navigate
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

  // --- TIMER LOGIC ---
  startTimer() {
    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateTimeLeftString();
        this.cdr.detectChanges();
      } else {
        clearInterval(this.timerId);
      }
    }, 1000);
  }

  private updateTimeLeftString() {
    const h = Math.floor(this.totalSeconds / 3600);
    const m = Math.floor((this.totalSeconds % 3600) / 60);
    const s = this.totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }
}

// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http'; // Added HttpClient
// import { LucideAngularModule, Check, User, IdCard, Loader2, AlertCircle } from 'lucide-angular';
// import { Router, RouterModule } from '@angular/router';
// import { firstValueFrom } from 'rxjs';

// // Configure your API URL here
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
//     { id: 1, label: "Login", status: "active" },
//     { id: 2, label: "Your Information", status: "pending" },
//     { id: 3, label: "Candidate Choice", status: "pending" },
//     { id: 4, label: "Finger Verification", status: "pending" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private http: HttpClient,
//     private router: Router
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
//   // Returns true if ID starts with DS or INT (case insensitive) followed by 5 digits
//   get isValidId(): boolean {
//     if (!this.employeeId) return false;
//     const regex = /^(DS|INT)\d{5}$/i; 
//     return regex.test(this.employeeId);
//   }

//   // Force uppercase while typing
//   onIdInput(value: string) {
//     this.employeeId = value.toUpperCase();
//     this.errorMessage = ''; // Clear error when user types
//   }

//   // --- 2. VERIFY LOGIC ---
//   async verifyId() {
//     if (!this.isValidId || this.isLoading) return;

//     this.isLoading = true;
//     this.errorMessage = '';

//     try {
//       // API CALL: Check if employee exists in blockchain
//       // Adjust endpoint to match your backend (e.g., /auth/check/:id or /employees/:id)
//       const response: any = await firstValueFrom(
//         this.http.get(`${API_URL}/auth/check/${this.employeeId}`)
//       );

//       // Logic: If API returns { exists: true } or user data, we proceed
//       // If your API throws 404 when not found, the catch block handles it.
//       if (response && response.exists) {
//         // Store ID for next steps (optional: use a Service for state sharing)
//         localStorage.setItem('currentVoterId', this.employeeId);
        
//         // Navigate to Step 2
//         this.router.navigate(['/step2']);
//       } else {
//         this.errorMessage = 'ID not found in blockchain records.';
//       }

//     } catch (error: any) {
//       console.error(error);
//       // Handle 404 or other errors
//       if (error.status === 404 || (error.error && !error.error.exists)) {
//         this.errorMessage = 'Employee ID not found.';
//       } else {
//         this.errorMessage = '⚠️ Connection error. Please try again.';
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
  
//   // Progress bar helper
//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }
// }
