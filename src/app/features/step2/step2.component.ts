import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Check, Loader2, AlertCircle, User } from 'lucide-angular';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  template: `
    <div
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 mt-4">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
              DATASOFT POPULARITY CONTEST
            </h1>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
              <p class="text-[#A1A1A1]">
                Status
                <span class="ml-1 text-[#529F2D] font-inter font-bold">Voting Active</span>
              </p>
              <p class="text-[#A1A1A1]">
                Date
                <span class="ml-1 text-white font-bold">{{ currentDate }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-2 md:mt-0">
            <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
            <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
          </div>
        </header>

        <div class="mb-6 hidden md:block w-full max-w-6xl mx-auto px-4">
          <div class="relative">
            <div class="absolute top-[26px] left-12 right-12 h-[4px] bg-white/10"></div>
            <div class="absolute top-[26px] left-12 h-[4px] bg-[#529F2D] w-[25%] transition-all duration-500"></div>

            <div class="flex justify-between relative z-10">
              <div *ngFor="let step of STEPS" class="flex flex-col items-center gap-3 min-w-[140px]">
                <div
                  class="w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-[#25242D]"
                  [class.border-[#529F2D]]="step.status === 'completed' || step.status === 'active'"
                  [class.border-[#A1A1A1]]="step.status === 'pending'"
                >
                  <lucide-icon *ngIf="step.status === 'completed'" [img]="icons.Check" class="text-[#529F2D]"></lucide-icon>
                  <span *ngIf="step.status !== 'completed'" [class.text-white]="step.status === 'active'" [class.text-[#A1A1A1]]="step.status === 'pending'" class="font-bold">{{ step.id }}</span>
                </div>
                <span
                  class="text-[14px] font-semibold"
                  [class.text-[#529F2D]]="step.status === 'completed'"
                  [class.text-white]="step.status === 'active'"
                  [class.text-[#707070]]="step.status === 'pending'"
                >
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 max-w-5xl mx-auto w-full mt-6 mb-10 font-inter flex flex-col items-center justify-center">
          
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20 text-[#A1A1A1]">
            <lucide-icon [img]="icons.Loader2" [size]="48" class="animate-spin mb-4 text-[#529F2D]"></lucide-icon>
            <p class="text-xl">Fetching Voter Profile...</p>
          </div>

          <div *ngIf="error && !isLoading" class="w-full max-w-lg bg-[#3d2222] border border-[#ff6b6b]/30 rounded-xl p-8 text-center">
            <lucide-icon [img]="icons.AlertCircle" [size]="48" class="mx-auto mb-4 text-[#ff6b6b]"></lucide-icon>
            <h3 class="text-xl font-bold text-white mb-2">Error Loading Profile</h3>
            <p class="text-[#A1A1A1] mb-6">{{ error }}</p>
            <button (click)="goBack()" class="px-6 py-3 bg-[#444249] hover:bg-[#535056] rounded-lg text-white font-semibold transition-colors">
              Scan QR Again
            </button>
          </div>

          <div *ngIf="!isLoading && !error && voterData" class="w-full max-w-5xl rounded-xl p-6 md:p-10 bg-[#00000054] border border-[#3E3D45] shadow-[0px_4px_4px_0px_#00000040]">
            
            <div class="flex flex-col md:flex-row gap-8 md:gap-12 h-full">
              
              <div *ngIf="getProfile().photoUrl" class="mx-auto md:mx-0 shrink-0 flex flex-col items-center justify-start">
                <div class="w-48 h-56 md:w-56 md:h-64 border-[4px] border-[#529F2D]/50 shadow-lg overflow-hidden bg-gray-800 rounded-md relative group">
                  <img
                    [src]="getProfile().photoUrl"
                    (error)="handleImgError($event)"
                    alt="Voter"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              <div class="flex-1 w-full flex flex-col h-full min-h-[300px]">
                
                <div class="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                     <h3 class="text-[#A1A1A1] uppercase tracking-widest text-sm font-bold mt-1">VOTER INFORMATION</h3>
                     <span class="px-4 py-1 rounded-full text-xs font-bold" 
                           [ngClass]="voterData.hasVoted ? 'bg-red-500/20 text-red-400' : 'bg-[#529F2D]/20 text-[#529F2D]'">
                       {{ voterData.hasVoted ? 'ALREADY VOTED' : 'ELIGIBLE TO VOTE' }}
                     </span>
                </div>

                <div class="overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    
                    <div>
                      <label class="text-[#A1A1A1] uppercase tracking-wider text-xs font-bold block mb-1">Name</label>
                      <p class="text-white text-xl font-medium leading-tight">
                        {{ getProfile().name || voterData.voterId }}
                      </p>
                    </div>

                    <div>
                      <label class="text-[#A1A1A1] uppercase tracking-wider text-xs font-bold block mb-1">Organization</label>
                      <p class="text-white text-xl font-medium leading-tight">
                        {{ voterData.tenantId }}
                      </p>
                    </div>

                    <div>
                      <label class="text-[#A1A1A1] uppercase tracking-wider text-xs font-bold block mb-1">Voter ID</label>
                      <p class="text-white text-xl font-medium leading-tight">
                        {{ voterData.voterId }}
                      </p>
                    </div>

                    <ng-container *ngFor="let key of getProfileKeys()">
                      <div *ngIf="key !== 'photoUrl' && key !== 'name' && key !== 'tenantId' && key !== 'voterId'">
                        <label class="text-[#A1A1A1] uppercase tracking-wider text-xs font-bold block mb-1">
                          {{ key }}
                        </label>
                        <p class="text-white text-xl font-medium leading-tight break-words">
                          {{ getProfile()[key] }}
                        </p>
                      </div>
                    </ng-container>

                  </div>

                  <div *ngIf="!getProfile().name && !voterData.voterId" class="py-4 opacity-50">
                    <p class="text-sm">No details available.</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto mb-6">
          <button
            (click)="goBack()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            Cancel
          </button>
          
          <button
            *ngIf="voterData && !voterData.hasVoted"
            (click)="goToVoting()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#529F2D] to-[#1D3910] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-[0_8px_24px_rgba(82,159,45,0.45)] hover:from-[#5fb834] hover:to-[#234715] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            Proceed to Vote
          </button>

          <button
            *ngIf="voterData && voterData.hasVoted"
            disabled
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-[#3E3D45] text-[#A1A1A1] cursor-not-allowed rounded-lg border border-white/5"
          >
            Voting Complete
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #448625; }
  `]
})
export class Step2Component implements OnInit {
  readonly icons = { Check, Loader2, AlertCircle, User };
  currentDate: string = '';
  logoImg = '/dataSoft.svg';

  voterData: any = null;
  parsedProfile: any = null;
  isLoading = true;
  error = '';

  STEPS = [
    { id: 1, label: "Scan QR", status: "completed" },
    { id: 2, label: "Info", status: "active" },
    { id: 3, label: "Vote", status: "pending" },
    { id: 4, label: "Verify", status: "pending" },
    { id: 5, label: "Done", status: "pending" },
  ];

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/api/voter/me', { withCredentials: true })
      .subscribe({
        next: (data) => {
            this.voterData = data;
            if (data.profile && Object.keys(data.profile).length > 0) {
                 this.parsedProfile = data.profile;
            } else if (data.profileJson) {
                try {
                    this.parsedProfile = typeof data.profileJson === 'string' ? JSON.parse(data.profileJson) : data.profileJson;
                } catch(e) { this.parsedProfile = {}; }
            }
            this.isLoading = false; 
            this.cdr.detectChanges(); 
        },
        error: (err) => {
            this.isLoading = false;
            if (err.status === 401 || err.status === 403) {
              this.error = "Session expired. Please scan QR again.";
            } else {
              this.error = "Could not load profile.";
            }
            this.cdr.detectChanges(); 
        }
      });
  }

  getProfile() { return this.parsedProfile || {}; }
  getProfileKeys() { return this.parsedProfile ? Object.keys(this.parsedProfile) : []; }
  handleImgError(event: any) { event.target.src = 'assets/default-user.png'; }
  goToVoting() { this.router.navigate(['/step3']); }
  goBack() { this.router.navigate(['/verify-qr']); }
}

// import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- Import ChangeDetectorRef
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-step2',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="container">
      
//       <div *ngIf="isLoading" class="state-msg">
//         <div class="spinner"></div>
//         <p>Fetching Voter Profile...</p>
//       </div>

//       <div *ngIf="error" class="error-box">
//         <h3>⚠️ Error</h3>
//         <p>{{ error }}</p>
//         <button (click)="goBack()">Scan QR Again</button>
//       </div>

//       <div *ngIf="!isLoading && !error && voterData" class="profile-card">
//         <div class="header">
//             <img [src]="getProfile().photoUrl || 'assets/default-user.png'" 
//                  class="avatar" 
//                  (error)="handleImgError($event)" 
//                  alt="User">
//             <h1>Welcome, {{ getProfile().name || voterData.voterId }}</h1>
//         </div>

//         <div class="info-grid">
//           <div class="info-item">
//             <label>Voter ID</label>
//             <span>{{ voterData.voterId }}</span>
//           </div>
//           <div class="info-item">
//             <label>Organization</label>
//             <span>{{ voterData.tenantId }}</span>
//           </div>
//           <div class="info-item full-width">
//              <label>Status</label>
//              <span class="badge" [class.voted]="voterData.hasVoted">
//                 {{ voterData.hasVoted ? '❌ Already Voted' : '✅ Eligible to Vote' }}
//              </span>
//           </div>
//         </div>

//         <div class="details-section" *ngIf="getProfileKeys().length > 0">
//             <h3>Details</h3>
//             <div *ngFor="let key of getProfileKeys()">
//                 <div class="detail-row" *ngIf="key !== 'photoUrl' && key !== 'name'">
//                     <strong>{{ key | titlecase }}:</strong> 
//                     <span>{{ getProfile()[key] }}</span>
//                 </div>
//             </div>
//         </div>

//         <button *ngIf="!voterData.hasVoted" (click)="goToVoting()" class="btn-vote">
//             🗳️ Enter Voting Booth
//         </button>
        
//         <button *ngIf="voterData.hasVoted" disabled class="btn-disabled">
//             Voting Complete
//         </button>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .container { max-width: 500px; margin: 2rem auto; font-family: sans-serif; padding: 0 1rem; }
//     .state-msg { text-align: center; margin-top: 50px; color: #666; }
//     .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
//     @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//     .error-box { background: #ffe6e6; border: 1px solid #ffcccc; color: #cc0000; padding: 20px; border-radius: 8px; text-align: center; }
//     .profile-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; padding: 20px; text-align: center; }
//     .header { margin-bottom: 20px; }
//     .avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #eee; margin-bottom: 10px; }
//     h1 { font-size: 1.5rem; margin: 0; color: #333; }
//     .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left; margin-bottom: 20px; }
//     .info-item label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 4px; }
//     .info-item span { font-weight: 600; color: #333; font-size: 1.1rem; }
//     .full-width { grid-column: span 2; text-align: center; }
//     .badge { display: inline-block; background: #e6fffa; color: #009975; padding: 8px 16px; border-radius: 20px; font-size: 1rem; }
//     .badge.voted { background: #fff5f5; color: #c53030; }
//     .details-section { text-align: left; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 20px; }
//     .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
//     .btn-vote { width: 100%; background: #2563eb; color: white; padding: 15px; border: none; border-radius: 8px; font-size: 1.2rem; cursor: pointer; font-weight: bold; transition: background 0.2s; }
//     .btn-vote:hover { background: #1d4ed8; }
//     .btn-disabled { width: 100%; background: #9ca3af; color: white; padding: 15px; border: none; border-radius: 8px; cursor: not-allowed; }
//   `]
// })
// export class Step2Component implements OnInit {
//   voterData: any = null;
//   parsedProfile: any = null;
//   isLoading = true;
//   error = '';

//   constructor(
//     private http: HttpClient, 
//     private router: Router,
//     private cdr: ChangeDetectorRef // <--- INJECT THIS
//   ) {}

//   ngOnInit() {
//     this.fetchData();
//   }

//   fetchData() {
//     this.isLoading = true;
    
//     this.http.get<any>('http://localhost:3000/api/voter/me', { withCredentials: true })
//       .subscribe({
//         next: (data) => {
//             console.log("✅ Data Received:", data);
            
//             this.voterData = data;
            
//             // Parse Profile logic
//             if (data.profile && Object.keys(data.profile).length > 0) {
//                  this.parsedProfile = data.profile;
//             } 
//             else if (data.profileJson) {
//                 try {
//                     this.parsedProfile = typeof data.profileJson === 'string' 
//                         ? JSON.parse(data.profileJson) 
//                         : data.profileJson;
//                 } catch(e) {
//                     this.parsedProfile = {};
//                 }
//             }

//             this.isLoading = false; 
            
//             // CRITICAL: Manually trigger UI update
//             this.cdr.detectChanges(); 
//         },
//         error: (err) => {
//             console.error("❌ API Error:", err);
//             this.isLoading = false;
            
//             if (err.status === 401 || err.status === 403) {
//               this.error = "Session expired. Please scan QR again.";
//             } else {
//               this.error = "Could not load profile.";
//             }

//             // CRITICAL: Manually trigger UI update
//             this.cdr.detectChanges(); 
//         }
//       });
//   }

//   getProfile() { return this.parsedProfile || {}; }
//   getProfileKeys() { return this.parsedProfile ? Object.keys(this.parsedProfile) : []; }
//   handleImgError(event: any) { event.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }
//   goToVoting() { this.router.navigate(['/voting-booth']); }
//   goBack() { this.router.navigate(['/verify-qr']); }
// }