// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule, LocationStrategy } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HTTP
// import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { firstValueFrom } from 'rxjs';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step3',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step3.component.html',
//   styleUrls: ['./step3.component.css']
// })
// export class Step3Component implements OnInit, OnDestroy {
//   // --- ASSETS ---
//   readonly icons = { Check, Loader2 };
//   logoImg = '/dataSoft.svg';
//   handVector = '/assets/images/Vector.png';

//   // --- STATE ---
//   CANDIDATES: any[] = []; // Now empty initially
//   isLoading = true; // Loading state
//   selectedCandidateId: string | null = null; // ID matches blockchain type (string/int)

//   // --- TIMER STATE ---
//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "active" },
//     { id: 4, label: "Finger Verification", status: "pending" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient, // Inject HTTP
//     private authService: AuthService, 
//     private location: LocationStrategy 
//   ) {
//     // Prevent Back Button
//     history.pushState(null, '', window.location.href);
//     this.location.onPopState(() => {
//       history.pushState(null, '', window.location.href);
//     });
//   }

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     // 1. Start Timer
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();

//     // 2. Fetch Candidates from Blockchain
//     this.fetchCandidates();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   // --- API CALL ---
//   async fetchCandidates() {
//     try {
//       this.isLoading = true;
//       // We use withCredentials in case you decide to protect this route later
//       const data: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/candidates`, { withCredentials: true })
//       );
      
//       this.CANDIDATES = data;
//     } catch (error) {
//       console.error('Error fetching candidates:', error);
//     } finally {
//       this.isLoading = false;
//       this.cdr.detectChanges();
//     }
//   }

//   // --- ACTIONS ---
//   selectCandidate(id: string) {
//     this.selectedCandidateId = id;
//   }

//   proceed() {
//     if (this.selectedCandidateId) {
//       // Unlock Step 4
//       this.authService.completeStep(3);
//       // Pass the selected ID to next step via Session or Service if needed
//       sessionStorage.setItem('voteCandidateId', this.selectedCandidateId);
      
//       this.router.navigate(['/step4']);
//     }
//   }

//   cancelVote() {
//     if (confirm('Are you sure you want to cancel? You will be logged out.')) {
//       this.authService.logout(); 
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
// }

// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule, LocationStrategy } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { SocketService } from '../../core/services/socket.service'; // Import Socket
// import { firstValueFrom, Subscription } from 'rxjs';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step3',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step3.component.html',
//   styleUrls: ['./step3.component.css']
// })
// export class Step3Component implements OnInit, OnDestroy {
//   // --- ASSETS ---
//   readonly icons = { Check, Loader2 };
//   logoImg = '/dataSoft.svg';
//   handVector = '/assets/images/Vector.png';

//   // --- STATE ---
//   CANDIDATES: any[] = [];
//   isLoading = true;
//   selectedCandidateId: string | null = null;

//   // --- TIMER STATE (From Socket) ---
//   timeLeft = "00:00:00";
//   private timerSub!: Subscription;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "active" },
//     { id: 4, label: "Finger Verification", status: "pending" },
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private authService: AuthService, 
//     private location: LocationStrategy,
//     private socketService: SocketService // Injected Socket
//   ) {
//     history.pushState(null, '', window.location.href);
//     this.location.onPopState(() => {
//       history.pushState(null, '', window.location.href);
//     });
//   }

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     // 1. Connect Voter
//     this.socketService.connectVoter();

//     // 2. Subscribe to Timer
//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       this.updateTimeLeftString(seconds);
//       this.cdr.detectChanges();
//     });

//     // 3. Fetch Candidates
//     this.fetchCandidates();
//   }

//   ngOnDestroy() {
//     this.timerSub?.unsubscribe();
//   }

//   async fetchCandidates() {
//     try {
//       this.isLoading = true;
//       const data: any = await firstValueFrom(
//         this.http.get(`${API_URL}/api/candidates`, { withCredentials: true })
//       );
//       this.CANDIDATES = data;
//     } catch (error) {
//       console.error('Error fetching candidates:', error);
//     } finally {
//       this.isLoading = false;
//       this.cdr.detectChanges();
//     }
//   }

//   selectCandidate(id: string) {
//     this.selectedCandidateId = id;
//   }

//   proceed() {
//     if (this.selectedCandidateId) {
//       this.authService.completeStep(3);
//       sessionStorage.setItem('voteCandidateId', this.selectedCandidateId);
//       this.router.navigate(['/step4']);
//     }
//   }

//   cancelVote() {
//     if (confirm('Are you sure you want to cancel? You will be logged out.')) {
//       this.authService.logout(); 
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

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service'; // Import Socket
import { firstValueFrom, Subscription } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class Step3Component implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Check, Loader2 };
  logoImg = '/dataSoft.svg';
  handVector = '/assets/images/Vector.png';

  // --- STATE ---
  CANDIDATES: any[] = [];
  isLoading = true;
  selectedCandidateId: string | null = null;

  // --- TIMER & DATE STATE ---
  timeLeft = "00:00:00";
  currentDate = "";
  private timerSub!: Subscription;

  STEPS = [
    { id: 1, label: "Scan QR Code", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "active" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private http: HttpClient,
    private authService: AuthService, 
    private location: LocationStrategy,
    private socketService: SocketService // Injected Socket
  ) {
    history.pushState(null, '', window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, '', window.location.href);
    });
  }

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }

  ngOnInit() {
    // 1. Set Realtime Date
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // 2. Connect Voter
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

    // 4. Fetch Candidates
    this.fetchCandidates();
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }

  async fetchCandidates() {
    try {
      this.isLoading = true;
      const data: any = await firstValueFrom(
        this.http.get(`${API_URL}/api/candidates`, { withCredentials: true })
      );
      this.CANDIDATES = data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  selectCandidate(id: string) {
    this.selectedCandidateId = id;
  }

  proceed() {
    // Extra check before proceeding
    if (!this.socketService.isVotingOpen$.value) {
       this.router.navigate(['/verify-qr']);
       return;
    }

    if (this.selectedCandidateId) {
      this.authService.completeStep(3);
      sessionStorage.setItem('voteCandidateId', this.selectedCandidateId);
      this.router.navigate(['/step4']);
    }
  }

  cancelVote() {
    if (confirm('Are you sure you want to cancel? You will be logged out.')) {
      this.authService.logout(); 
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