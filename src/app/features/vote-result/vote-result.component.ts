import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Required for inputs
import { LucideAngularModule, Trophy, Medal, Loader2, RefreshCw, Lock, Edit, Save, AlertTriangle } from 'lucide-angular';
import { finalize } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

interface Candidate {
  id: string;
  candidateId: string;
  name: string;
  voteCount: number;
  photoUrl?: string;
  image?: string;
  // New field for tie-breaking. 
  // Lower number = higher priority. Default is 999 (lowest priority)
  manualRank?: number; 
  hasTie?: boolean; // UI helper
}

@Component({
  selector: 'app-vote-result',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './vote-result.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #2A2931; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
    
    /* Animation for Tie Detection */
    @keyframes pulse-orange {
      0%, 100% { border-color: #F97316; box-shadow: 0 0 5px rgba(249, 115, 22, 0.2); }
      50% { border-color: #EA580C; box-shadow: 0 0 15px rgba(249, 115, 22, 0.5); }
    }
    .tie-alert { animation: pulse-orange 2s infinite; }
  `]
})
export class VoteResultComponent implements OnInit {
  readonly icons = { Trophy, Medal, Loader2, RefreshCw, Lock, Edit, Save, AlertTriangle };
  logoImg = '/dataSoft.svg';

  candidates: Candidate[] = [];
  isLoading = true;
  isEditMode = false; // Toggle for Admin Manual Selection
  isSaving = false;
  errorMessage = ''; 
  totalVotesCast = 0;
  
  currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchResults();
  }

  fetchResults() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get(`${API_URL}/api/org-admin/candidates`, { withCredentials: true })
      .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.candidates) {
            this.processData(response.candidates);
          } else {
            this.candidates = [];
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching results:', err);
          if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Restricted Access: Only Organization Admins can view live results.';
          } else {
            this.errorMessage = 'Failed to load results.';
          }
        }
      });
  }

  processData(data: any[]) {
    let parsedCandidates = data.map((c: any) => {
      let details = {};
      const jsonSource = c.infoJson || c.profileJson;
      if (jsonSource) {
        try { details = typeof jsonSource === 'string' ? JSON.parse(jsonSource) : jsonSource; } 
        catch (e) { console.warn('JSON Parse Error'); }
      }
      
      return {
        ...c,
        ...details,
        id: c.candidateId || c.id,
        voteCount: parseInt(c.voteCount || 0, 10),
        // Ensure manualRank exists, default to 999 if not set in DB
        manualRank: c.manualRank ? parseInt(c.manualRank) : 999 
      };
    });

    this.totalVotesCast = parsedCandidates.reduce((sum, c) => sum + c.voteCount, 0);
    this.candidates = parsedCandidates;
    this.sortCandidates();
  }

  /**
   * THE CORE SOLUTION:
   * 1. Sort by Votes (Highest first)
   * 2. If Votes equal, Sort by Manual Rank (Lowest number first)
   */
  sortCandidates() {
    this.candidates.sort((a, b) => {
      // Primary: Votes
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      // Secondary: Manual Admin Rank (Ascending: 1 beats 2)
      return (a.manualRank || 999) - (b.manualRank || 999);
    });

    // Mark Ties for UI feedback
    this.detectTies();
  }

  detectTies() {
    // Reset flags
    this.candidates.forEach(c => c.hasTie = false);

    for (let i = 0; i < this.candidates.length - 1; i++) {
      if (this.candidates[i].voteCount === this.candidates[i + 1].voteCount) {
        this.candidates[i].hasTie = true;
        this.candidates[i + 1].hasTie = true;
      }
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    // When entering edit mode, ensure manualRanks are initialized for inputs
    if (this.isEditMode) {
      this.candidates.forEach(c => {
        if (!c.manualRank || c.manualRank === 999) c.manualRank = 0; 
      });
    }
  }

  saveRanks() {
    this.isSaving = true;
    
    // Create a payload of ID + Rank
    const updates = this.candidates.map(c => ({
      candidateId: c.id,
      manualRank: c.manualRank
    }));

    // TODO: CONNECT THIS TO YOUR BACKEND
    // Example: this.http.post(`${API_URL}/api/org-admin/update-ranks`, { updates })
    
    console.log('Sending to backend:', updates);

    // Simulation of backend save delay
    setTimeout(() => {
      this.isSaving = false;
      this.isEditMode = false;
      this.sortCandidates(); // Re-sort based on new ranks
      this.cdr.detectChanges();
    }, 1000);
  }

  getPercentage(votes: number): number {
    if (this.totalVotesCast === 0) return 0;
    return Math.round((votes / this.totalVotesCast) * 100);
  }
}




// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Trophy, Medal, Loader2, RefreshCw, Lock } from 'lucide-angular';
// import { finalize } from 'rxjs/operators';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-vote-result',
//   standalone: true,
//   imports: [CommonModule, HttpClientModule, RouterModule, LucideAngularModule],
//   templateUrl: './vote-result.component.html',
//   styles: [`
//     .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//     .custom-scrollbar::-webkit-scrollbar-track { background: #2A2931; border-radius: 4px; }
//     .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
//   `]
// })
// export class VoteResultComponent implements OnInit {
//   readonly icons = { Trophy, Medal, Loader2, RefreshCw, Lock };
//   logoImg = '/dataSoft.svg';

//   candidates: any[] = [];
//   isLoading = true;
//   errorMessage = ''; // Stores access denied messages
//   totalVotesCast = 0;
  
//   currentDate = new Date().toLocaleDateString('en-GB', { 
//     day: 'numeric', month: 'long', year: 'numeric' 
//   });

//   constructor(
//     private http: HttpClient, 
//     private cdr: ChangeDetectorRef,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.fetchResults();
//   }

//   fetchResults() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     // CHANGED: Now points to the Admin API
//     this.http.get(`${API_URL}/api/org-admin/candidates`, { withCredentials: true })
//       .pipe(
//         finalize(() => {
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         })
//       )
//       .subscribe({
//         next: (response: any) => {
//           if (response.success && response.candidates) {
//             this.processData(response.candidates);
//           } else {
//             this.candidates = [];
//           }
//         },
//         error: (err: HttpErrorResponse) => {
//           console.error('Error fetching results:', err);
          
//           // Handle Unauthorized / Forbidden access (401 or 403)
//           if (err.status === 401 || err.status === 403) {
//             this.errorMessage = 'Restricted Access: Only Organization Admins can view live results.';
//           } else {
//             this.errorMessage = 'Failed to load results. Please check your network connection.';
//           }
//         }
//       });
//   }

//   processData(data: any[]) {
//     // 1. Parse JSON and Sanitize
//     let parsedCandidates = data.map((c: any) => {
//       let details = {};
//       const jsonSource = c.infoJson || c.profileJson;
//       if (jsonSource) {
//         try { details = typeof jsonSource === 'string' ? JSON.parse(jsonSource) : jsonSource; } 
//         catch (e) { console.warn('JSON Parse Error'); }
//       }
      
//       return {
//         ...c,
//         ...details,
//         id: c.candidateId || c.id,
//         voteCount: parseInt(c.voteCount || 0, 10) 
//       };
//     });

//     // 2. Calculate Global Total
//     this.totalVotesCast = parsedCandidates.reduce((sum, c) => sum + c.voteCount, 0);

//     // 3. Sort Descending (Highest Votes First)
//     this.candidates = parsedCandidates.sort((a, b) => b.voteCount - a.voteCount);
//   }

//   getPercentage(votes: number): number {
//     if (this.totalVotesCast === 0) return 0;
//     return Math.round((votes / this.totalVotesCast) * 100);
//   }

//   goToLogin() {
//     // Redirect to your admin login route
//     this.router.navigate(['/login']); 
//   }
// }