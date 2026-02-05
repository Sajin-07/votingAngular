import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Check, Loader2, Maximize2, X } from 'lucide-angular';
import { finalize, tap, timeout } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SocketService } from '../../core/services/socket.service';
import Swal from 'sweetalert2'; // Import SweetAlert2
// Import Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    HttpClientModule, 
    HeaderComponent, 
    StepperComponent
  ],
  template: `
    <div
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <app-header></app-header>

        <app-stepper [currentStep]="3"></app-stepper>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto w-full mt-10 mb-10 font-inter">
            
            <div *ngIf="isLoading" class="md:col-span-12 flex items-center justify-center h-[312px]">
                <div class="flex flex-col items-center gap-2">
                    <lucide-icon [img]="icons.Loader2" class="w-10 h-10 text-[#529F2D] animate-spin"></lucide-icon>
                    <p class="text-[#A1A1A1]">Loading Candidates...</p>
                </div>
            </div>

            <div *ngIf="!isLoading" class="md:col-span-7 flex flex-col gap-4 h-[350px] pr-2 custom-scrollbar overflow-y-auto">
                <div *ngFor="let candidate of CANDIDATES"
                     (click)="toggleCandidate(candidate.id)"
                     class="relative group cursor-pointer rounded-lg transition-all duration-300 shrink-0 flex items-center border overflow-hidden"
                     [class.bg-[#529F2D]]="isSelected(candidate.id)"
                     [class.border-[#529F2D]]="isSelected(candidate.id)"
                     [class.bg-[#2A2931]]="!isSelected(candidate.id)"
                     [class.border-[#3E3D45]]="!isSelected(candidate.id)"
                     [class.hover:border-[#529F2D]]="!isSelected(candidate.id)"
                >
                    <div class="w-[130px] h-[130px] shrink-0 bg-black/20 overflow-hidden flex items-center justify-center">
                        <img 
                            *ngIf="candidate.photoUrl || candidate.image"
                            [src]="candidate.photoUrl || candidate.image" 
                            [alt]="candidate.name || candidate.candidateId"
                            class="h-full w-full object-cover object-top"
                        />
                        <span *ngIf="!candidate.photoUrl && !candidate.image" class="text-xs text-white/50">No Img</span>
                    </div>

                    <div class="flex flex-col pl-4">
                        <h3 class="text-[20px] font-bold text-white leading-tight">
                            {{ candidate.name || candidate.candidateId }}
                        </h3>
                        <p class="text-[14px]"
                           [class.text-white/90]="isSelected(candidate.id)"
                           [class.text-[#A1A1A1]]="!isSelected(candidate.id)"
                        >
                            {{ candidate.name ? candidate.candidateId : '' }}
                        </p>
                    </div>

                    <div *ngIf="isSelected(candidate.id)" class="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                        <lucide-icon [img]="icons.Check" class="w-3 h-3 text-[#529F2D]"></lucide-icon>
                    </div>
                </div>
            </div>

            <div class="md:col-span-5">
                <div class="h-[350px] rounded-xl bg-[#222126] border shadow-inner flex items-center justify-center p-4 text-center transition-colors duration-300 relative overflow-hidden"
                     [class.border-[#529F2D]]="selectedCandidateIds.length > 0"
                     [class.border-[#333]]="selectedCandidateIds.length === 0"
                >
                    <div *ngIf="lastSelectedId; else placeholder" class="flex flex-col items-center justify-start h-full w-full animate-fadeIn overflow-y-auto custom-scrollbar pt-2">
                        
                        <ng-container *ngFor="let c of CANDIDATES">
                            <ng-container *ngIf="c.id === lastSelectedId">
                                
                                <div class="group relative w-[130px] h-[130px] rounded-lg overflow-hidden mb-4 border-2 border-[#529F2D]/50 shrink-0 shadow-lg bg-black flex items-center justify-center">
                                    <img 
                                        *ngIf="c.photoUrl || c.image"
                                        [src]="c.photoUrl || c.image" 
                                        class="w-full h-full object-cover object-top" 
                                        alt="Selected" 
                                    />
                                    <span *ngIf="!c.photoUrl && !c.image" class="text-xs text-white/50">No Image</span>

                                    <button
                                        *ngIf="c.photoUrl || c.image"
                                        (click)="openModal(c.photoUrl || c.image)"
                                        class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-zoom-in text-white gap-1"
                                    >
                                        <lucide-icon [img]="icons.Maximize2" class="w-6 h-6 text-[#529F2D]"></lucide-icon>
                                        <span class="text-xs font-bold uppercase tracking-wider">View Full</span>
                                    </button>
                                </div>

                                <h2 class="text-xl font-bold text-white leading-tight mb-1">
                                    {{ c.name || c.candidateId }}
                                </h2>
                                <p class="text-xs text-[#529F2D] uppercase tracking-wider mb-3">
                                    {{ c.candidateId }}
                                </p>

                                <div class="w-full text-left bg-black/20 p-3 rounded-lg space-y-2 mb-2">
                                    <div *ngFor="let detail of getDynamicDetails(c)" class="flex justify-between border-b border-white/5 pb-1 last:border-0">
                                        <span class="text-[#A1A1A1] text-xs uppercase font-bold">{{ detail.key }}</span>
                                        <span class="text-white text-sm font-medium text-right">{{ detail.value }}</span>
                                    </div>
                                    <div *ngIf="getDynamicDetails(c).length === 0" class="text-center text-[#A1A1A1] text-sm italic">
                                        No additional details.
                                    </div>
                                </div>
                                
                                <div class="mt-auto py-2 px-4 rounded-full bg-[#529F2D]/20 text-[#529F2D] text-xs font-bold border border-[#529F2D]/30">
                                    Selected: {{ selectedCandidateIds.length }} / 3
                                </div>

                            </ng-container>
                        </ng-container>

                    </div>

                    <ng-template #placeholder>
                        <div class="flex flex-col items-center gap-5">
                            <img [src]="handVector" alt="Select" class="w-[100px] opacity-50" />
                            <p class="text-white/50 text-sm max-w-[220px]">
                                Tap candidates from the list to select them.<br/>
                                <span class="text-[#529F2D]">Select 1 to 3 candidates.</span>
                            </p>
                        </div>
                    </ng-template>

                </div>
            </div>

        </div>

        <div class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto">
          
          <button 
            (click)="cancelVote()" 
            [disabled]="isVoting"
            [class.opacity-50]="isVoting"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            Cancel Vote
          </button>
         
          <button 
            (click)="castVote()" 
            [disabled]="selectedCandidateIds.length === 0 || isLoading || isVoting" 
            [class.opacity-50]="selectedCandidateIds.length === 0 || isLoading || isVoting" 
            [class.cursor-not-allowed]="selectedCandidateIds.length === 0 || isLoading || isVoting" 
            class="h-[60px] w-full md:w-[200px] flex items-center justify-center uppercase font-semibold text-[18px] bg-gradient-to-r from-[#529F2D] to-[#1D3910] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-[0_8px_24px_rgba(82,159,45,0.45)] hover:from-[#5fb834] hover:to-[#234715] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            <ng-container *ngIf="isVoting; else btnText">
               <lucide-icon [img]="icons.Loader2" class="w-6 h-6 animate-spin mr-2"></lucide-icon>
               Casting...
            </ng-container>
            <ng-template #btnText>
               {{ selectedCandidateIds.length > 0 ? "Cast " + selectedCandidateIds.length + " Vote(s)" : "Select Candidates" }}
            </ng-template>
          </button>
        </div>

      </div>

      <div *ngIf="modalImage" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn">
          <div class="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
              
              <button (click)="closeModal()" class="absolute -top-12 right-0 md:right-0 p-2 text-white hover:text-[#529F2D] transition-colors">
                  <lucide-icon [img]="icons.X" class="w-8 h-8"></lucide-icon>
              </button>

              <img [src]="modalImage" class="w-auto h-auto max-h-[85vh] max-w-full rounded-lg shadow-2xl border-2 border-[#333] animate-zoomIn" alt="Full View">
          </div>
          
          <div class="absolute inset-0 -z-10" (click)="closeModal()"></div>
      </div>

    </div>
  `,
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

    /* Modal Animation */
    @keyframes zoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .animate-zoomIn { animation: zoomIn 0.2s ease-out forwards; }
  `]
})
export class Step3Component implements OnInit {
  readonly icons = { Check, Loader2, Maximize2, X };
  handVector = '/assets/images/Vector.png'; 

  CANDIDATES: any[] = [];
  isLoading = true;
  isVoting = false; 
  
  selectedCandidateIds: string[] = []; 
  
  // New Variables for Modal
  modalImage: string | null = null;

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

  get lastSelectedId(): string | null {
    if (this.selectedCandidateIds.length > 0) {
      return this.selectedCandidateIds[this.selectedCandidateIds.length - 1];
    }
    return null;
  }

  ngOnInit() {
    this.socketService.connectVoter();
    this.fetchCandidates();
  }

  // Removed ngOnDestroy as timerSub is removed (Header handles timer)

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

  toggleCandidate(id: string) {
    const index = this.selectedCandidateIds.indexOf(id);
    if (index > -1) {
      this.selectedCandidateIds.splice(index, 1);
    } else {
      if (this.selectedCandidateIds.length < 3) {
        this.selectedCandidateIds.push(id);
      } else {
        alert("You can only select a maximum of 3 candidates.");
      }
    }
  }

  isSelected(id: string): boolean {
    return this.selectedCandidateIds.includes(id);
  }

  getDynamicDetails(candidate: any): { key: string, value: any }[] {
    if (!candidate) return [];
    const excludedKeys = ['docType', 'id', 'candidateId', 'tenantId', 'profileJson', 'infoJson', 'image', 'photoUrl', 'name', 'hasVoted', 'voteCount'];
    return Object.keys(candidate)
      .filter(key => !excludedKeys.includes(key) && candidate[key] && typeof candidate[key] !== 'object')
      .map(key => ({ key, value: candidate[key] }));
  }

  // --- Modal Logic ---
  openModal(imageUrl: string) {
    if (imageUrl) {
      this.modalImage = imageUrl;
    }
  }

  closeModal() {
    this.modalImage = null;
  }

  castVote() {
    if (this.selectedCandidateIds.length === 0) return;

    if (!confirm(`Confirm vote for ${this.selectedCandidateIds.length} candidate(s)?`)) {
      return;
    }

    this.isVoting = true;
    const payload = { candidateIds: this.selectedCandidateIds };

    this.http.post(`${API_URL}/api/org-voter/cast-vote`, payload, { withCredentials: true })
      .pipe(finalize(() => { this.isVoting = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            const receiptData = {
              voterId: res.data.voterId,
              txId: res.data.txId,
              timestamp: res.data.timestamp
            };
            sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));
            this.router.navigate(['/step4']);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Failed to cast vote.');
        }
      });
  }

  // cancelVote() {
  //   if (confirm('Are you sure you want to cancel? You will be logged out.')) {
  //     this.router.navigate(['/']);
  //   }
  // }
  cancelVote() {
    Swal.fire({
      title: 'Cancel Voting?',
      text: 'Are you sure you want to cancel? You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#529F2D',
      confirmButtonText: 'Yes, Cancel & Logout',
      cancelButtonText: 'No, Continue',
      background: '#25242D',
      color: '#ffffff',
      iconColor: '#ffbb33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Call Logout API
        this.http.post(`${API_URL}/api/voter/logout`, {}, { withCredentials: true })
          .pipe(
            finalize(() => {
              // Navigate to verify-qr regardless of API success/fail
              this.router.navigate(['/verify-qr']);
            })
          )
          .subscribe({
            next: () => console.log('Logged out successfully'),
            error: (err) => console.error('Logout error', err)
          });
      }
    });
  }
}


// // main 3 votes min 1 vote
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
//   isVoting = false; 
  
//   // CHANGED: Array to hold multiple selections
//   selectedCandidateIds: string[] = []; 
  
//   timeLeft = "00:00:00";
//   currentDate = "";
//   private timerSub!: Subscription;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "active" },
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

//   // Getter to show details of the most recently clicked candidate
//   get lastSelectedId(): string | null {
//     if (this.selectedCandidateIds.length > 0) {
//       return this.selectedCandidateIds[this.selectedCandidateIds.length - 1];
//     }
//     return null;
//   }

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

//   // --- CHANGED: TOGGLE LOGIC (Max 3) ---
//   toggleCandidate(id: string) {
//     const index = this.selectedCandidateIds.indexOf(id);

//     if (index > -1) {
//       // Already selected? Remove it.
//       this.selectedCandidateIds.splice(index, 1);
//     } else {
//       // Not selected? Check limit.
//       if (this.selectedCandidateIds.length < 3) {
//         this.selectedCandidateIds.push(id);
//       } else {
//         alert("You can only select a maximum of 3 candidates.");
//       }
//     }
//   }

//   // Helper for UI
//   isSelected(id: string): boolean {
//     return this.selectedCandidateIds.includes(id);
//   }

//   getDynamicDetails(candidate: any): { key: string, value: any }[] {
//     if (!candidate) return [];
//     // Hide 'voteCount' here so voters don't see live results while voting
//     const excludedKeys = ['docType', 'id', 'candidateId', 'tenantId', 'profileJson', 'infoJson', 'image', 'photoUrl', 'name', 'hasVoted', 'voteCount'];
//     return Object.keys(candidate)
//       .filter(key => !excludedKeys.includes(key) && candidate[key] && typeof candidate[key] !== 'object')
//       .map(key => ({ key, value: candidate[key] }));
//   }

//   // --- CAST VOTE (SEND ARRAY) ---
//   castVote() {
//     if (this.selectedCandidateIds.length === 0) return;

//     if (!confirm(`Confirm vote for ${this.selectedCandidateIds.length} candidate(s)?`)) {
//       return;
//     }

//     this.isVoting = true;
//     const payload = { candidateIds: this.selectedCandidateIds };

//     this.http.post(`${API_URL}/api/org-voter/cast-vote`, payload, { withCredentials: true })
//       .pipe(finalize(() => { this.isVoting = false; this.cdr.detectChanges(); }))
//       .subscribe({
//         next: (res: any) => {
//           if (res.success) {
            
//             // ✅ FIX: Save the Backend Response to Session Storage
//             const receiptData = {
//               voterId: res.data.voterId,     // From Backend
//               txId: res.data.txId,           // From Backend (Blockchain Hash)
//               timestamp: res.data.timestamp  // From Backend
//             };

//             // Store it so Step 5 can read it
//             sessionStorage.setItem('voteReceipt', JSON.stringify(receiptData));

//             // Now navigate
//             this.router.navigate(['/step5']);
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           alert('Failed to cast vote.');
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





//main 3 votes min 1 vote
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
//   isVoting = false; 
  
//   // CHANGED: Array to hold multiple selections
//   selectedCandidateIds: string[] = []; 
  
//   timeLeft = "00:00:00";
//   currentDate = "";
//   private timerSub!: Subscription;

//   STEPS = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "active" },
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

//   // Getter to show details of the most recently clicked candidate
//   get lastSelectedId(): string | null {
//     if (this.selectedCandidateIds.length > 0) {
//       return this.selectedCandidateIds[this.selectedCandidateIds.length - 1];
//     }
//     return null;
//   }

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

//   // --- CHANGED: TOGGLE LOGIC (Max 3) ---
//   toggleCandidate(id: string) {
//     const index = this.selectedCandidateIds.indexOf(id);

//     if (index > -1) {
//       // Already selected? Remove it.
//       this.selectedCandidateIds.splice(index, 1);
//     } else {
//       // Not selected? Check limit.
//       if (this.selectedCandidateIds.length < 3) {
//         this.selectedCandidateIds.push(id);
//       } else {
//         alert("You can only select a maximum of 3 candidates.");
//       }
//     }
//   }

//   // Helper for UI
//   isSelected(id: string): boolean {
//     return this.selectedCandidateIds.includes(id);
//   }

//   getDynamicDetails(candidate: any): { key: string, value: any }[] {
//     if (!candidate) return [];
//     // Hide 'voteCount' here so voters don't see live results while voting
//     const excludedKeys = ['docType', 'id', 'candidateId', 'tenantId', 'profileJson', 'infoJson', 'image', 'photoUrl', 'name', 'hasVoted', 'voteCount'];
//     return Object.keys(candidate)
//       .filter(key => !excludedKeys.includes(key) && candidate[key] && typeof candidate[key] !== 'object')
//       .map(key => ({ key, value: candidate[key] }));
//   }

//   // --- CAST VOTE (SEND ARRAY) ---
//   castVote() {
//     if (this.selectedCandidateIds.length === 0) return;

//     const count = this.selectedCandidateIds.length;
//     if (!confirm(`You have selected ${count} candidate(s). Confirm vote? This cannot be undone.`)) {
//       return;
//     }

//     this.isVoting = true;

//     // Send Array
//     const payload = { candidateIds: this.selectedCandidateIds };

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
//             // Store data for next step if needed
//             sessionStorage.setItem('voteCount', count.toString());
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



