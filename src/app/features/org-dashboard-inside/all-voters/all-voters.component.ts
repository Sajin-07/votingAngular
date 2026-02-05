import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Voter {
  id: string;
  tenantId: string;
  docType?: string;
  profileJson?: string;
  infoJson?: string;
  voterId: string;
  hasVoted: boolean;
  votedAt?: string;
  registeredAt?: string;
  // Parsed fields:
  name?: string;
  email?: string;
  photoUrl?: string;
  blood?: string;
  designation?: string;
  [key: string]: any; 
}

interface VotersResponse {
  success: boolean;
  tenantId: string;
  totalVoters: number;
  votedCount: number;
  notVotedCount: number;
  voters: Voter[];
  error?: string;
}

type FilterType = 'all' | 'voted' | 'pending';

@Component({
  selector: 'app-all-voters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-6"
         [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'">
      
      <div class="max-w-7xl mx-auto mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">All Voters</h1>
            <p class="text-white/60 mt-1">Manage and view all registered voters</p>
          </div>
          <div *ngIf="!loading && !error" class="text-right">
            <p class="text-sm text-white/50">Organization ID</p>
            <p class="text-lg font-semibold text-white/90">{{ tenantId || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="max-w-7xl mx-auto">
        <div class="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8 border border-white/10">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p class="text-white/80">Loading voters...</p>
            <p class="text-sm text-white/40">{{ loadingMessage }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="error && !loading" class="max-w-7xl mx-auto">
        <div class="bg-red-500/10 border border-red-500/50 rounded-lg p-6 backdrop-blur-sm">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-medium text-red-200">Error Loading Voters</h3>
              <p class="mt-2 text-sm text-red-200/80">{{ errorMessage }}</p>
              <div class="mt-4">
                <button 
                  (click)="loadVoters()" 
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && voters.length === 0" class="max-w-7xl mx-auto">
        <div class="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-12 text-center border border-white/10">
          <svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-white">No voters found</h3>
          <p class="mt-2 text-sm text-white/50">Get started by adding your first voter.</p>
        </div>
      </div>

      <div *ngIf="!loading && !error && voters.length > 0" class="max-w-7xl mx-auto">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/10">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-blue-200">Total Voters</p>
                <p class="text-3xl font-bold text-white mt-1">{{ totalVoters }}</p>
              </div>
              <div class="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <svg class="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/10">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-emerald-200">Voted</p>
                <p class="text-3xl font-bold text-emerald-400 mt-1">{{ votedCount }}</p>
                <p class="text-xs text-emerald-200/60 mt-1">{{ votedPercentage }}% turnout</p>
              </div>
              <div class="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <svg class="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/10">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-orange-200">Pending</p>
                <p class="text-3xl font-bold text-orange-400 mt-1">{{ notVotedCount }}</p>
                <p class="text-xs text-orange-200/60 mt-1">{{ pendingPercentage }}% remaining</p>
              </div>
              <div class="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                <svg class="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 mb-6 border border-white/10">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex gap-2">
              <button 
                *ngFor="let filter of filterOptions"
                (click)="currentFilter = filter.value"
                [class.bg-blue-600]="currentFilter === filter.value"
                [class.text-white]="currentFilter === filter.value"
                [class.bg-white-5]="currentFilter !== filter.value"
                [class.bg-white-opacity-5]="currentFilter !== filter.value"
                class="px-4 py-2 rounded-lg font-medium transition-colors border border-transparent"
                [ngClass]="currentFilter !== filter.value ? 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10' : 'shadow-lg shadow-blue-900/50'">
                {{ filter.label }} <span class="text-xs opacity-70 ml-1">({{ getFilterCount(filter.value) }})</span>
              </button>
            </div>

            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                placeholder="Search name, email, ID..."
                class="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-full md:w-80 text-white placeholder-white/40 transition-all">
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/10">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-white/10">
              <thead class="bg-black/20">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider w-24">
                    Image
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Voter ID
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider w-24">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <ng-container *ngFor="let voter of filteredVoters">
                  <tr class="hover:bg-white/5 transition-colors">
                    
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="h-12 w-12 rounded-full overflow-hidden border border-white/20 shadow-sm bg-white/5">
                        <img 
                          [src]="getDisplayImage(voter)" 
                          [alt]="voter.voterId" 
                          class="h-full w-full object-cover"
                          (error)="handleImageError($event)">
                      </div>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-mono text-white/90 font-medium">{{ voter.voterId }}</span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap">
                      <span *ngIf="voter.hasVoted" 
                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span class="mr-1">✓</span> Voted
                      </span>
                      <span *ngIf="!voter.hasVoted" 
                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        <span class="mr-1">⏳</span> Pending
                      </span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        (click)="toggleRow(voter.voterId)"
                        class="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-all">
                        {{ isRowExpanded(voter.voterId) ? 'Hide' : 'More' }}
                        <svg 
                          class="h-4 w-4 transform transition-transform duration-200" 
                          [class.rotate-180]="isRowExpanded(voter.voterId)"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  <tr *ngIf="isRowExpanded(voter.voterId)" class="bg-black/10 shadow-inner">
                    <td colspan="4" class="px-6 py-6">
                      <div class="bg-white/5 rounded-lg p-5 shadow-sm border border-white/5">
                        <div class="flex items-center mb-4 border-b border-white/10 pb-2">
                          <h4 class="text-lg font-bold text-white/90">Voter Details</h4>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div *ngFor="let field of getAllFields(voter)" class="group">
                            <div class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 group-hover:text-blue-400 transition-colors">
                              {{ field.key }}
                            </div>
                            <div class="text-sm text-white/80 break-words bg-black/20 p-2 rounded border border-white/5 group-hover:border-white/20 transition-all">
                              <a *ngIf="isUrl(field.value); else plainValue" 
                                 [href]="field.value" 
                                 target="_blank" 
                                 class="text-blue-400 hover:underline flex items-center gap-1">
                                Open Link
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                              <ng-template #plainValue>
                                {{ field.value }}
                              </ng-template>
                            </div>
                          </div>
                        </div>
                        
                        <div *ngIf="getAllFields(voter).length === 0" class="text-center py-4 text-white/30 italic">
                          No additional data available.
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>

          <div *ngIf="filteredVoters.length === 0" class="p-8 text-center">
            <p class="text-white/40">No voters found matching your criteria.</p>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-white/40">
          <div>
            Showing {{ filteredVoters.length }} of {{ voters.length }} voters
          </div>
          <div>
            Last updated: {{ lastUpdated | date:'shortTime' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AllVotersComponent implements OnInit, OnDestroy {
  voters: Voter[] = [];
  loading = false;
  error = false;
  errorMessage = '';
  loadingMessage = 'Initializing...';
  tenantId = '';
  totalVoters = 0;
  votedCount = 0;
  notVotedCount = 0;
  lastUpdated = new Date();
  
  searchTerm = '';
  currentFilter: FilterType = 'all';
  
  // Define fallback image path (bot image)
  readonly fallbackImage = 'assets/images/botttsNeutral-1769937791781.png';

  expandedRows: Set<string> = new Set();
  
  filterOptions = [
    { value: 'all' as FilterType, label: 'All Voters' },
    { value: 'voted' as FilterType, label: 'Voted' },
    { value: 'pending' as FilterType, label: 'Pending' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVoters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVoters(): void {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    this.loadingMessage = 'Connecting to server...';

    this.http.get<VotersResponse>("http://localhost:3000/api/org-admin/voters", {
      withCredentials: true
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          const parsedVoters = (response.voters || []).map((voter: any) => {
            let parsedData = { ...voter };
            const jsonField = voter.profileJson || voter.infoJson;
            
            if (jsonField) {
              try {
                const parsedInfo = JSON.parse(jsonField);
                parsedData = { ...voter, ...parsedInfo };
              } catch (e) {
                console.warn('Failed to parse info for voter:', voter.voterId);
              }
            }
            return parsedData;
          });
          
          this.voters = parsedVoters;
          this.tenantId = response.tenantId;
          this.totalVoters = response.totalVoters;
          this.votedCount = response.votedCount;
          this.notVotedCount = response.notVotedCount;
          this.lastUpdated = new Date();
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.handleError(response.error || 'Unknown error occurred');
        }
      },
      error: (error: HttpErrorResponse) => {
        let message = 'Failed to load voters. ';
        if (error.status === 0) message += 'Cannot connect to server.';
        else message += error.message || 'Unknown error';
        this.handleError(message);
      }
    });
  }

  private handleError(message: string): void {
    this.error = true;
    this.errorMessage = message;
    this.loading = false;
  }

  // --- Image Logic ---

  getDisplayImage(voter: Voter): string {
    // 1. Try provided photoUrl
    if (voter.photoUrl && voter.photoUrl.trim() !== '') {
      return voter.photoUrl;
    }
    // 2. Fallback to bot image
    return this.fallbackImage;
  }

  handleImageError(event: any) {
    // Prevent infinite loop
    if (event.target.src.includes(this.fallbackImage)) {
      return;
    }
    event.target.src = this.fallbackImage;
  }

  // --- Dynamic Fields Logic ---

  getAllFields(voter: Voter): { key: string; value: any }[] {
    // Fields to HIDE in the Expanded section
    const hiddenFields = [
      'id',          
      'tenantId',    
      'docType',     
      'profileJson', 
      'infoJson',    
      'voterId',     // Shown in table column
      'hasVoted',    // Shown in table column
      'photoUrl',    // Shown in table column
      '_id'          
    ];
    
    return Object.keys(voter)
      .filter(key => 
        !hiddenFields.includes(key) && 
        voter[key] !== undefined && 
        voter[key] !== null && 
        voter[key] !== '' &&
        typeof voter[key] !== 'object'
      )
      .map(key => ({
        key: this.formatFieldName(key),
        value: voter[key]
      }));
  }

  // --- Filters & Helpers ---

  get filteredVoters(): Voter[] {
    let filtered = this.voters;
    if (this.currentFilter === 'voted') filtered = filtered.filter(v => v.hasVoted);
    else if (this.currentFilter === 'pending') filtered = filtered.filter(v => !v.hasVoted);

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        (v.name && v.name.toLowerCase().includes(search)) ||
        (v.email && v.email.toLowerCase().includes(search)) ||
        (v.voterId && v.voterId.toLowerCase().includes(search))
      );
    }
    return filtered;
  }

  getFilterCount(filter: FilterType): number {
    if (filter === 'all') return this.voters.length;
    if (filter === 'voted') return this.votedCount;
    if (filter === 'pending') return this.notVotedCount;
    return 0;
  }

  formatFieldName(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  isUrl(value: any): boolean {
    return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
  }

  toggleRow(voterId: string): void {
    if (this.expandedRows.has(voterId)) this.expandedRows.delete(voterId);
    else this.expandedRows.add(voterId);
  }

  isRowExpanded(voterId: string): boolean {
    return this.expandedRows.has(voterId);
  }

  get votedPercentage(): string {
    if (this.totalVoters === 0) return '0';
    return ((this.votedCount / this.totalVoters) * 100).toFixed(1);
  }

  get pendingPercentage(): string {
    if (this.totalVoters === 0) return '0';
    return ((this.notVotedCount / this.totalVoters) * 100).toFixed(1);
  }
}




// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Subject, takeUntil } from 'rxjs';
// import { FormsModule } from '@angular/forms';

// interface Voter {
//   id: string;
//   tenantId: string;
//   docType?: string;
//   profileJson?: string;
//   infoJson?: string;
//   voterId: string;
//   hasVoted: boolean;
//   votedAt?: string;
//   registeredAt?: string;
//   // Parsed fields:
//   name?: string;
//   email?: string;
//   photoUrl?: string;
//   blood?: string;
//   designation?: string;
//   [key: string]: any; 
// }

// interface VotersResponse {
//   success: boolean;
//   tenantId: string;
//   totalVoters: number;
//   votedCount: number;
//   notVotedCount: number;
//   voters: Voter[];
//   error?: string;
// }

// type FilterType = 'all' | 'voted' | 'pending';

// @Component({
//   selector: 'app-all-voters',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="min-h-screen bg-gray-50 p-6">
//       <div class="max-w-7xl mx-auto mb-8">
//         <div class="flex items-center justify-between">
//           <div>
//             <h1 class="text-3xl font-bold text-gray-900">All Voters</h1>
//             <p class="text-gray-600 mt-1">Manage and view all registered voters</p>
//           </div>
//           <div *ngIf="!loading && !error" class="text-right">
//             <p class="text-sm text-gray-500">Organization ID</p>
//             <p class="text-lg font-semibold text-gray-900">{{ tenantId || 'N/A' }}</p>
//           </div>
//         </div>
//       </div>

//       <div *ngIf="loading" class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow-md p-8">
//           <div class="flex flex-col items-center justify-center space-y-4">
//             <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p class="text-gray-600">Loading voters...</p>
//             <p class="text-sm text-gray-400">{{ loadingMessage }}</p>
//           </div>
//         </div>
//       </div>

//       <div *ngIf="error && !loading" class="max-w-7xl mx-auto">
//         <div class="bg-red-50 border border-red-200 rounded-lg p-6">
//           <div class="flex items-start">
//             <div class="flex-shrink-0">
//               <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div class="ml-3 flex-1">
//               <h3 class="text-lg font-medium text-red-800">Error Loading Voters</h3>
//               <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
//               <div class="mt-4">
//                 <button 
//                   (click)="loadVoters()" 
//                   class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div *ngIf="!loading && !error && voters.length === 0" class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow-md p-12 text-center">
//           <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//           </svg>
//           <h3 class="mt-4 text-lg font-medium text-gray-900">No voters found</h3>
//           <p class="mt-2 text-sm text-gray-500">Get started by adding your first voter.</p>
//         </div>
//       </div>

//       <div *ngIf="!loading && !error && voters.length > 0" class="max-w-7xl mx-auto">
//         <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Total Voters</p>
//                 <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalVoters }}</p>
//               </div>
//               <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Voted</p>
//                 <p class="text-3xl font-bold text-green-600 mt-1">{{ votedCount }}</p>
//                 <p class="text-xs text-gray-500 mt-1">{{ votedPercentage }}% turnout</p>
//               </div>
//               <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Pending</p>
//                 <p class="text-3xl font-bold text-orange-600 mt-1">{{ notVotedCount }}</p>
//                 <p class="text-xs text-gray-500 mt-1">{{ pendingPercentage }}% remaining</p>
//               </div>
//               <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div class="bg-white rounded-lg shadow-md p-4 mb-6">
//           <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div class="flex gap-2">
//               <button 
//                 *ngFor="let filter of filterOptions"
//                 (click)="currentFilter = filter.value"
//                 [class.bg-blue-600]="currentFilter === filter.value"
//                 [class.text-white]="currentFilter === filter.value"
//                 [class.bg-gray-100]="currentFilter !== filter.value"
//                 [class.text-gray-700]="currentFilter !== filter.value"
//                 class="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-500 hover:text-white">
//                 {{ filter.label }} ({{ getFilterCount(filter.value) }})
//               </button>
//             </div>

//             <div class="relative">
//               <input 
//                 type="text" 
//                 [(ngModel)]="searchTerm"
//                 placeholder="Search by name, email, or voter ID..."
//                 class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80">
//               <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div class="bg-white rounded-lg shadow-md overflow-hidden">
//           <div class="overflow-x-auto">
//             <table class="min-w-full divide-y divide-gray-200">
//               <thead class="bg-gray-50">
//                 <tr>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
//                     Image
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Voter ID
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
//                     Status
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
//                     Details
//                   </th>
//                 </tr>
//               </thead>
//               <tbody class="bg-white divide-y divide-gray-200">
//                 <ng-container *ngFor="let voter of filteredVoters">
//                   <tr class="hover:bg-gray-50 transition-colors">
                    
//                     <td class="px-6 py-4 whitespace-nowrap">
//                       <div class="h-12 w-12 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
//                         <img 
//                           [src]="getDisplayImage(voter)" 
//                           [alt]="voter.voterId" 
//                           class="h-full w-full object-cover"
//                           (error)="handleImageError($event)">
//                       </div>
//                     </td>

//                     <td class="px-6 py-4 whitespace-nowrap">
//                       <span class="text-sm font-mono text-gray-900 font-medium">{{ voter.voterId }}</span>
//                     </td>

//                     <td class="px-6 py-4 whitespace-nowrap">
//                       <span *ngIf="voter.hasVoted" 
//                             class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                         ✓ Voted
//                       </span>
//                       <span *ngIf="!voter.hasVoted" 
//                             class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
//                         ⏳ Pending
//                       </span>
//                     </td>

//                     <td class="px-6 py-4 whitespace-nowrap text-sm">
//                       <button 
//                         (click)="toggleRow(voter.voterId)"
//                         class="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1 transition-all">
//                         {{ isRowExpanded(voter.voterId) ? 'Hide' : 'More' }}
//                         <svg 
//                           class="h-4 w-4 transform transition-transform duration-200" 
//                           [class.rotate-180]="isRowExpanded(voter.voterId)"
//                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </button>
//                     </td>
//                   </tr>
                  
//                   <tr *ngIf="isRowExpanded(voter.voterId)" class="bg-gray-50 border-b border-gray-200">
//                     <td colspan="4" class="px-6 py-6">
//                       <div class="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
//                         <div class="flex items-center mb-4">
//                           <h4 class="text-lg font-bold text-gray-800">Voter Details</h4>
//                         </div>
                        
//                         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                           <div *ngFor="let field of getAllFields(voter)" class="group">
//                             <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">
//                               {{ field.key }}
//                             </div>
//                             <div class="text-sm text-gray-900 break-words bg-gray-50 p-2 rounded border border-transparent group-hover:border-gray-200 transition-all">
//                               <a *ngIf="isUrl(field.value); else plainValue" 
//                                  [href]="field.value" 
//                                  target="_blank" 
//                                  class="text-blue-600 hover:underline flex items-center gap-1">
//                                 Open Link
//                                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
//                               </a>
//                               <ng-template #plainValue>
//                                 {{ field.value }}
//                               </ng-template>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div *ngIf="getAllFields(voter).length === 0" class="text-center py-4 text-gray-400 italic">
//                           No additional data available.
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 </ng-container>
//               </tbody>
//             </table>
//           </div>

//           <div *ngIf="filteredVoters.length === 0" class="p-8 text-center">
//             <p class="text-gray-500">No voters found matching your criteria.</p>
//           </div>
//         </div>

//         <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
//           <div>
//             Showing {{ filteredVoters.length }} of {{ voters.length }} voters
//           </div>
//           <div>
//             Last updated: {{ lastUpdated | date:'medium' }}
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: []
// })
// export class AllVotersComponent implements OnInit, OnDestroy {
//   voters: Voter[] = [];
//   loading = false;
//   error = false;
//   errorMessage = '';
//   loadingMessage = 'Initializing...';
//   tenantId = '';
//   totalVoters = 0;
//   votedCount = 0;
//   notVotedCount = 0;
//   lastUpdated = new Date();
  
//   searchTerm = '';
//   currentFilter: FilterType = 'all';
  
//   // Define fallback image path (bot image)
//   readonly fallbackImage = 'assets/images/botttsNeutral-1769937791781.png';

//   expandedRows: Set<string> = new Set();
  
//   filterOptions = [
//     { value: 'all' as FilterType, label: 'All Voters' },
//     { value: 'voted' as FilterType, label: 'Voted' },
//     { value: 'pending' as FilterType, label: 'Pending' }
//   ];
  
//   private destroy$ = new Subject<void>();

//   constructor(
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.loadVoters();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadVoters(): void {
//     this.loading = true;
//     this.error = false;
//     this.errorMessage = '';
//     this.loadingMessage = 'Connecting to server...';

//     this.http.get<VotersResponse>("http://localhost:3000/api/org-admin/voters", {
//       withCredentials: true
//     })
//     .pipe(takeUntil(this.destroy$))
//     .subscribe({
//       next: (response) => {
//         if (response.success) {
//           const parsedVoters = (response.voters || []).map((voter: any) => {
//             let parsedData = { ...voter };
//             const jsonField = voter.profileJson || voter.infoJson;
            
//             if (jsonField) {
//               try {
//                 const parsedInfo = JSON.parse(jsonField);
//                 parsedData = { ...voter, ...parsedInfo };
//               } catch (e) {
//                 console.warn('Failed to parse info for voter:', voter.voterId);
//               }
//             }
//             return parsedData;
//           });
          
//           this.voters = parsedVoters;
//           this.tenantId = response.tenantId;
//           this.totalVoters = response.totalVoters;
//           this.votedCount = response.votedCount;
//           this.notVotedCount = response.notVotedCount;
//           this.lastUpdated = new Date();
//           this.loading = false;
//           this.cdr.detectChanges();
//         } else {
//           this.handleError(response.error || 'Unknown error occurred');
//         }
//       },
//       error: (error: HttpErrorResponse) => {
//         let message = 'Failed to load voters. ';
//         if (error.status === 0) message += 'Cannot connect to server.';
//         else message += error.message || 'Unknown error';
//         this.handleError(message);
//       }
//     });
//   }

//   private handleError(message: string): void {
//     this.error = true;
//     this.errorMessage = message;
//     this.loading = false;
//   }

//   // --- Image Logic ---

//   getDisplayImage(voter: Voter): string {
//     // 1. Try provided photoUrl
//     if (voter.photoUrl && voter.photoUrl.trim() !== '') {
//       return voter.photoUrl;
//     }
//     // 2. Fallback to bot image
//     return this.fallbackImage;
//   }

//   handleImageError(event: any) {
//     // Prevent infinite loop
//     if (event.target.src.includes(this.fallbackImage)) {
//       return;
//     }
//     event.target.src = this.fallbackImage;
//   }

//   // --- Dynamic Fields Logic ---

//   getAllFields(voter: Voter): { key: string; value: any }[] {
//     // Fields to HIDE in the Expanded section
//     // (Because they are system fields OR already shown in the main row columns)
//     const hiddenFields = [
//       'id',          
//       'tenantId',    
//       'docType',     
//       'profileJson', 
//       'infoJson',    
//       'voterId',     // Shown in table column
//       'hasVoted',    // Shown in table column
//       'photoUrl',    // Shown in table column
//       '_id'          
//     ];
    
//     // Note: 'name' and 'email' are NOT in hiddenFields, so they WILL appear in the expanded section.
    
//     return Object.keys(voter)
//       .filter(key => 
//         !hiddenFields.includes(key) && 
//         voter[key] !== undefined && 
//         voter[key] !== null && 
//         voter[key] !== '' &&
//         typeof voter[key] !== 'object'
//       )
//       .map(key => ({
//         key: this.formatFieldName(key),
//         value: voter[key]
//       }));
//   }

//   // --- Filters & Helpers ---

//   get filteredVoters(): Voter[] {
//     let filtered = this.voters;
//     if (this.currentFilter === 'voted') filtered = filtered.filter(v => v.hasVoted);
//     else if (this.currentFilter === 'pending') filtered = filtered.filter(v => !v.hasVoted);

//     if (this.searchTerm.trim()) {
//       const search = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(v => 
//         (v.name && v.name.toLowerCase().includes(search)) ||
//         (v.email && v.email.toLowerCase().includes(search)) ||
//         (v.voterId && v.voterId.toLowerCase().includes(search))
//       );
//     }
//     return filtered;
//   }

//   getFilterCount(filter: FilterType): number {
//     if (filter === 'all') return this.voters.length;
//     if (filter === 'voted') return this.votedCount;
//     if (filter === 'pending') return this.notVotedCount;
//     return 0;
//   }

//   formatFieldName(key: string): string {
//     return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
//   }

//   isUrl(value: any): boolean {
//     return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
//   }

//   toggleRow(voterId: string): void {
//     if (this.expandedRows.has(voterId)) this.expandedRows.delete(voterId);
//     else this.expandedRows.add(voterId);
//   }

//   isRowExpanded(voterId: string): boolean {
//     return this.expandedRows.has(voterId);
//   }

//   get votedPercentage(): string {
//     if (this.totalVoters === 0) return '0';
//     return ((this.votedCount / this.totalVoters) * 100).toFixed(1);
//   }

//   get pendingPercentage(): string {
//     if (this.totalVoters === 0) return '0';
//     return ((this.notVotedCount / this.totalVoters) * 100).toFixed(1);
//   }
// }





//main feb1
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// // import { environment } from '../../../environments/environment';
// import { Subject, takeUntil } from 'rxjs';
// import { FormsModule } from '@angular/forms';

// interface Voter {
//   id: string;
//   tenantId: string;
//   docType?: string;
//   profileJson?: string; // From chaincode - this is what's actually used
//   infoJson?: string; // Fallback
//   voterId: string;
//   hasVoted: boolean;
//   votedAt?: string;
//   registeredAt?: string;
//   // Parsed fields from profileJson:
//   name?: string;
//   email?: string;
//   photoUrl?: string;
//   blood?: string;
//   designation?: string;
//   [key: string]: any; // For dynamic fields
// }

// interface VotersResponse {
//   success: boolean;
//   tenantId: string;
//   totalVoters: number;
//   votedCount: number;
//   notVotedCount: number;
//   voters: Voter[];
//   error?: string;
// }

// type FilterType = 'all' | 'voted' | 'pending';

// @Component({
//   selector: 'app-all-voters',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <!-- DEBUG INFO - Remove after fixing -->
//     <div class="fixed top-0 right-0 bg-yellow-200 p-4 m-4 rounded shadow-lg z-50 text-xs">
//       <div><strong>Debug Info:</strong></div>
//       <div>Loading: {{ loading }}</div>
//       <div>Error: {{ error }}</div>
//       <div>Voters: {{ voters.length }}</div>
//       <div>TenantId: {{ tenantId }}</div>
//     </div>
    
//     <div class="min-h-screen bg-gray-50 p-6">
//       <!-- Header -->
//       <div class="max-w-7xl mx-auto mb-8">
//         <div class="flex items-center justify-between">
//           <div>
//             <h1 class="text-3xl font-bold text-gray-900">All Voters</h1>
//             <p class="text-gray-600 mt-1">Manage and view all registered voters</p>
//           </div>
//           <div *ngIf="!loading && !error" class="text-right">
//             <p class="text-sm text-gray-500">Organization ID</p>
//             <p class="text-lg font-semibold text-gray-900">{{ tenantId || 'N/A' }}</p>
//           </div>
//         </div>
//       </div>

//       <!-- Loading State -->
//       <div *ngIf="loading" class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow-md p-8">
//           <div class="flex flex-col items-center justify-center space-y-4">
//             <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p class="text-gray-600">Loading voters...</p>
//             <p class="text-sm text-gray-400">{{ loadingMessage }}</p>
//           </div>
//         </div>
//       </div>

//       <!-- Error State -->
//       <div *ngIf="error && !loading" class="max-w-7xl mx-auto">
//         <div class="bg-red-50 border border-red-200 rounded-lg p-6">
//           <div class="flex items-start">
//             <div class="flex-shrink-0">
//               <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div class="ml-3 flex-1">
//               <h3 class="text-lg font-medium text-red-800">Error Loading Voters</h3>
//               <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
//               <div class="mt-4">
//                 <button 
//                   (click)="loadVoters()" 
//                   class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Success State - No Voters -->
//       <div *ngIf="!loading && !error && voters.length === 0" class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow-md p-12 text-center">
//           <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//           </svg>
//           <h3 class="mt-4 text-lg font-medium text-gray-900">No voters found</h3>
//           <p class="mt-2 text-sm text-gray-500">Get started by adding your first voter.</p>
//         </div>
//       </div>

//       <!-- Success State - Voters List -->
//       <div *ngIf="!loading && !error && voters.length > 0" class="max-w-7xl mx-auto">
//         <!-- Stats Cards -->
//         <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Total Voters</p>
//                 <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalVoters }}</p>
//               </div>
//               <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Voted</p>
//                 <p class="text-3xl font-bold text-green-600 mt-1">{{ votedCount }}</p>
//                 <p class="text-xs text-gray-500 mt-1">{{ votedPercentage }}% turnout</p>
//               </div>
//               <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div class="bg-white rounded-lg shadow-md p-6">
//             <div class="flex items-center justify-between">
//               <div>
//                 <p class="text-sm text-gray-600">Pending</p>
//                 <p class="text-3xl font-bold text-orange-600 mt-1">{{ notVotedCount }}</p>
//                 <p class="text-xs text-gray-500 mt-1">{{ pendingPercentage }}% remaining</p>
//               </div>
//               <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                 <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Filters and Search -->
//         <div class="bg-white rounded-lg shadow-md p-4 mb-6">
//           <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <!-- Filter Buttons -->
//             <div class="flex gap-2">
//               <button 
//                 *ngFor="let filter of filterOptions"
//                 (click)="currentFilter = filter.value"
//                 [class.bg-blue-600]="currentFilter === filter.value"
//                 [class.text-white]="currentFilter === filter.value"
//                 [class.bg-gray-100]="currentFilter !== filter.value"
//                 [class.text-gray-700]="currentFilter !== filter.value"
//                 class="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-500 hover:text-white">
//                 {{ filter.label }} ({{ getFilterCount(filter.value) }})
//               </button>
//             </div>

//             <!-- Search -->
//             <div class="relative">
//               <input 
//                 type="text" 
//                 [(ngModel)]="searchTerm"
//                 placeholder="Search by name, email, or voter ID..."
//                 class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80">
//               <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         <!-- Voters Table -->
//         <div class="bg-white rounded-lg shadow-md overflow-hidden">
//           <div class="overflow-x-auto">
//             <table class="min-w-full divide-y divide-gray-200">
//               <thead class="bg-gray-50">
//                 <tr>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     #
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Voter Info
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Voter ID
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Voted At
//                   </th>
//                 </tr>
//               </thead>
//               <tbody class="bg-white divide-y divide-gray-200">
//                 <tr *ngFor="let voter of filteredVoters; let i = index" class="hover:bg-gray-50 transition-colors">
//                   <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {{ i + 1 }}
//                   </td>
//                   <td class="px-6 py-4 whitespace-nowrap">
//                     <div class="flex items-center">
//                       <div class="flex-shrink-0 h-10 w-10">
//                         <div class="h-10 w-10 rounded-full flex items-center justify-center"
//                              [class.bg-green-500]="voter.hasVoted"
//                              [class.bg-orange-500]="!voter.hasVoted">
//                           <span class="text-white font-medium text-sm">{{ getInitials(voter.name) }}</span>
//                         </div>
//                       </div>
//                       <div class="ml-4">
//                         <div class="text-sm font-medium text-gray-900">{{ voter.name || 'Unknown Voter' }}</div>
//                         <div *ngIf="voter.email" class="text-sm text-gray-500">{{ voter.email }}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4 whitespace-nowrap">
//                     <div class="text-sm font-mono text-gray-900">{{ voter.voterId }}</div>
//                   </td>
//                   <td class="px-6 py-4 whitespace-nowrap">
//                     <span *ngIf="voter.hasVoted" 
//                           class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                       ✓ Voted
//                     </span>
//                     <span *ngIf="!voter.hasVoted" 
//                           class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
//                       ⏳ Pending
//                     </span>
//                   </td>
//                   <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     <div *ngIf="voter.hasVoted && voter.votedAt">
//                       {{ voter.votedAt | date:'short' }}
//                     </div>
//                     <div *ngIf="!voter.hasVoted" class="text-gray-400">
//                       Not yet voted
//                     </div>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <!-- No Results -->
//           <div *ngIf="filteredVoters.length === 0" class="p-8 text-center">
//             <p class="text-gray-500">No voters found matching your criteria.</p>
//           </div>
//         </div>

//         <!-- Footer Info -->
//         <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
//           <div>
//             Showing {{ filteredVoters.length }} of {{ voters.length }} voters
//           </div>
//           <div>
//             Last updated: {{ lastUpdated | date:'medium' }}
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: []
// })
// export class AllVotersComponent implements OnInit, OnDestroy {
//   voters: Voter[] = [];
//   loading = false;
//   error = false;
//   errorMessage = '';
//   loadingMessage = 'Initializing...';
//   tenantId = '';
//   totalVoters = 0;
//   votedCount = 0;
//   notVotedCount = 0;
//   lastUpdated = new Date();
  
//   searchTerm = '';
//   currentFilter: FilterType = 'all';
  
//   filterOptions = [
//     { value: 'all' as FilterType, label: 'All Voters' },
//     { value: 'voted' as FilterType, label: 'Voted' },
//     { value: 'pending' as FilterType, label: 'Pending' }
//   ];
  
//   private destroy$ = new Subject<void>();

//   constructor(
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     console.log('🎯 [AllVoters] Component initialized');
//     this.loadVoters();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadVoters(): void {
//     this.loading = true;
//     this.error = false;
//     this.errorMessage = '';
//     this.loadingMessage = 'Connecting to server...';

//     console.log('📡 [AllVoters] Fetching voters from:', "http://localhost:3000/api/org-admin/voters");

//     this.http.get<VotersResponse>("http://localhost:3000/api/org-admin/voters", {
//       withCredentials: true
//     })
//     .pipe(takeUntil(this.destroy$))
//     .subscribe({
//       next: (response) => {
//         console.log('✅ [AllVoters] Response received:', response);
        
//         if (response.success) {
//           // Parse profileJson for each voter
//           const parsedVoters = (response.voters || []).map((voter: any) => {
//             let parsedData = { ...voter };
            
//             // Check both infoJson and profileJson (your chaincode uses profileJson)
//             const jsonField = voter.profileJson || voter.infoJson;
            
//             if (jsonField) {
//               try {
//                 const parsedInfo = JSON.parse(jsonField);
//                 console.log('🔍 Parsed info for voter:', voter.voterId, parsedInfo);
                
//                 // Merge parsed info into voter object
//                 parsedData = {
//                   ...voter,
//                   ...parsedInfo
//                 };
//               } catch (e) {
//                 console.warn('⚠️ Failed to parse profileJson for voter:', voter.voterId, e);
//               }
//             }
            
//             return parsedData;
//           });
          
//           this.voters = parsedVoters;
//           this.tenantId = response.tenantId;
//           this.totalVoters = response.totalVoters;
//           this.votedCount = response.votedCount;
//           this.notVotedCount = response.notVotedCount;
//           this.lastUpdated = new Date();
//           this.loading = false;
          
//           console.log(`✅ [AllVoters] Loaded ${this.voters.length} voters`);
//           console.log(`   - Voted: ${this.votedCount}`);
//           console.log(`   - Pending: ${this.notVotedCount}`);
//           console.log('📊 [AllVoters] Sample voter:', this.voters[0]);
//           console.log('📊 [AllVoters] All voters:', this.voters);
          
//           // Force Angular to detect changes and update the view
//           this.cdr.detectChanges();
//           console.log('🔄 [AllVoters] Change detection triggered');
//         } else {
//           this.handleError(response.error || 'Unknown error occurred');
//         }
//       },
//       error: (error: HttpErrorResponse) => {
//         console.error('❌ [AllVoters] HTTP Error:', error);
        
//         let message = 'Failed to load voters. ';
        
//         if (error.status === 0) {
//           message += 'Cannot connect to server. Please check your connection.';
//         } else if (error.status === 401) {
//           message += 'Authentication failed. Please log in again.';
//         } else if (error.status === 403) {
//           message += 'Access denied. You do not have permission to view voters.';
//         } else if (error.status === 500) {
//           message += 'Server error occurred. Please try again later.';
//         } else {
//           message += error.error?.error || error.message || 'Unknown error';
//         }
        
//         message += ` (Status: ${error.status})`;
//         this.handleError(message);
//       }
//     });
//   }

//   private handleError(message: string): void {
//     this.error = true;
//     this.errorMessage = message;
//     this.loading = false;
//     console.error('❌ [AllVoters] Error:', message);
//   }

//   get filteredVoters(): Voter[] {
//     let filtered = this.voters;

//     // Apply status filter
//     if (this.currentFilter === 'voted') {
//       filtered = filtered.filter(v => v.hasVoted);
//     } else if (this.currentFilter === 'pending') {
//       filtered = filtered.filter(v => !v.hasVoted);
//     }

//     // Apply search filter
//     if (this.searchTerm.trim()) {
//       const search = this.searchTerm.toLowerCase();
//       filtered = filtered.filter(v => 
//         (v.name && v.name.toLowerCase().includes(search)) ||
//         (v.email && v.email.toLowerCase().includes(search)) ||
//         (v.voterId && v.voterId.toLowerCase().includes(search))
//       );
//     }

//     return filtered;
//   }

//   getFilterCount(filter: FilterType): number {
//     if (filter === 'all') return this.voters.length;
//     if (filter === 'voted') return this.votedCount;
//     if (filter === 'pending') return this.notVotedCount;
//     return 0;
//   }

//   getInitials(name: string | undefined): string {
//     if (!name) return '??';
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2);
//   }

//   get votedPercentage(): string {
//     if (this.totalVoters === 0) return '0';
//     return ((this.votedCount / this.totalVoters) * 100).toFixed(1);
//   }

//   get pendingPercentage(): string {
//     if (this.totalVoters === 0) return '0';
//     return ((this.notVotedCount / this.totalVoters) * 100).toFixed(1);
//   }
// }