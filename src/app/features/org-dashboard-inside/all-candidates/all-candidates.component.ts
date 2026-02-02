import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

interface Candidate {
  id: string;
  tenantId: string;
  docType?: string;
  infoJson?: string;
  voteCount?: number;
  name?: string;
  email?: string;
  position?: string;
  description?: string;
  slogan?: string;
  photoUrl?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface CandidatesResponse {
  success: boolean;
  tenantId: string;
  count: number;
  candidates: Candidate[];
  error?: string;
}

@Component({
  selector: 'app-all-candidates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">All Candidates</h1>
            <p class="text-gray-600 mt-1">Manage and view all registered candidates</p>
          </div>
          <div *ngIf="!loading && !error" class="text-right">
            <p class="text-sm text-gray-500">Organization ID</p>
            <p class="text-lg font-semibold text-gray-900">{{ tenantId || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="max-w-7xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="text-gray-600">Loading candidates...</p>
          </div>
        </div>
      </div>

      <div *ngIf="error && !loading" class="max-w-7xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-red-800">Error Loading Candidates</h3>
          <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
          <button (click)="loadCandidates()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>

      <div *ngIf="!loading && !error && candidates.length > 0" class="max-w-7xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Candidates</p>
              <p class="text-3xl font-bold text-blue-600">{{ candidates.length }}</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Total Votes</p>
              <p class="text-3xl font-bold text-green-600">{{ totalVotes }}</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-sm text-gray-600">Average Votes</p>
              <p class="text-3xl font-bold text-purple-600">{{ averageVotes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Image
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Votes
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <ng-container *ngFor="let candidate of candidates">
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="h-12 w-12 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          [src]="getDisplayImage(candidate)" 
                          [alt]="candidate.id" 
                          class="h-full w-full object-cover bg-gray-100"
                          (error)="handleImageError($event)">
                      </div>
                    </td>
                    
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm font-mono text-gray-700 font-medium">{{ candidate.id }}</span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {{ candidate.voteCount || 0 }}
                      </span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        (click)="toggleRow(candidate.id)"
                        class="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1 transition-all">
                        {{ isRowExpanded(candidate.id) ? 'Hide' : 'Show More' }}
                        <svg 
                          class="h-4 w-4 transform transition-transform duration-200" 
                          [class.rotate-180]="isRowExpanded(candidate.id)"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  <tr *ngIf="isRowExpanded(candidate.id)" class="bg-gray-50 border-b border-gray-200">
                    <td colspan="4" class="px-6 py-6">
                      <div class="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                        <div class="flex items-center mb-4">
                          <h4 class="text-lg font-bold text-gray-800">Candidate Details</h4>
                          <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">JSON Data</span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div *ngFor="let field of getAllFields(candidate)" class="group">
                            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">
                              {{ field.key }}
                            </div>
                            <div class="text-sm text-gray-900 break-words bg-gray-50 p-2 rounded border border-transparent group-hover:border-gray-200 transition-all">
                              <a *ngIf="isUrl(field.value); else plainValue" 
                                 [href]="field.value" 
                                 target="_blank" 
                                 class="text-blue-600 hover:underline flex items-center gap-1">
                                Open Link
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                              <ng-template #plainValue>
                                {{ field.value }}
                              </ng-template>
                            </div>
                          </div>
                        </div>
                        
                        <div *ngIf="getAllFields(candidate).length === 0" class="text-center py-4 text-gray-400 italic">
                          No additional data available.
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>
        
        <div *ngIf="!loading && candidates.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md mt-6">
           <p class="text-gray-500 text-lg">No candidates found.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AllCandidatesComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  loading = false;
  error = false;
  errorMessage = '';
  tenantId = '';
  
  // Define fallback image path
  readonly fallbackImage = '/assets/images/noCandidate.png';

  expandedRows: Set<string> = new Set();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCandidates(): void {
    this.loading = true;
    this.error = false;
    
    // Replace with your actual API endpoint
    this.http.get<CandidatesResponse>("http://localhost:3000/api/org-admin/candidates", {
      withCredentials: true
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.candidates = this.parseCandidates(response.candidates);
          this.tenantId = response.tenantId;
        } else {
          this.handleError(response.error || 'Unknown error');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.handleError(err.message || 'Connection failed');
        this.loading = false;
      }
    });
  }

  private parseCandidates(rawCandidates: any[]): Candidate[] {
    return (rawCandidates || []).map(candidate => {
      let parsedData = { ...candidate };
      if (candidate.infoJson) {
        try {
          const info = JSON.parse(candidate.infoJson);
          parsedData = { ...candidate, ...info };
          // Normalize image URL
          parsedData.imageUrl = info.photoUrl || info.imageUrl || candidate.imageUrl;
        } catch (e) {
          console.warn('JSON parse error', e);
        }
      }
      return parsedData;
    });
  }

  private handleError(msg: string) {
    this.error = true;
    this.errorMessage = msg;
  }

  // --- Logic for Image Display ---

  getDisplayImage(candidate: Candidate): string {
    // 1. Try candidate provided image
    if (candidate.imageUrl && candidate.imageUrl.trim() !== '') {
      return candidate.imageUrl;
    }
    if (candidate.photoUrl && candidate.photoUrl.trim() !== '') {
      return candidate.photoUrl;
    }
    
    // 2. Fallback to local asset
    return this.fallbackImage;
  }

  handleImageError(event: any) {
    // If the image (user provided) fails to load, replace it with the fallback asset
    event.target.src = this.fallbackImage;
  }

  // --- Logic for "Rest of JSON Data" ---

  getAllFields(candidate: Candidate): { key: string; value: any }[] {
    const hiddenFields = [
      'id',          
      'voteCount',   
      'imageUrl',    
      'photoUrl',    
      'tenantId',    
      'docType',     
      'infoJson',    
      '_id'          
    ];
    
    return Object.keys(candidate)
      .filter(key => 
        !hiddenFields.includes(key) && 
        candidate[key] !== undefined && 
        candidate[key] !== null && 
        candidate[key] !== '' &&
        typeof candidate[key] !== 'object'
      )
      .map(key => ({
        key: this.formatFieldName(key),
        value: candidate[key]
      }));
  }

  formatFieldName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  isUrl(value: any): boolean {
    return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'));
  }

  // --- Table Interaction ---

  toggleRow(id: string): void {
    if (this.expandedRows.has(id)) {
      this.expandedRows.delete(id);
    } else {
      this.expandedRows.add(id);
    }
  }

  isRowExpanded(id: string): boolean {
    return this.expandedRows.has(id);
  }

  get totalVotes(): number {
    return this.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  }

  get averageVotes(): string {
    if (this.candidates.length === 0) return '0';
    return (this.totalVotes / this.candidates.length).toFixed(1);
  }
}
//main feb1
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// // import { environment } from '../../../environments/environment';
// import { Subject, takeUntil } from 'rxjs';

// interface Candidate {
//   id: string;
//   tenantId: string;
//   docType?: string;
//   infoJson?: string; // Raw JSON string from blockchain
//   voteCount?: number;
//   // Parsed fields from infoJson:
//   name?: string;
//   email?: string;
//   position?: string;
//   description?: string;
//   slogan?: string;
//   photoUrl?: string;
//   imageUrl?: string;
//   [key: string]: any; // For dynamic fields
// }

// interface CandidatesResponse {
//   success: boolean;
//   tenantId: string;
//   count: number;
//   candidates: Candidate[];
//   error?: string;
// }

// @Component({
//   selector: 'app-all-candidates',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="min-h-screen bg-gray-50 p-6">
//       <!-- Header -->
//       <div class="max-w-7xl mx-auto mb-8">
//         <div class="flex items-center justify-between">
//           <div>
//             <h1 class="text-3xl font-bold text-gray-900">All Candidates</h1>
//             <p class="text-gray-600 mt-1">Manage and view all registered candidates</p>
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
//             <p class="text-gray-600">Loading candidates...</p>
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
//               <h3 class="text-lg font-medium text-red-800">Error Loading Candidates</h3>
//               <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
//               <div class="mt-4">
//                 <button 
//                   (click)="loadCandidates()" 
//                   class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//                   Try Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Success State - No Candidates -->
//       <div *ngIf="!loading && !error && candidates.length === 0" class="max-w-7xl mx-auto">
//         <div class="bg-white rounded-lg shadow-md p-12 text-center">
//           <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//           </svg>
//           <h3 class="mt-4 text-lg font-medium text-gray-900">No candidates found</h3>
//           <p class="mt-2 text-sm text-gray-500">Get started by adding your first candidate.</p>
//         </div>
//       </div>

//       <!-- Success State - Candidates List -->
//       <div *ngIf="!loading && !error && candidates.length > 0" class="max-w-7xl mx-auto">
//         <!-- Stats Card -->
//         <div class="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div class="text-center p-4 bg-blue-50 rounded-lg">
//               <p class="text-sm text-gray-600">Total Candidates</p>
//               <p class="text-3xl font-bold text-blue-600">{{ candidates.length }}</p>
//             </div>
//             <div class="text-center p-4 bg-green-50 rounded-lg">
//               <p class="text-sm text-gray-600">Total Votes</p>
//               <p class="text-3xl font-bold text-green-600">{{ totalVotes }}</p>
//             </div>
//             <div class="text-center p-4 bg-purple-50 rounded-lg">
//               <p class="text-sm text-gray-600">Average Votes</p>
//               <p class="text-3xl font-bold text-purple-600">{{ averageVotes }}</p>
//             </div>
//           </div>
//         </div>

//         <!-- Candidates Table -->
//         <div class="bg-white rounded-lg shadow-md overflow-hidden">
//           <div class="overflow-x-auto">
//             <table class="min-w-full divide-y divide-gray-200">
//               <thead class="bg-gray-50">
//                 <tr>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     #
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Candidate Info
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Position
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Votes
//                   </th>
//                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody class="bg-white divide-y divide-gray-200">
//                 <ng-container *ngFor="let candidate of candidates; let i = index">
//                   <!-- Main Row -->
//                   <tr class="hover:bg-gray-50 transition-colors">
//                     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {{ i + 1 }}
//                     </td>
//                     <td class="px-6 py-4 whitespace-nowrap">
//                       <div class="flex items-center">
//                         <div class="flex-shrink-0 h-10 w-10">
//                           <div *ngIf="candidate.imageUrl || candidate.photoUrl; else noImage" class="h-10 w-10 rounded-full overflow-hidden">
//                             <img [src]="candidate.imageUrl || candidate.photoUrl" [alt]="candidate.name || 'Candidate'" class="h-full w-full object-cover">
//                           </div>
//                           <ng-template #noImage>
//                             <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
//                               <span class="text-white font-medium text-sm">{{ getInitials(candidate.name) }}</span>
//                             </div>
//                           </ng-template>
//                         </div>
//                         <div class="ml-4">
//                           <div class="text-sm font-medium text-gray-900">{{ candidate.name || 'Unknown' }}</div>
//                           <div *ngIf="candidate.email" class="text-sm text-gray-500">{{ candidate.email }}</div>
//                           <div class="text-xs text-gray-400 font-mono">ID: {{ candidate.id }}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td class="px-6 py-4">
//                       <div class="text-sm text-gray-900">{{ candidate.position || 'N/A' }}</div>
//                       <div *ngIf="candidate.slogan || candidate.description" class="text-sm text-gray-500 max-w-xs truncate">
//                         {{ candidate.slogan || candidate.description }}
//                       </div>
//                     </td>
//                     <td class="px-6 py-4 whitespace-nowrap">
//                       <div class="flex items-center">
//                         <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                           {{ candidate.voteCount || 0 }} votes
//                         </span>
//                       </div>
//                     </td>
//                     <td class="px-6 py-4 whitespace-nowrap text-sm">
//                       <button 
//                         (click)="toggleRow(candidate.id)"
//                         class="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1">
//                         <svg *ngIf="!isRowExpanded(candidate.id)" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                         <svg *ngIf="isRowExpanded(candidate.id)" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
//                         </svg>
//                         {{ isRowExpanded(candidate.id) ? 'Less' : 'More' }}
//                       </button>
//                     </td>
//                   </tr>
                  
//                   <!-- Expanded Row (Dynamic Fields) -->
//                   <tr *ngIf="isRowExpanded(candidate.id)" class="bg-blue-50">
//                     <td colspan="5" class="px-6 py-4">
//                       <div class="bg-white rounded-lg p-4 shadow-sm">
//                         <h4 class="text-sm font-semibold text-gray-700 mb-3">Additional Information</h4>
                        
//                         <div *ngIf="getDynamicFields(candidate).length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                           <div *ngFor="let field of getDynamicFields(candidate)" class="border-l-4 border-blue-500 pl-3">
//                             <div class="text-xs text-gray-500 uppercase">{{ field.key }}</div>
//                             <div class="text-sm text-gray-900 mt-1">
//                               <a *ngIf="isUrl(field.value); else plainValue" 
//                                  [href]="field.value" 
//                                  target="_blank" 
//                                  class="text-blue-600 hover:underline">
//                                 View Link →
//                               </a>
//                               <ng-template #plainValue>
//                                 {{ field.value }}
//                               </ng-template>
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div *ngIf="getDynamicFields(candidate).length === 0" class="text-sm text-gray-500 italic">
//                           No additional fields available
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 </ng-container>
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <!-- Additional Info -->
//         <div class="mt-4 text-center text-sm text-gray-500">
//           Last updated: {{ lastUpdated | date:'medium' }}
//         </div>
//       </div>
//     </div>
//   `,
//   styles: []
// })
// export class AllCandidatesComponent implements OnInit, OnDestroy {
//   candidates: Candidate[] = [];
//   loading = false;
//   error = false;
//   errorMessage = '';
//   loadingMessage = 'Initializing...';
//   tenantId = '';
//   lastUpdated = new Date();
  
//   expandedRows: Set<string> = new Set(); // Track which rows are expanded
  
//   private destroy$ = new Subject<void>();

//   constructor(
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     console.log('🎯 [AllCandidates] Component initialized');
//     this.loadCandidates();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadCandidates(): void {
//     this.loading = true;
//     this.error = false;
//     this.errorMessage = '';
//     this.loadingMessage = 'Connecting to server...';

//     console.log('📡 [AllCandidates] Fetching candidates from:', "http://localhost:3000/api/org-admin/candidates");

//     this.http.get<CandidatesResponse>("http://localhost:3000/api/org-admin/candidates", {
//       withCredentials: true
//     })
//     .pipe(takeUntil(this.destroy$))
//     .subscribe({
//       next: (response) => {
//         console.log('✅ [AllCandidates] Response received:', response);
        
//         if (response.success) {
//           // Parse infoJson for each candidate
//           const parsedCandidates = (response.candidates || []).map((candidate: any) => {
//             let parsedData = { ...candidate };
            
//             if (candidate.infoJson) {
//               try {
//                 const parsedInfo = JSON.parse(candidate.infoJson);
//                 console.log('🔍 Parsed info for candidate:', candidate.id, parsedInfo);
                
//                 // Merge parsed info into candidate object
//                 parsedData = {
//                   ...candidate,
//                   ...parsedInfo,
//                   // Map photoUrl to imageUrl for consistency
//                   imageUrl: parsedInfo.photoUrl || parsedInfo.imageUrl || candidate.imageUrl
//                 };
//               } catch (e) {
//                 console.warn('⚠️ Failed to parse infoJson for candidate:', candidate.id, e);
//               }
//             }
            
//             return parsedData;
//           });
          
//           this.candidates = parsedCandidates;
//           this.tenantId = response.tenantId;
//           this.lastUpdated = new Date();
//           this.loading = false;
          
//           console.log(`✅ [AllCandidates] Loaded ${this.candidates.length} candidates`);
//           console.log('📊 [AllCandidates] Sample candidate:', this.candidates[0]);
//           console.log('📊 [AllCandidates] All candidates:', this.candidates);
          
//           // Force Angular to detect changes and update the view
//           this.cdr.detectChanges();
//           console.log('🔄 [AllCandidates] Change detection triggered');
//         } else {
//           this.handleError(response.error || 'Unknown error occurred');
//         }
//       },
//       error: (error: HttpErrorResponse) => {
//         console.error('❌ [AllCandidates] HTTP Error:', error);
        
//         let message = 'Failed to load candidates. ';
        
//         if (error.status === 0) {
//           message += 'Cannot connect to server. Please check your connection.';
//         } else if (error.status === 401) {
//           message += 'Authentication failed. Please log in again.';
//         } else if (error.status === 403) {
//           message += 'Access denied. You do not have permission to view candidates.';
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
//     console.error('❌ [AllCandidates] Error:', message);
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

//   get totalVotes(): number {
//     return this.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
//   }

//   get averageVotes(): string {
//     if (this.candidates.length === 0) return '0';
//     return (this.totalVotes / this.candidates.length).toFixed(1);
//   }

//   // Get all dynamic fields (excluding core fields)
//   getDynamicFields(candidate: Candidate): { key: string; value: any }[] {
//     const coreFields = ['id', 'tenantId', 'docType', 'infoJson', 'voteCount', 'imageUrl', 'photoUrl', 'name', 'position', 'slogan', 'description'];
    
//     return Object.keys(candidate)
//       .filter(key => !coreFields.includes(key) && candidate[key] !== undefined && candidate[key] !== null && candidate[key] !== '')
//       .map(key => ({
//         key: this.formatFieldName(key),
//         value: candidate[key]
//       }));
//   }

//   // Format field names nicely (camelCase to Title Case)
//   formatFieldName(key: string): string {
//     return key
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/^./, str => str.toUpperCase())
//       .trim();
//   }

//   // Check if value is a URL
//   isUrl(value: any): boolean {
//     if (typeof value !== 'string') return false;
//     return value.startsWith('http://') || value.startsWith('https://');
//   }

//   // Toggle row expansion
//   toggleRow(candidateId: string): void {
//     if (this.expandedRows.has(candidateId)) {
//       this.expandedRows.delete(candidateId);
//     } else {
//       this.expandedRows.add(candidateId);
//     }
//   }

//   isRowExpanded(candidateId: string): boolean {
//     return this.expandedRows.has(candidateId);
//   }
// }

