import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
import { finalize, tap, timeout } from 'rxjs/operators';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  templateUrl: './step3.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #2A2931; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #418024; }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
  `]
})
export class Step3Component implements OnInit, OnDestroy {
  readonly icons = { Check, Loader2 };
  logoImg = '/dataSoft.svg';
  handVector = '/assets/images/Vector.png'; 

  CANDIDATES: any[] = [];
  isLoading = true;
  isVoting = false; 
  
  // CHANGED: Array to hold multiple selections
  selectedCandidateIds: string[] = []; 
  
  timeLeft = "00:00:00";
  currentDate = "";
  private timerSub!: Subscription;

  STEPS = [
    { id: 1, label: "Scan QR Code", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "active" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private http: HttpClient,
    private location: LocationStrategy,
    private socketService: SocketService
  ) {
    history.pushState(null, '', window.location.href);
    this.location.onPopState(() => history.pushState(null, '', window.location.href));
  }

  get activeIndex(): number { return this.STEPS.findIndex((s) => s.status === "active"); }

  // Getter to show details of the most recently clicked candidate
  get lastSelectedId(): string | null {
    if (this.selectedCandidateIds.length > 0) {
      return this.selectedCandidateIds[this.selectedCandidateIds.length - 1];
    }
    return null;
  }

  ngOnInit() {
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    this.socketService.connectVoter();

    this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
      this.updateTimeLeftString(seconds);
      this.cdr.detectChanges();
    });

    this.fetchCandidates();
  }

  ngOnDestroy() {
    if (this.timerSub) this.timerSub.unsubscribe();
  }

  fetchCandidates() {
    this.isLoading = true;
    this.http.get(`${API_URL}/api/org-voter/candidates`, { withCredentials: true })
      .pipe(
        timeout(5000),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          let rawCandidates = [];
          if (response && response.candidates) rawCandidates = response.candidates;
          else if (Array.isArray(response)) rawCandidates = response;
          else if (response && response.data) rawCandidates = response.data;

          if (rawCandidates.length > 0) {
            this.CANDIDATES = rawCandidates.map((c: any) => {
              let parsedData = {};
              const jsonSource = c.infoJson || c.profileJson;
              if (jsonSource) {
                try { parsedData = typeof jsonSource === 'string' ? JSON.parse(jsonSource) : jsonSource; } 
                catch (e) { console.warn('JSON Parse Error'); }
              }
              return { ...c, ...parsedData, id: c.candidateId || c.id || 'UNKNOWN_ID' };
            });
          }
        },
        error: (err) => console.error('Error fetching candidates:', err)
      });
  }

  // --- CHANGED: TOGGLE LOGIC (Max 3) ---
  toggleCandidate(id: string) {
    const index = this.selectedCandidateIds.indexOf(id);

    if (index > -1) {
      // Already selected? Remove it.
      this.selectedCandidateIds.splice(index, 1);
    } else {
      // Not selected? Check limit.
      if (this.selectedCandidateIds.length < 3) {
        this.selectedCandidateIds.push(id);
      } else {
        alert("You can only select a maximum of 3 candidates.");
      }
    }
  }

  // Helper for UI
  isSelected(id: string): boolean {
    return this.selectedCandidateIds.includes(id);
  }

  getDynamicDetails(candidate: any): { key: string, value: any }[] {
    if (!candidate) return [];
    // Hide 'voteCount' here so voters don't see live results while voting
    const excludedKeys = ['docType', 'id', 'candidateId', 'tenantId', 'profileJson', 'infoJson', 'image', 'photoUrl', 'name', 'hasVoted', 'voteCount'];
    return Object.keys(candidate)
      .filter(key => !excludedKeys.includes(key) && candidate[key] && typeof candidate[key] !== 'object')
      .map(key => ({ key, value: candidate[key] }));
  }

  // --- CAST VOTE (SEND ARRAY) ---
  castVote() {
    if (this.selectedCandidateIds.length === 0) return;

    const count = this.selectedCandidateIds.length;
    if (!confirm(`You have selected ${count} candidate(s). Confirm vote? This cannot be undone.`)) {
      return;
    }

    this.isVoting = true;

    // Send Array
    const payload = { candidateIds: this.selectedCandidateIds };

    this.http.post(`${API_URL}/api/org-voter/cast-vote`, payload, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.isVoting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            // Store data for next step if needed
            sessionStorage.setItem('voteCount', count.toString());
            this.router.navigate(['/step5']);
          }
        },
        error: (err) => {
          console.error('Vote Failed:', err);
          const errorMsg = err.error?.error || 'Failed to cast vote. Please try again.';
          alert(errorMsg);
        }
      });
  }

  cancelVote() {
    if (confirm('Are you sure you want to cancel? You will be logged out.')) {
      this.router.navigate(['/']);
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




//main
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule, LocationStrategy } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
// import { finalize, tap, timeout } from 'rxjs/operators';
// import { SocketService } from '../../core/services/socket.service';
// import { Subscription } from 'rxjs';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-step3',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './step3.component.html',
//   styles: [`
//     .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//     .custom-scrollbar::-webkit-scrollbar-track { background: #2A2931; border-radius: 4px; }
//     .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
//     .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #418024; }
    
//     @keyframes fadeIn {
//         from { opacity: 0; transform: translateY(10px); }
//         to { opacity: 1; transform: translateY(0); }
//     }
//     .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
//   `]
// })
// export class Step3Component implements OnInit, OnDestroy {
//   readonly icons = { Check, Loader2 };
//   logoImg = '/dataSoft.svg';
//   handVector = '/assets/images/Vector.png'; 

//   CANDIDATES: any[] = [];
//   isLoading = true;
//   isVoting = false; // New state for the voting button
//   selectedCandidateId: string | null = null;
//   timeLeft = "00:00:00";
//   currentDate = "";
//   private timerSub!: Subscription;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "active" },
//     // Skipped Step 4 as per requirement
//     { id: 5, label: "Success Message", status: "pending" },
//   ];

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private http: HttpClient,
//     private location: LocationStrategy,
//     private socketService: SocketService
//   ) {
//     history.pushState(null, '', window.location.href);
//     this.location.onPopState(() => history.pushState(null, '', window.location.href));
//   }

//   get activeIndex(): number { return this.STEPS.findIndex((s) => s.status === "active"); }

//   ngOnInit() {
//     const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
//     this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

//     this.socketService.connectVoter();

//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       this.updateTimeLeftString(seconds);
//       this.cdr.detectChanges();
//     });

//     this.fetchCandidates();
//   }

//   ngOnDestroy() {
//     if (this.timerSub) this.timerSub.unsubscribe();
//   }

//   fetchCandidates() {
//     this.isLoading = true;
//     this.http.get(`${API_URL}/api/org-voter/candidates`, { withCredentials: true })
//       .pipe(
//         timeout(5000),
//         finalize(() => {
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         })
//       )
//       .subscribe({
//         next: (response: any) => {
//           let rawCandidates = [];
//           if (response && response.candidates) rawCandidates = response.candidates;
//           else if (Array.isArray(response)) rawCandidates = response;
//           else if (response && response.data) rawCandidates = response.data;

//           if (rawCandidates.length > 0) {
//             this.CANDIDATES = rawCandidates.map((c: any) => {
//               let parsedData = {};
//               const jsonSource = c.infoJson || c.profileJson;
//               if (jsonSource) {
//                 try { parsedData = typeof jsonSource === 'string' ? JSON.parse(jsonSource) : jsonSource; } 
//                 catch (e) { console.warn('JSON Parse Error'); }
//               }
//               return { ...c, ...parsedData, id: c.candidateId || c.id || 'UNKNOWN_ID' };
//             });
//           }
//         },
//         error: (err) => console.error('Error fetching candidates:', err)
//       });
//   }

//   selectCandidate(id: string) {
//     this.selectedCandidateId = id;
//   }

//   getDynamicDetails(candidate: any): { key: string, value: any }[] {
//     if (!candidate) return [];
//     const excludedKeys = ['docType', 'id', 'candidateId', 'tenantId', 'profileJson', 'infoJson', 'image', 'photoUrl', 'name', 'hasVoted'];
//     return Object.keys(candidate)
//       .filter(key => !excludedKeys.includes(key) && candidate[key] && typeof candidate[key] !== 'object')
//       .map(key => ({ key, value: candidate[key] }));
//   }

//   // --- NEW: CAST VOTE FUNCTION ---
//   castVote() {
//     if (!this.selectedCandidateId) return;

//     if (!confirm('Are you sure you want to cast your vote for this candidate? This cannot be undone.')) {
//       return;
//     }

//     this.isVoting = true;

//     const payload = { candidateId: this.selectedCandidateId };

//     this.http.post(`${API_URL}/api/org-voter/cast-vote`, payload, { withCredentials: true })
//       .pipe(
//         finalize(() => {
//           this.isVoting = false;
//           this.cdr.detectChanges();
//         })
//       )
//       .subscribe({
//         next: (res: any) => {
//           if (res.success) {
//             // Save info for success page if needed
//             sessionStorage.setItem('voteCandidateId', this.selectedCandidateId!);
//             this.router.navigate(['/step5']);
//           }
//         },
//         error: (err) => {
//           console.error('Vote Failed:', err);
//           const errorMsg = err.error?.error || 'Failed to cast vote. Please try again.';
//           alert(errorMsg);
//         }
//       });
//   }

//   cancelVote() {
//     if (confirm('Are you sure you want to cancel? You will be logged out.')) {
//       this.router.navigate(['/']);
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



