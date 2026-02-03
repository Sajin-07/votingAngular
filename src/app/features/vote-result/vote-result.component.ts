import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Trophy, Medal, Loader2, RefreshCw, Lock } from 'lucide-angular';
import { finalize } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-vote-result',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, LucideAngularModule],
  templateUrl: './vote-result.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #2A2931; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #529F2D; border-radius: 4px; }
  `]
})
export class VoteResultComponent implements OnInit {
  readonly icons = { Trophy, Medal, Loader2, RefreshCw, Lock };
  logoImg = '/dataSoft.svg';

  candidates: any[] = [];
  isLoading = true;
  errorMessage = ''; // Stores access denied messages
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

    // CHANGED: Now points to the Admin API
    this.http.get(`${API_URL}/api/org-admin/candidates`, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
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
          
          // Handle Unauthorized / Forbidden access (401 or 403)
          if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Restricted Access: Only Organization Admins can view live results.';
          } else {
            this.errorMessage = 'Failed to load results. Please check your network connection.';
          }
        }
      });
  }

  processData(data: any[]) {
    // 1. Parse JSON and Sanitize
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
        voteCount: parseInt(c.voteCount || 0, 10) 
      };
    });

    // 2. Calculate Global Total
    this.totalVotesCast = parsedCandidates.reduce((sum, c) => sum + c.voteCount, 0);

    // 3. Sort Descending (Highest Votes First)
    this.candidates = parsedCandidates.sort((a, b) => b.voteCount - a.voteCount);
  }

  getPercentage(votes: number): number {
    if (this.totalVotesCast === 0) return 0;
    return Math.round((votes / this.totalVotesCast) * 100);
  }

  goToLogin() {
    // Redirect to your admin login route
    this.router.navigate(['/login']); 
  }
}