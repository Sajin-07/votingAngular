// auth.service.ts 15JAN
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  // --- STATE MANAGEMENT ---
  
  // Admin State (Now verified against backend, not just sessionStorage)
  private adminAuthenticated = new BehaviorSubject<boolean>(false);
  
  // Voter Step State
  private currentAllowedStep = new BehaviorSubject<number>(1);

  constructor(private http: HttpClient, private router: Router) {
    // FIXED: Don't check admin auth on init - let guards handle it
    // This prevents premature API calls before login
    
    // Recover Voter step state
    const savedStep = sessionStorage.getItem('allowedStep');
    if (savedStep) {
      this.currentAllowedStep.next(parseInt(savedStep, 10));
    }
  }

  // ============================================================
  // SECTION 1: ADMIN AUTHENTICATION (Cookie-Based)
  // ============================================================

  // Observable for components to subscribe to
  get adminAuthenticated$(): Observable<boolean> {
    return this.adminAuthenticated.asObservable();
  }

  // Synchronous check for guards
  isAdminLoggedIn(): boolean {
    return this.adminAuthenticated.value;
  }

  // Server-validated admin check (for guards)
  isAdminAuthenticated(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/admin-status`, { 
      withCredentials: true 
    }).pipe(
      map(res => !!res.authenticated),
      tap(isAuth => {
        console.log('🔍 Admin auth check:', isAuth);
        this.adminAuthenticated.next(isAuth);
      }),
      catchError((error) => {
        console.log('❌ Admin auth check failed:', error.status);
        this.adminAuthenticated.next(false);
        return of(false);
      })
    );
  }

  // Login admin - now sets HTTP-only cookie on backend
  loginAdmin(adminId: string, password: string): Observable<boolean> {
    return this.http.post<{ success: boolean; adminId?: string }>(
      `${this.apiUrl}/admin-login`, 
      { adminId, password },
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.success) {
          // FIXED: Immediately update state upon successful login
          this.adminAuthenticated.next(true);
          console.log('✅ Admin authenticated via backend cookie');
          return true;
        }
        return false;
      }),
      catchError((error) => {
        console.error("❌ Admin Login Failed:", error);
        this.adminAuthenticated.next(false);
        return of(false);
      })
    );
  }

  // Logout admin - clears backend cookie
  logoutAdmin() {
    this.http.post(`${this.apiUrl}/admin-logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          console.log('✅ Admin logged out');
          this.performAdminLogout();
        },
        error: (err) => {
          console.error('Logout error:', err);
          // Force logout on client even if server fails
          this.performAdminLogout();
        }
      });
  }

  private performAdminLogout() {
    this.adminAuthenticated.next(false);
    this.clearAdminReturnUrl();
    this.router.navigate(['/adminLogin']);
  }

  // Return URL management
  getAdminReturnUrl(): string | null {
    return sessionStorage.getItem('adminReturnUrl');
  }

  clearAdminReturnUrl(): void {
    sessionStorage.removeItem('adminReturnUrl');
  }

  // ============================================================
  // SECTION 2: VOTER / EMPLOYEE AUTHENTICATION
  // ============================================================

  // Check if Employee is authenticated (HTTP-only cookie check)
  isAuthenticated(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(
      `${this.apiUrl}/status`, 
      { withCredentials: true }
    ).pipe(
      map(res => !!res.authenticated),
      catchError(() => of(false))
    );
  }

  // ============================================================
  // SECTION 3: VOTING FLOW STEP MANAGEMENT
  // ============================================================

  completeStep(stepNumber: number) {
    const nextStep = stepNumber + 1;
    this.currentAllowedStep.next(nextStep);
    sessionStorage.setItem('allowedStep', nextStep.toString());
  }

  setStep(stepNumber: number) {
    this.currentAllowedStep.next(stepNumber);
    sessionStorage.setItem('allowedStep', stepNumber.toString());
  }

  canAccessStep(step: number): boolean {
    return step === this.currentAllowedStep.value;
  }

  // ============================================================
  // SECTION 4: VOTER LOGOUT
  // ============================================================

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.performClientLogout();
        },
        error: (err) => {
          console.error('Logout error', err);
          this.performClientLogout();
        }
      });
  }

  private performClientLogout() {
    this.currentAllowedStep.next(1);
    sessionStorage.removeItem('allowedStep');
    // this.router.navigate(['/step1']);
    this.router.navigate(['/']);
  }
}


// // auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { catchError, map, tap } from 'rxjs/operators';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = 'http://localhost:3000/api/auth';

//   // --- STATE MANAGEMENT ---
  
//   // Admin State (Now verified against backend, not just sessionStorage)
//   private adminAuthenticated = new BehaviorSubject<boolean>(false);
  
//   // Voter Step State
//   private currentAllowedStep = new BehaviorSubject<number>(1);

//   constructor(private http: HttpClient, private router: Router) {
//     // Check both admin and voter auth on service init
//     this.checkAdminAuth();
    
//     // Recover Voter step state
//     const savedStep = sessionStorage.getItem('allowedStep');
//     if (savedStep) {
//       this.currentAllowedStep.next(parseInt(savedStep, 10));
//     }
//   }

//   // ============================================================
//   // SECTION 1: ADMIN AUTHENTICATION (Cookie-Based)
//   // ============================================================

//   // Check admin auth against backend on app load
//   private checkAdminAuth(): void {
//     this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/admin-status`, { 
//       withCredentials: true 
//     }).pipe(
//       map(res => !!res.authenticated),
//       catchError(() => of(false))
//     ).subscribe(isAuth => {
//       this.adminAuthenticated.next(isAuth);
//     });
//   }

//   // Observable for components to subscribe to
//   get adminAuthenticated$(): Observable<boolean> {
//     return this.adminAuthenticated.asObservable();
//   }

//   // Synchronous check for guards
//   isAdminLoggedIn(): boolean {
//     return this.adminAuthenticated.value;
//   }

//   // Server-validated admin check (for guards)
//   isAdminAuthenticated(): Observable<boolean> {
//     return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/admin-status`, { 
//       withCredentials: true 
//     }).pipe(
//       map(res => !!res.authenticated),
//       tap(isAuth => this.adminAuthenticated.next(isAuth)),
//       catchError(() => {
//         this.adminAuthenticated.next(false);
//         return of(false);
//       })
//     );
//   }

//   // Login admin - now sets HTTP-only cookie on backend
//   loginAdmin(adminId: string, password: string): Observable<boolean> {
//     return this.http.post<{ success: boolean; adminId?: string }>(
//       `${this.apiUrl}/admin-login`, 
//       { adminId, password },
//       { withCredentials: true } // Important: send/receive cookies
//     ).pipe(
//       map(response => {
//         if (response.success) {
//           this.adminAuthenticated.next(true);
//           console.log('✅ Admin authenticated via backend cookie');
//           return true;
//         }
//         return false;
//       }),
//       catchError((error) => {
//         console.error("❌ Admin Login Failed:", error);
//         this.adminAuthenticated.next(false);
//         return of(false);
//       })
//     );
//   }

//   // Logout admin - clears backend cookie
//   logoutAdmin() {
//     this.http.post(`${this.apiUrl}/admin-logout`, {}, { withCredentials: true })
//       .subscribe({
//         next: () => {
//           console.log('✅ Admin logged out');
//           this.performAdminLogout();
//         },
//         error: (err) => {
//           console.error('Logout error:', err);
//           // Force logout on client even if server fails
//           this.performAdminLogout();
//         }
//       });
//   }

//   private performAdminLogout() {
//     this.adminAuthenticated.next(false);
//     this.clearAdminReturnUrl();
//     this.router.navigate(['/adminLogin']);
//   }

//   // Return URL management
//   getAdminReturnUrl(): string | null {
//     return sessionStorage.getItem('adminReturnUrl');
//   }

//   clearAdminReturnUrl(): void {
//     sessionStorage.removeItem('adminReturnUrl');
//   }

//   // ============================================================
//   // SECTION 2: VOTER / EMPLOYEE AUTHENTICATION
//   // ============================================================

//   // Check if Employee is authenticated (HTTP-only cookie check)
//   isAuthenticated(): Observable<boolean> {
//     return this.http.get<{ authenticated: boolean }>(
//       `${this.apiUrl}/status`, 
//       { withCredentials: true }
//     ).pipe(
//       map(res => !!res.authenticated),
//       catchError(() => of(false))
//     );
//   }

//   // ============================================================
//   // SECTION 3: VOTING FLOW STEP MANAGEMENT
//   // ============================================================

//   completeStep(stepNumber: number) {
//     const nextStep = stepNumber + 1;
//     this.currentAllowedStep.next(nextStep);
//     sessionStorage.setItem('allowedStep', nextStep.toString());
//   }

//   setStep(stepNumber: number) {
//     this.currentAllowedStep.next(stepNumber);
//     sessionStorage.setItem('allowedStep', stepNumber.toString());
//   }

//   canAccessStep(step: number): boolean {
//     return step === this.currentAllowedStep.value;
//   }

//   // ============================================================
//   // SECTION 4: VOTER LOGOUT
//   // ============================================================

//   logout() {
//     this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
//       .subscribe({
//         next: () => {
//           this.performClientLogout();
//         },
//         error: (err) => {
//           console.error('Logout error', err);
//           this.performClientLogout();
//         }
//       });
//   }

//   private performClientLogout() {
//     this.currentAllowedStep.next(1);
//     sessionStorage.removeItem('allowedStep');
//     this.router.navigate(['/step1']);
//   }
// }









// // auth.service.ts: main 13 JAN
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = 'http://localhost:3000/api/auth';

//   // --- STATE MANAGEMENT ---
  
//   // Admin State (Initialize by checking SessionStorage)
//   private adminAuthenticated = new BehaviorSubject<boolean>(this.checkAdminStorage());
  
//   // Voter Step State (1 = Login, 2 = Info, 3 = Candidate, 4 = Finger, 5 = Success)
//   private currentAllowedStep = new BehaviorSubject<number>(1);

//   constructor(private http: HttpClient, private router: Router) {
//     // Recover Voter step state from sessionStorage on reload
//     const savedStep = sessionStorage.getItem('allowedStep');
//     if (savedStep) {
//       this.currentAllowedStep.next(parseInt(savedStep, 10));
//     }
//   }

//   // ============================================================
//   // SECTION 1: ADMIN AUTHENTICATION
//   // ============================================================

//   // Helper: Check storage on service load to keep admin logged in on refresh
//   private checkAdminStorage(): boolean {
//     return sessionStorage.getItem('adminAuth') === 'true';
//   }

//   // Used by the Guard to check permission
//   isAdminLoggedIn(): boolean {
//     return this.adminAuthenticated.value;
//   }

//   // Call the backend (which calls Chaincode VerifyAdmin)
//   loginAdmin(adminId: string, password: string): Observable<boolean> {
//     return this.http.post<{ success: boolean }>(`${this.apiUrl}/admin-login`, { adminId, password })
//       .pipe(
//         map(response => {
//           if (response.success) {
//             this.setAdminSession(true);
//             return true;
//           }
//           return false;
//         }),
//         catchError((error) => {
//           console.error("Admin Login Failed", error);
//           return of(false);
//         })
//       );
//   }

//   logoutAdmin() {
//     this.setAdminSession(false);
//     this.clearAdminReturnUrl(); // Clear any stored return URL
//     this.router.navigate(['/adminLogin']);
//   }

//   private setAdminSession(isAuth: boolean) {
//     this.adminAuthenticated.next(isAuth);
//     if (isAuth) {
//       sessionStorage.setItem('adminAuth', 'true');
//     } else {
//       sessionStorage.removeItem('adminAuth');
//     }
//   }

//   // Get the stored return URL after login
//   getAdminReturnUrl(): string | null {
//     return sessionStorage.getItem('adminReturnUrl');
//   }

//   // Clear the stored return URL
//   clearAdminReturnUrl(): void {
//     sessionStorage.removeItem('adminReturnUrl');
//   }

//   // ============================================================
//   // SECTION 2: VOTER / EMPLOYEE AUTHENTICATION
//   // ============================================================

//   // Check if Employee is authenticated (HTTP-only cookie check)
//   isAuthenticated(): Observable<boolean> {
//     return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/status`, { withCredentials: true }).pipe(
//       map(res => !!res.authenticated),
//       catchError(() => {
//         return of(false);
//       })
//     );
//   }

//   // ============================================================
//   // SECTION 3: VOTING FLOW STEP MANAGEMENT
//   // ============================================================

//   // Call this when a step is successfully completed
//   completeStep(stepNumber: number) {
//     const nextStep = stepNumber + 1;
//     this.currentAllowedStep.next(nextStep);
//     sessionStorage.setItem('allowedStep', nextStep.toString());
//   }

//   // Allow navigation backwards or to specific steps
//   setStep(stepNumber: number) {
//     this.currentAllowedStep.next(stepNumber);
//     sessionStorage.setItem('allowedStep', stepNumber.toString());
//   }

//   // Guard Logic: Check if user is allowed to view a specific step
//   canAccessStep(step: number): boolean {
//     return step === this.currentAllowedStep.value;
//   }

//   // ============================================================
//   // SECTION 4: VOTER LOGOUT
//   // ============================================================

//   logout() {
//     // 1. Call Backend to clear the HTTP-only cookie
//     this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
//       next: () => {
//         this.performClientLogout();
//       },
//       error: (err) => {
//         console.error('Logout error', err);
//         // Force logout on client even if server fails
//         this.performClientLogout();
//       }
//     });
//   }

//   private performClientLogout() {
//     // 2. Clear Client State
//     this.currentAllowedStep.next(1);
//     sessionStorage.removeItem('allowedStep');
    
//     // 3. Navigate to Voter Login
//     this.router.navigate(['/step1']);
//   }
// }
