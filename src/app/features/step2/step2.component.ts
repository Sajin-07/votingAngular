// step2.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, LocationStrategy } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Check, Loader2 } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:3000';

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
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 mt-4">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
              DATASOFT POPULARITY CONTEST
            </h1>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
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

        <!-- Progress Steps -->
        <div class="mb-6 hidden md:block w-full max-w-6xl mx-auto px-4">
          <div class="relative">
            <!-- Progress Line Background -->
            <div class="absolute top-[52px] left-24 right-24 h-[4px] bg-white/60"></div>
            <!-- Progress Line Active -->
            <div
              class="absolute top-[52px] left-24 h-[4px] bg-[#529F2D] transition-all duration-500"
              [style.width]="(activeIndex / (STEPS.length - 1)) * 85 + '%'"
            ></div>

            <!-- Steps -->
            <div class="flex justify-between relative z-10">
              <div *ngFor="let step of STEPS" class="flex flex-col items-center gap-3 min-w-[140px]">
                <span
                  class="text-[16px]"
                  [class]="step.status !== 'pending' ? 'text-[#529F2D]' : 'text-[#707070]'"
                >
                  Step {{ step.id }}
                </span>
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300"
                  [class.bg-[#529F2D]]="step.status === 'completed'"
                  [class.border-[#529F2D]]="step.status === 'completed'"
                  [class.bg-white]="step.status === 'active'"
                  [class.border-white]="step.status === 'active'"
                  [class.bg-[#A1A1A1]]="step.status === 'pending'"
                  [class.border-[#A1A1A1]]="step.status === 'pending'"
                >
                  <lucide-icon 
                    *ngIf="step.status === 'completed'" 
                    [img]="icons.Check" 
                    class="w-6 h-6 text-white"
                  ></lucide-icon>
                </div>
                <span
                  class="text-[14px] font-semibold text-center"
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

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <lucide-icon [img]="icons.Loader2" [size]="48" class="text-[#529F2D] animate-spin mx-auto mb-4"></lucide-icon>
            <p class="text-[#A1A1A1] text-lg">Loading voter information...</p>
          </div>
        </div>

        <!-- Voter Profile Card -->
        <div *ngIf="!isLoading" class="flex-1 max-w-5xl mx-auto w-full mt-10 mb-10 font-inter flex flex-col items-center justify-center">
          
          <div class="w-full max-w-5xl rounded-xl p-8 md:p-12 bg-[#00000054] border border-[#3E3D45] shadow-[0px_4px_4px_0px_#00000040]">
            
            <h2 class="text-2xl font-bold text-white mb-6 text-center md:text-left">Your Information</h2>
            
            <div class="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              
              <!-- Profile Photo -->
              <div class="mx-auto md:mx-0 shrink-0">
                <div class="w-56 h-64 border-[6px] border-white shadow-lg overflow-hidden bg-gray-800">
                  <img
                    [src]="profileImg"
                    [alt]="voterData.voterId"
                    class="w-full h-full object-cover"
                    (error)="onImageError()"
                  />
                </div>
              </div>

              <!-- Voter Details -->
              <div class="grid md:grid-cols-2 gap-y-8 gap-x-12 w-full">
                <div *ngFor="let field of voterProfileFields">
                  <label class="text-[#A1A1A1] uppercase tracking-wider text-xs font-bold block mb-1">
                    {{ field.label }}
                  </label>
                  <p class="text-white text-2xl font-medium leading-tight">{{ field.value }}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div *ngIf="!isLoading" class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto">
          
          <!-- Cancel Button -->
          <button
            (click)="cancelVote()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            Cancel Vote
          </button>
         
          <!-- Proceed Button -->
          <button
            (click)="proceedToNext()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#529F2D] to-[#1D3910] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-[0_8px_24px_rgba(82,159,45,0.45)] hover:from-[#5fb834] hover:to-[#234715] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            Proceed to Vote
          </button>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class Step2Component implements OnInit, OnDestroy {
  // Icons
  readonly icons = { Check, Loader2 };
  
  // Assets
  logoImg = '/dataSoft.svg';
  profileImg = '/assets/images/default-avatar.png';

  // State
  isLoading = true;
  currentDate: string = '';
  
  // Voter Data
  voterData: any = {
    voterId: '',
    tenantId: '',
    profileJson: '',
    hasVoted: false
  };

  // Parsed Profile Data
  parsedProfile: any = null;

  // Progress Steps
  STEPS = [
    { id: 1, label: "Scan QR Code", status: "completed" },
    { id: 2, label: "Your Information", status: "active" },
    { id: 3, label: "Candidate Choice", status: "pending" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router,
    private location: LocationStrategy
  ) {
    // Prevent back button navigation
    history.pushState(null, '', window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, '', window.location.href);
    });
  }

  ngOnInit() {
    // Set current date
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // Fetch voter profile
    this.fetchVoterProfile();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  async fetchVoterProfile() {
    try {
      console.log('📥 Fetching voter profile...');
      
      const response: any = await firstValueFrom(
        this.http.get(`${API_URL}/api/voter/profile`, { 
          withCredentials: true 
        })
      );

      console.log('✅ Profile loaded:', response);

      if (response.success && response.voter) {
        this.voterData = response.voter;
        
        // Parse profileJson if it exists
        if (this.voterData.profileJson) {
          try {
            this.parsedProfile = JSON.parse(this.voterData.profileJson);
            console.log('✅ Parsed profile:', this.parsedProfile);
          } catch (e) {
            console.warn('⚠️ Could not parse voter profile JSON');
          }
        }

        // Check if already voted
        if (this.voterData.hasVoted) {
          console.log('⚠️ Voter has already voted');
          alert('You have already cast your vote.');
          this.router.navigate(['/verify-qr']);
          return;
        }
      }

      this.isLoading = false;
      this.cdr.detectChanges();

    } catch (error: any) {
      console.error('❌ Failed to fetch voter profile:', error);
      
      if (error.status === 401 || error.status === 403) {
        console.log('🚫 Unauthorized - redirecting to verify-qr');
        alert('Session expired. Please scan your QR code again.');
        this.router.navigate(['/verify-qr']);
      } else {
        alert('Failed to load voter information. Please try again.');
        this.router.navigate(['/verify-qr']);
      }
    }
  }

  proceedToNext() {
    console.log('➡️ Proceeding to step 3');
    this.router.navigate(['/step3']);
  }

  cancelVote() {
    if (confirm('Are you sure you want to cancel? You will need to scan your QR code again.')) {
      console.log('❌ Voter cancelled');
      
      // Clear voter session
      this.http.post(`${API_URL}/api/voter/logout`, {}, { 
        withCredentials: true 
      }).subscribe({
        next: () => {
          console.log('✅ Logged out successfully');
          this.router.navigate(['/verify-qr']);
        },
        error: (err) => {
          console.error('❌ Logout error:', err);
          // Navigate anyway
          this.router.navigate(['/verify-qr']);
        }
      });
    }
  }

  onImageError() {
    console.warn('⚠️ Profile image failed to load, using default');
    this.profileImg = '/assets/images/default-avatar.png';
  }

  get voterProfileFields() {
    if (this.isLoading) return [];
    
    const fields = [
      { 
        label: "Voter ID", 
        value: this.voterData.voterId || 'N/A' 
      }
    ];

    // Add parsed profile fields if available
    if (this.parsedProfile) {
      if (this.parsedProfile.name) {
        fields.push({ label: "Name", value: this.parsedProfile.name });
      }
      if (this.parsedProfile.email) {
        fields.push({ label: "Email", value: this.parsedProfile.email });
      }
      if (this.parsedProfile.phone) {
        fields.push({ label: "Phone", value: this.parsedProfile.phone });
      }
      if (this.parsedProfile.department) {
        fields.push({ label: "Department", value: this.parsedProfile.department });
      }
      if (this.parsedProfile.designation) {
        fields.push({ label: "Designation", value: this.parsedProfile.designation });
      }
    }

    // Add organization info
    fields.push({ 
      label: "Organization", 
      value: this.voterData.tenantId || 'N/A' 
    });

    return fields;
  }

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }
}