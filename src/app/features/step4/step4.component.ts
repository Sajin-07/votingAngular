import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule, Check, Fingerprint, Loader2 } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service'; // Import Socket
import { firstValueFrom, Subscription } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.css']
})
export class Step4Component implements OnInit, OnDestroy {
  readonly icons = { Check, Fingerprint, Loader2 };
  logoImg = '/dataSoft.svg';
  
  // --- STATE ---
  isLoadingData = true; 
  userProfileImg = 'assets/images/professional_headshot_of_a_man.png'; 
  userName = 'User'; 
  employeeId: string = ''; 
  
  fullUserData: any = null;
  selectedCandidate: any = null;

  STEPS = [
    { id: 1, label: "Scan QR Code", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "completed" },
    { id: 4, label: "Finger Verification", status: "active" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  // --- TIMER & DATE STATE ---
  timeLeft = "00:00:00";
  currentDate = "";
  private timerSub!: Subscription;

  verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
  errorMessage: string = ''; 
  fingerprintQuality: number = 0;
  fingerprintScore: number = 0;

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private socketService: SocketService // Injected Socket
  ) {}

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }

  ngOnInit() {
    // 1. Set Realtime Date
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // 2. Connect Socket
    this.socketService.connectVoter();

    // 3. Subscribe to Timer
    this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
      this.updateTimeLeftString(seconds);

      // REDIRECT LOGIC: If voting closed, kick user out
      if (!this.socketService.isVotingOpen$.value) {
        this.router.navigate(['/verify-qr']);
      }

      this.cdr.detectChanges();
    });

    // 4. Load Data
    this.loadData();
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }

  async loadData() {
    try {
      this.isLoadingData = true;
      const candidateId = sessionStorage.getItem('voteCandidateId');
      
      if (!candidateId) {
        this.router.navigate(['/step3']);
        return;
      }

      const userReq = this.http.get(`${API_URL}/api/employee/me`, { withCredentials: true });
      const candidatesReq = this.http.get(`${API_URL}/api/candidates`, { withCredentials: true });

      const [userData, candidatesData]: [any, any] = await Promise.all([
        firstValueFrom(userReq),
        firstValueFrom(candidatesReq)
      ]);

      if (userData) {
        this.fullUserData = userData;
        if (userData.name) this.userName = userData.name;
        if (userData.photoUrl) this.userProfileImg = userData.photoUrl;
        this.employeeId = (userData.dsId || userData.employeeId || userData.id || '').toString();
      }

      this.selectedCandidate = candidatesData.find((c: any) => c.id.toString() === candidateId.toString());

      if (!this.selectedCandidate) {
        this.router.navigate(['/step3']);
      }

    } catch (error) {
      console.error("Error loading step 4 data", error);
    } finally {
      this.isLoadingData = false;
      this.cdr.detectChanges();
    }
  }

  onChangeVote() {
    sessionStorage.removeItem('voteCandidateId');
    this.authService.setStep(3);
    this.router.navigate(['/step3']);
  }

  async handleCastVote() {
    // 0. Safety Check: Is Voting Open?
    if (!this.socketService.isVotingOpen$.value) {
       this.router.navigate(['/verify-qr']);
       return;
    }

    if (this.verificationStatus === 'success' || !this.selectedCandidate) return;
    
    // 1. Reset State
    this.verificationStatus = 'scanning';
    this.errorMessage = '';
    this.fingerprintQuality = 0;
    this.fingerprintScore = 0;
    this.cdr.detectChanges();

    try {
      console.log('[VOTE] Step 1: Fetching employee data...');
      
      const employeeResp: any = await firstValueFrom(
        this.http.get(`${API_URL}/api/employee/${this.employeeId}`, { withCredentials: true })
      );

      if (!employeeResp.hasBiometric) {
        throw new Error('No fingerprint registered. Please register first.');
      }

      console.log('[VOTE] Step 2: Fetching stored fingerprint template...');

      const fullEmployeeResp: any = await firstValueFrom(
        this.http.get(`${API_URL}/api/employee/full/${this.employeeId}`, { withCredentials: true })
      );

      const storedTemplate = fullEmployeeResp.biometricHash;

      if (!storedTemplate) {
        throw new Error('Fingerprint template not found in blockchain.');
      }

      console.log('[VOTE] Step 3: Calling scanner for verification...');
      
      const verifyResp: any = await firstValueFrom(
        this.http.post(`${API_URL}/api/fingerprint/verify`, {
          template: storedTemplate
        })
      );

      this.fingerprintQuality = verifyResp.quality || 0;
      this.fingerprintScore = verifyResp.score || 0;

      if (!verifyResp.isMatched) {
        this.verificationStatus = 'error';
        this.errorMessage = `Fingerprint verification failed! (Quality: ${this.fingerprintQuality}, Score: ${this.fingerprintScore})`;
        console.error('[VOTE] ❌ Fingerprint does not match');
        this.cdr.detectChanges();
        return;
      }

      console.log('[VOTE] ✅ Fingerprint verified successfully!');
      this.verificationStatus = 'success';
      this.cdr.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('[VOTE] Step 4: Submitting vote to blockchain...');

      const voteResp: any = await firstValueFrom(
        this.http.post(`${API_URL}/api/vote/submit`, {
          candidateId: this.selectedCandidate.id
        }, { withCredentials: true })
      );

      console.log('[VOTE] ✅ Vote submitted. TxID:', voteResp.txId);

      const receiptData = {
        employee: {
          name: this.fullUserData?.name || this.userName,
          id: this.employeeId,
          department: this.fullUserData?.department || this.fullUserData?.designation || 'N/A',
          email: this.fullUserData?.email || 'N/A',
          role: this.fullUserData?.role || 'Employee'
        },
        candidate: {
          name: this.selectedCandidate.name,
          department: this.selectedCandidate.department || 'General'
        },
        vote: {
          txId: voteResp.txId,
          timestamp: new Date().toLocaleString(),
          quality: this.fingerprintQuality,
          score: this.fingerprintScore
        }
      };
      
      sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

      setTimeout(() => {
         this.authService.completeStep(4);
         this.router.navigate(['/step5']);
      }, 1000);

    } catch (error: any) {
      this.verificationStatus = 'error';
      
      if (error instanceof HttpErrorResponse) {
        this.errorMessage = error.error?.error || "Server error occurred.";
      } else {
        this.errorMessage = error.message || "Verification failed.";
      }
      
      if (this.errorMessage.includes('Scanner not reachable') || 
          this.errorMessage.includes('ECONNREFUSED') ||
          this.errorMessage.includes('503')) {
        this.errorMessage = 'Cannot connect to fingerprint scanner. Please check if scanner is connected.';
      }
      
      console.error("[VOTE] ❌ Error:", error);
      this.cdr.detectChanges();
    }
  }

  private updateTimeLeftString(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }
}


// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { LucideAngularModule, Check, Fingerprint, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { SocketService } from '../../core/services/socket.service'; // Import Socket
// import { firstValueFrom, Subscription } from 'rxjs';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step4',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step4.component.html',
//   styleUrls: ['./step4.component.css']
// })
// export class Step4Component implements OnInit, OnDestroy {
//   readonly icons = { Check, Fingerprint, Loader2 };
//   logoImg = '/dataSoft.svg';
  
//   // --- STATE ---
//   isLoadingData = true; 
//   userProfileImg = 'assets/images/professional_headshot_of_a_man.png'; 
//   userName = 'User'; 
//   employeeId: string = ''; 
  
//   fullUserData: any = null;
//   selectedCandidate: any = null;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "active" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   // --- TIMER STATE (Socket) ---
//   timeLeft = "00:00:00";
//   private timerSub!: Subscription;

//   verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
//   errorMessage: string = ''; 
//   fingerprintQuality: number = 0;
//   fingerprintScore: number = 0;

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private authService: AuthService,
//     private socketService: SocketService // Injected Socket
//   ) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     // 1. Connect Socket
//     this.socketService.connectVoter();

//     // 2. Subscribe to Timer
//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       this.updateTimeLeftString(seconds);
//       this.cdr.detectChanges();
//     });

//     // 3. Load Data
//     this.loadData();
//   }

//   ngOnDestroy() {
//     this.timerSub?.unsubscribe();
//   }

//   async loadData() {
//     try {
//       this.isLoadingData = true;
//       const candidateId = sessionStorage.getItem('voteCandidateId');
      
//       if (!candidateId) {
//         this.router.navigate(['/step3']);
//         return;
//       }

//       const userReq = this.http.get(`${API_URL}/api/employee/me`, { withCredentials: true });
//       const candidatesReq = this.http.get(`${API_URL}/api/candidates`, { withCredentials: true });

//       const [userData, candidatesData]: [any, any] = await Promise.all([
//         firstValueFrom(userReq),
//         firstValueFrom(candidatesReq)
//       ]);

//       if (userData) {
//         this.fullUserData = userData;
//         if (userData.name) this.userName = userData.name;
//         if (userData.photoUrl) this.userProfileImg = userData.photoUrl;
//         this.employeeId = (userData.dsId || userData.employeeId || userData.id || '').toString();
//       }

//       this.selectedCandidate = candidatesData.find((c: any) => c.id.toString() === candidateId.toString());

//       if (!this.selectedCandidate) {
//         this.router.navigate(['/step3']);
//       }

//     } catch (error) {
//       console.error("Error loading step 4 data", error);
//     } finally {
//       this.isLoadingData = false;
//       this.cdr.detectChanges();
//     }
//   }

//   onChangeVote() {
//     sessionStorage.removeItem('voteCandidateId');
//     this.authService.setStep(3);
//     this.router.navigate(['/step3']);
//   }

//   async handleCastVote() {
//     if (this.verificationStatus === 'success' || !this.selectedCandidate) return;
    
//     // 1. Reset State
//     this.verificationStatus = 'scanning';
//     this.errorMessage = '';
//     this.fingerprintQuality = 0;
//     this.fingerprintScore = 0;
//     this.cdr.detectChanges();

//     try {
//       console.log('[VOTE] Step 1: Fetching employee data...');
      
//       // 2. Get employee data to check if biometric exists
//       const employeeResp: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/employee/${this.employeeId}`, { withCredentials: true })
//       );

//       if (!employeeResp.hasBiometric) {
//         throw new Error('No fingerprint registered. Please register first.');
//       }

//       console.log('[VOTE] Step 2: Fetching stored fingerprint template...');

//       // 3. Get full employee data with biometric hash from blockchain
//       const fullEmployeeResp: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/employee/full/${this.employeeId}`, { withCredentials: true })
//       );

//       const storedTemplate = fullEmployeeResp.biometricHash;

//       if (!storedTemplate) {
//         throw new Error('Fingerprint template not found in blockchain.');
//       }

//       console.log('[VOTE] Step 3: Calling scanner for verification...');
      
//       // 4. Call verify
//       const verifyResp: any = await firstValueFrom(
//         this.http.post(`${API_URL}/api/fingerprint/verify`, {
//           template: storedTemplate
//         })
//       );

//       this.fingerprintQuality = verifyResp.quality || 0;
//       this.fingerprintScore = verifyResp.score || 0;

//       // 5. Check if fingerprint matched
//       if (!verifyResp.isMatched) {
//         this.verificationStatus = 'error';
//         this.errorMessage = `Fingerprint verification failed! (Quality: ${this.fingerprintQuality}, Score: ${this.fingerprintScore})`;
//         console.error('[VOTE] ❌ Fingerprint does not match');
//         this.cdr.detectChanges();
//         return;
//       }

//       // 6. FINGERPRINT MATCHED
//       console.log('[VOTE] ✅ Fingerprint verified successfully!');
//       this.verificationStatus = 'success';
//       this.cdr.detectChanges();

//       await new Promise(resolve => setTimeout(resolve, 1500));

//       console.log('[VOTE] Step 4: Submitting vote to blockchain...');

//       // 7. Submit vote
//       const voteResp: any = await firstValueFrom(
//         this.http.post(`${API_URL}/api/vote/submit`, {
//           candidateId: this.selectedCandidate.id
//         }, { withCredentials: true })
//       );

//       console.log('[VOTE] ✅ Vote submitted. TxID:', voteResp.txId);

//       // 8. Create receipt
//       const receiptData = {
//         employee: {
//           name: this.fullUserData?.name || this.userName,
//           id: this.employeeId,
//           department: this.fullUserData?.department || this.fullUserData?.designation || 'N/A',
//           email: this.fullUserData?.email || 'N/A',
//           role: this.fullUserData?.role || 'Employee'
//         },
//         candidate: {
//           name: this.selectedCandidate.name,
//           department: this.selectedCandidate.department || 'General'
//         },
//         vote: {
//           txId: voteResp.txId,
//           timestamp: new Date().toLocaleString(),
//           quality: this.fingerprintQuality,
//           score: this.fingerprintScore
//         }
//       };
      
//       sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

//       // 9. Navigate
//       setTimeout(() => {
//          this.authService.completeStep(4);
//          this.router.navigate(['/step5']);
//       }, 1000);

//     } catch (error: any) {
//       this.verificationStatus = 'error';
      
//       if (error instanceof HttpErrorResponse) {
//         this.errorMessage = error.error?.error || "Server error occurred.";
//       } else {
//         this.errorMessage = error.message || "Verification failed.";
//       }
      
//       if (this.errorMessage.includes('Scanner not reachable') || 
//           this.errorMessage.includes('ECONNREFUSED') ||
//           this.errorMessage.includes('503')) {
//         this.errorMessage = 'Cannot connect to fingerprint scanner. Please check if scanner is connected.';
//       }
      
//       console.error("[VOTE] ❌ Error:", error);
//       this.cdr.detectChanges();
//     }
//   }

//   private updateTimeLeftString(totalSeconds: number) {
//     const h = Math.floor(totalSeconds / 3600);
//     const m = Math.floor((totalSeconds % 3600) / 60);
//     const s = totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }
// }

// //step4.ts
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { LucideAngularModule, Check, Fingerprint, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { firstValueFrom } from 'rxjs';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step4',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step4.component.html',
//   styleUrls: ['./step4.component.css']
// })
// export class Step4Component implements OnInit, OnDestroy {
//   readonly icons = { Check, Fingerprint, Loader2 };
//   logoImg = '/dataSoft.svg';
  
//   // --- STATE ---
//   isLoadingData = true; 
//   userProfileImg = 'assets/images/professional_headshot_of_a_man.png'; 
//   userName = 'User'; 
//   employeeId: string = ''; 
  
//   fullUserData: any = null;
//   selectedCandidate: any = null;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "active" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   timeLeft = "05:45:35";
//   verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
//   errorMessage: string = ''; 
//   fingerprintQuality: number = 0;
//   fingerprintScore: number = 0;
  
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private authService: AuthService
//   ) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
//     this.loadData();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   async loadData() {
//     try {
//       this.isLoadingData = true;
//       const candidateId = sessionStorage.getItem('voteCandidateId');
      
//       if (!candidateId) {
//         this.router.navigate(['/step3']);
//         return;
//       }

//       const userReq = this.http.get(`${API_URL}/api/employee/me`, { withCredentials: true });
//       const candidatesReq = this.http.get(`${API_URL}/api/candidates`, { withCredentials: true });

//       const [userData, candidatesData]: [any, any] = await Promise.all([
//         firstValueFrom(userReq),
//         firstValueFrom(candidatesReq)
//       ]);

//       if (userData) {
//         this.fullUserData = userData;
//         if (userData.name) this.userName = userData.name;
//         if (userData.photoUrl) this.userProfileImg = userData.photoUrl;
//         this.employeeId = (userData.dsId || userData.employeeId || userData.id || '').toString();
        
//         console.log('Logged in User Data:', userData);
//         console.log('Employee ID set to:', this.employeeId);
//       }

//       this.selectedCandidate = candidatesData.find((c: any) => c.id.toString() === candidateId.toString());

//       if (!this.selectedCandidate) {
//         this.router.navigate(['/step3']);
//       }

//     } catch (error) {
//       console.error("Error loading step 4 data", error);
//     } finally {
//       this.isLoadingData = false;
//       this.cdr.detectChanges();
//     }
//   }

//   onChangeVote() {
//     sessionStorage.removeItem('voteCandidateId');
//     this.authService.setStep(3);
//     this.router.navigate(['/step3']);
//   }

//   async handleCastVote() {
//     if (this.verificationStatus === 'success' || !this.selectedCandidate) return;
    
//     // 1. Reset State
//     this.verificationStatus = 'scanning';
//     this.errorMessage = '';
//     this.fingerprintQuality = 0;
//     this.fingerprintScore = 0;
//     this.cdr.detectChanges();

//     try {
//       console.log('[VOTE] Step 1: Fetching employee data...');
      
//       // 2. Get employee data to check if biometric exists
//       const employeeResp: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/employee/${this.employeeId}`, { withCredentials: true })
//       );

//       console.log('[VOTE] Employee data:', employeeResp);

//       if (!employeeResp.hasBiometric) {
//         throw new Error('No fingerprint registered. Please register first.');
//       }

//       console.log('[VOTE] Step 2: Fetching stored fingerprint template...');

//       // 3. Get full employee data with biometric hash from blockchain
//       const fullEmployeeResp: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/employee/full/${this.employeeId}`, { withCredentials: true })
//       );

//       const storedTemplate = fullEmployeeResp.biometricHash;

//       if (!storedTemplate) {
//         throw new Error('Fingerprint template not found in blockchain.');
//       }

//       console.log('[VOTE] Step 3: Calling scanner for verification...');
//       console.log('[VOTE] Please place your finger on the scanner now...');

//       // 4. Call /api/fingerprint/verify with stored template
//       const verifyResp: any = await firstValueFrom(
//         this.http.post(`${API_URL}/api/fingerprint/verify`, {
//           template: storedTemplate
//         })
//       );

//       console.log('[VOTE] Scanner response:', verifyResp);

//       this.fingerprintQuality = verifyResp.quality || 0;
//       this.fingerprintScore = verifyResp.score || 0;

//       // 5. Check if fingerprint matched
//       if (!verifyResp.isMatched) {
//         // FINGERPRINT DOES NOT MATCH
//         this.verificationStatus = 'error';
//         this.errorMessage = `Fingerprint verification failed! (Quality: ${this.fingerprintQuality}, Score: ${this.fingerprintScore})`;
//         console.error('[VOTE] ❌ Fingerprint does not match');
//         this.cdr.detectChanges();
//         return;
//       }

//       // 6. FINGERPRINT MATCHED - Show success
//       console.log('[VOTE] ✅ Fingerprint verified successfully!');
//       this.verificationStatus = 'success';
//       this.cdr.detectChanges();

//       // Small delay to show success message
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       console.log('[VOTE] Step 4: Submitting vote to blockchain...');

//       // 7. Submit vote to blockchain
//       const voteResp: any = await firstValueFrom(
//         this.http.post(`${API_URL}/api/vote/submit`, {
//           candidateId: this.selectedCandidate.id
//         }, {
//           withCredentials: true
//         })
//       );

//       console.log('[VOTE] ✅ Vote submitted. TxID:', voteResp.txId);

//       // 8. Create receipt data for Step 5
//       const receiptData = {
//         employee: {
//           name: this.fullUserData?.name || this.userName,
//           id: this.employeeId,
//           department: this.fullUserData?.department || this.fullUserData?.designation || 'N/A',
//           email: this.fullUserData?.email || 'N/A',
//           role: this.fullUserData?.role || 'Employee'
//         },
//         candidate: {
//           name: this.selectedCandidate.name,
//           department: this.selectedCandidate.department || 'General'
//         },
//         vote: {
//           txId: voteResp.txId,
//           timestamp: new Date().toLocaleString(),
//           quality: this.fingerprintQuality,
//           score: this.fingerprintScore
//         }
//       };
      
//       sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

//       // 9. Navigate to success page
//       setTimeout(() => {
//          this.authService.completeStep(4);
//          this.router.navigate(['/step5']);
//       }, 1000);

//     } catch (error: any) {
//       // 10. ERROR HANDLING
//       this.verificationStatus = 'error';
      
//       if (error instanceof HttpErrorResponse) {
//         this.errorMessage = error.error?.error || "Server error occurred.";
//       } else {
//         this.errorMessage = error.message || "Verification failed.";
//       }
      
//       // Special handling for scanner connection issues
//       if (this.errorMessage.includes('Scanner not reachable') || 
//           this.errorMessage.includes('ECONNREFUSED') ||
//           this.errorMessage.includes('503')) {
//         this.errorMessage = 'Cannot connect to fingerprint scanner. Please check if scanner is connected.';
//       }
      
//       console.error("[VOTE] ❌ Error:", error);
//       this.cdr.detectChanges();
//     }
//   }

//   // --- TIMER ---
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
// }



//last worked
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { LucideAngularModule, Check, Fingerprint, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { firstValueFrom } from 'rxjs';
// import { startAuthentication } from '@simplewebauthn/browser';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step4',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step4.component.html',
//   styleUrls: ['./step4.component.css']
// })
// export class Step4Component implements OnInit, OnDestroy {
//   readonly icons = { Check, Fingerprint, Loader2 };
//   logoImg = '/dataSoft.svg';
  
//   // --- STATE ---
//   isLoadingData = true; 
//   userProfileImg = 'assets/images/professional_headshot_of_a_man.png'; 
//   userName = 'User'; 
//   employeeId: string = ''; 
  
//   // [NEW] Store full user object for the detailed receipt
//   fullUserData: any = null;

//   selectedCandidate: any = null;

//   STEPS = [
//     { id: 1, label: "Login", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "active" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   timeLeft = "05:45:35";
//   verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
//   errorMessage: string = ''; 
  
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private authService: AuthService
//   ) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
//     this.loadData();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   async loadData() {
//     try {
//       this.isLoadingData = true;
//       const candidateId = sessionStorage.getItem('voteCandidateId');
      
//       if (!candidateId) {
//         this.router.navigate(['/step3']);
//         return;
//       }

//       const userReq = this.http.get(`${API_URL}/api/employee/me`, { withCredentials: true });
//       const candidatesReq = this.http.get(`${API_URL}/api/candidates`, { withCredentials: true });

//       const [userData, candidatesData]: [any, any] = await Promise.all([
//         firstValueFrom(userReq),
//         firstValueFrom(candidatesReq)
//       ]);

//       if (userData) {
//         // [UPDATED] Save full user data for PDF receipt
//         this.fullUserData = userData;

//         if (userData.name) this.userName = userData.name;
//         if (userData.photoUrl) this.userProfileImg = userData.photoUrl;
        
//         // Robust ID check
//         this.employeeId = (userData.dsId || userData.employeeId || userData.id || '').toString();
        
//         console.log('Logged in User Data:', userData);
//         console.log('Employee ID set to:', this.employeeId);
//       }

//       this.selectedCandidate = candidatesData.find((c: any) => c.id.toString() === candidateId.toString());

//       if (!this.selectedCandidate) {
//         this.router.navigate(['/step3']);
//       }

//     } catch (error) {
//       console.error("Error loading step 4 data", error);
//     } finally {
//       this.isLoadingData = false;
//       this.cdr.detectChanges();
//     }
//   }

//   // --- ACTIONS ---

//   onChangeVote() {
//     sessionStorage.removeItem('voteCandidateId');
//     this.authService.setStep(3);
//     this.router.navigate(['/step3']);
//   }

//   async handleCastVote() {
//     if (this.verificationStatus === 'success' || !this.selectedCandidate) return;
    
//     // 1. Reset State
//     this.verificationStatus = 'scanning';
//     this.errorMessage = '';
//     this.cdr.detectChanges();

//     try {
//       // 2. Request Auth Options
//       const optionsResp = await firstValueFrom(
//         this.http.post<any>(`${API_URL}/auth/login/options`, { dsId: this.employeeId })
//       );

//       // 3. Trigger Browser Biometric Prompt
//       let asseResp;
//       try {
//         asseResp = await startAuthentication(optionsResp);
//       } catch (err: any) {
//         console.error("Biometric start error", err);
//         throw new Error("Biometric scan failed or cancelled.");
//       }

//       // 4. Verify Vote & Get Transaction Hash
//       // [UPDATED] We expect the backend to return { verified: true, txId: "..." }
//       const verifyResp: any = await firstValueFrom(
//         this.http.post(`${API_URL}/auth/vote/verify`, {
//           dsId: this.employeeId,
//           body: asseResp,
//           candidateId: this.selectedCandidate.id
//         })
//       );

//       // 5. SUCCESS
//       this.verificationStatus = 'success';
//       this.cdr.detectChanges();

//       // [UPDATED] Create Detailed Receipt Data for Step 5
//       const receiptData = {
//         employee: {
//           name: this.fullUserData?.name || this.userName,
//           id: this.employeeId,
//           department: this.fullUserData?.department || 'N/A', // Using loaded data
//           email: this.fullUserData?.email || 'N/A',
//           role: this.fullUserData?.role || 'Employee'
//         },
//         candidate: {
//           name: this.selectedCandidate.name,
//           department: this.selectedCandidate.department || 'General'
//         },
//         vote: {
//           txId: verifyResp.txId, // The Real Blockchain Hash
//           timestamp: new Date().toLocaleString()
//         }
//       };
      
//       // Save to session storage
//       sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

//       setTimeout(() => {
//          this.authService.completeStep(4);
//          this.router.navigate(['/step5']);
//       }, 2000);

//     } catch (error: any) {
//       // 6. FAIL
//       this.verificationStatus = 'error';
      
//       if (error instanceof HttpErrorResponse) {
//         this.errorMessage = error.error?.error || "Verification server error.";
//       } else {
//         this.errorMessage = error.message || "Verification failed.";
//       }
      
//       console.error("Vote failed:", error);
//       this.cdr.detectChanges();
//     }
//   }

//   // --- TIMER ---
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
// }








////main
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { LucideAngularModule, Check, Fingerprint, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { firstValueFrom } from 'rxjs';
// // [TASK] Import the browser authentication function
// import { startAuthentication } from '@simplewebauthn/browser';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step4',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step4.component.html',
//   styleUrls: ['./step4.component.css']
// })
// export class Step4Component implements OnInit, OnDestroy {
//   readonly icons = { Check, Fingerprint, Loader2 };
//   logoImg = '/dataSoft.svg';
  
//   // --- STATE ---
//   isLoadingData = true; 
//   userProfileImg = 'assets/images/professional_headshot_of_a_man.png'; 
//   userName = 'User'; 
//   employeeId: string = ''; // [NEW] To store the logged-in user's ID (dsId)
  
//   selectedCandidate: any = null;

//   STEPS = [
//     { id: 1, label: "Login", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "active" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   timeLeft = "05:45:35";
//   verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
//   errorMessage: string = ''; // [NEW] To hold error messages
  
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private authService: AuthService
//   ) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
//     this.loadData();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   async loadData() {
//     try {
//       this.isLoadingData = true;
//       const candidateId = sessionStorage.getItem('voteCandidateId');
      
//       if (!candidateId) {
//         this.router.navigate(['/step3']);
//         return;
//       }

//       const userReq = this.http.get(`${API_URL}/api/employee/me`, { withCredentials: true });
//       const candidatesReq = this.http.get(`${API_URL}/api/candidates`, { withCredentials: true });

//       const [userData, candidatesData]: [any, any] = await Promise.all([
//         firstValueFrom(userReq),
//         firstValueFrom(candidatesReq)
//       ]);

//       if (userData) {
//         if (userData.name) this.userName = userData.name;
//         if (userData.photoUrl) this.userProfileImg = userData.photoUrl;
        
//         // Check dsId first, then employeeId, then id. Ensure it's a string.
//         this.employeeId = (userData.dsId || userData.employeeId || userData.id || '').toString();
        
//         console.log('Logged in User Data:', userData); // Check console to see available fields
//         console.log('Employee ID set to:', this.employeeId);
//       }

//       this.selectedCandidate = candidatesData.find((c: any) => c.id.toString() === candidateId.toString());

//       if (!this.selectedCandidate) {
//         this.router.navigate(['/step3']);
//       }

//     } catch (error) {
//       console.error("Error loading step 4 data", error);
//     } finally {
//       this.isLoadingData = false;
//       this.cdr.detectChanges();
//     }
//   }

//   // --- ACTIONS ---

//   onChangeVote() {
//     sessionStorage.removeItem('voteCandidateId');
//     this.authService.setStep(3);
//     this.router.navigate(['/step3']);
//   }

//   // [TASK] Converted React Logic to Angular
//   async handleCastVote() {
//     if (this.verificationStatus === 'success' || !this.selectedCandidate) return;
    
//     // 1. Reset State
//     this.verificationStatus = 'scanning';
//     this.errorMessage = '';
//     this.cdr.detectChanges();

//     try {
//       // 2. Request Auth Options from Backend
//       // Equivalent to: axios.post(`${API_URL}/auth/login/options`, { dsId: currentEmployee })
//       const optionsResp = await firstValueFrom(
//         this.http.post<any>(`${API_URL}/auth/login/options`, { dsId: this.employeeId })
//       );

//       // 3. Trigger Browser Biometric Prompt
//       // Equivalent to: await startAuthentication(resp.data)
//       let asseResp;
//       try {
//         asseResp = await startAuthentication(optionsResp);
//       } catch (err: any) {
//         // User cancelled or hardware failed
//         console.error("Biometric start error", err);
//         throw new Error("Biometric scan failed or cancelled.");
//       }

//       // 4. Verify Vote with Backend
//       // Equivalent to: axios.post(`${API_URL}/auth/vote/verify`, ...)
//       await firstValueFrom(
//         this.http.post(`${API_URL}/auth/vote/verify`, {
//           dsId: this.employeeId,
//           body: asseResp,
//           candidateId: this.selectedCandidate.id
//         })
//       );

//       // 5. SUCCESS: Show Green Finger & Redirect
//       this.verificationStatus = 'success';
//       this.cdr.detectChanges();

//       // [NEW] Prepare Receipt Data for Step 5
//       const receiptData = {
//         voterName: this.userName,
//         voterId: this.employeeId,
//         candidateName: this.selectedCandidate.name,
//         candidateDept: this.selectedCandidate.department || 'General',
//         timestamp: new Date().toLocaleString(), // Current date/time
//         electionDate: '15 December 2025'
//       };
      
//       // Save to session storage
//       sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

//       setTimeout(() => {
//          this.authService.completeStep(4);
//          this.router.navigate(['/step5']);
//       }, 2000);

//     } catch (error: any) {
//       // 6. FAIL: Show Red Finger & Error Message
//       this.verificationStatus = 'error';
      
//       // Extract error message safely
//       if (error instanceof HttpErrorResponse) {
//         this.errorMessage = error.error?.error || "Verification server error.";
//       } else {
//         this.errorMessage = error.message || "Verification failed.";
//       }
      
//       console.error("Vote failed:", error);
//       this.cdr.detectChanges();
//     }
//   }

//   // --- TIMER ---
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
// }





