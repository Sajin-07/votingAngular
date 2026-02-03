import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// New UI Imports
import { 
  LucideAngularModule, 
  User, 
  LogOut, 
  List, 
  UserPlus, 
  BadgeCheck, 
  RefreshCw, // For Refresh
  QrCode,    // For QR
  BarChart3, // For Results
  ShieldAlert // For Restricted Notice
} from 'lucide-angular';

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule], // Added Lucide Module
  templateUrl: './moderator-dashboard.component.html',
  styleUrls: ['./moderator-dashboard.component.css']
})
export class ModeratorDashboardComponent implements OnInit {
  
  // --- UI ASSETS ---
  readonly icons = { 
    User, LogOut, List, UserPlus, BadgeCheck, 
    RefreshCw, QrCode, BarChart3, ShieldAlert 
  };
  logoImg = '/dataSoft.svg'; // Assuming this exists based on Design 1

  // --- ORIGINAL LOGIC & STATE ---
  moderatorInfo = {
    userId: '',
    tenantId: '',
    role: ''
  };

  stats = {
    registeredVoters: 0,
    totalCandidates: 0,
    totalVotesCast: 0,
    votesRemaining: 0,
    turnoutPercentage: '0%'
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
  }

  loadUserInfo() {
    this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.moderatorInfo.userId = response.adminId;
        this.moderatorInfo.tenantId = response.tenantId;
        this.moderatorInfo.role = response.role;
      },
      error: (error) => {
        console.error('Failed to load user info:', error);
        this.router.navigate(['/org-login']);
      }
    });
  }

  loadStats() {
    this.http.get<any>('http://localhost:3000/api/stats', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data.summary;
        }
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
      }
    });
  }

  refreshStats() {
    this.loadStats();
  }

  logout() {
    this.http.post('http://localhost:3000/api/auth/admin-logout', {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.router.navigate(['/org-login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/org-login']);
      }
    });
  }

  // Navigation methods
  navigateToCandidates() {
    this.router.navigate(['/add-candidate']);
  }

  navigateToVoters() {
    this.router.navigate(['/add-voter']);
  }

  navigateToResults() {
    this.router.navigate(['/vote-result']);
  }

  navigateToQrGeneration() {
    this.router.navigate(['/qr-login']);
  }
}

//main feb1
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-moderator-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './moderator-dashboard.component.html',
//   styleUrls: ['./moderator-dashboard.component.css']
// })
// export class ModeratorDashboardComponent implements OnInit {
//   // User Info
//   moderatorInfo = {
//     userId: '',
//     tenantId: '',
//     role: ''
//   };

//   // Stats
//   stats = {
//     registeredVoters: 0,
//     totalCandidates: 0,
//     totalVotesCast: 0,
//     votesRemaining: 0,
//     turnoutPercentage: '0%'
//   };

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadUserInfo();
//     this.loadStats();
//   }

//   loadUserInfo() {
//     this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.moderatorInfo.userId = response.adminId;
//         this.moderatorInfo.tenantId = response.tenantId;
//         this.moderatorInfo.role = response.role;
//       },
//       error: (error) => {
//         console.error('Failed to load user info:', error);
//         this.router.navigate(['/org-login']);
//       }
//     });
//   }

//   loadStats() {
//     this.http.get<any>('http://localhost:3000/api/stats', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.stats = response.data.summary;
//         }
//       },
//       error: (error) => {
//         console.error('Failed to load stats:', error);
//       }
//     });
//   }

//   refreshStats() {
//     this.loadStats();
//   }

//   logout() {
//     this.http.post('http://localhost:3000/api/auth/admin-logout', {}, {
//       withCredentials: true
//     }).subscribe({
//       next: () => {
//         this.router.navigate(['/org-login']);
//       },
//       error: (error) => {
//         console.error('Logout failed:', error);
//         this.router.navigate(['/org-login']);
//       }
//     });
//   }

//   // Navigation methods
//   navigateToCandidates() {
//     this.router.navigate(['/add-candidate']);
//   }

//   navigateToVoters() {
//     this.router.navigate(['/add-voter']);
//   }

//   navigateToResults() {
//     this.router.navigate(['/results']);
//   }

//   // New Method for QR Navigation
//   navigateToQrGeneration() {
//     this.router.navigate(['/qr-login']);
//   }
// }





// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-moderator-dashboard',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './moderator-dashboard.component.html',
//   styleUrls: ['./moderator-dashboard.component.css']
// })
// export class ModeratorDashboardComponent implements OnInit {
//   // User Info
//   moderatorInfo = {
//     userId: '',
//     tenantId: '',
//     role: ''
//   };

//   // Stats
//   stats = {
//     registeredVoters: 0,
//     totalCandidates: 0,
//     totalVotesCast: 0,
//     votesRemaining: 0,
//     turnoutPercentage: '0%'
//   };

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadUserInfo();
//     this.loadStats();
//   }

//   loadUserInfo() {
//     this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.moderatorInfo.userId = response.adminId;
//         this.moderatorInfo.tenantId = response.tenantId;
//         this.moderatorInfo.role = response.role;
//         console.log('Moderator Info:', this.moderatorInfo);
//       },
//       error: (error) => {
//         console.error('Failed to load user info:', error);
//         this.router.navigate(['/org-login']);
//       }
//     });
//   }

//   loadStats() {
//     this.http.get<any>('http://localhost:3000/api/stats', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         if (response.success && response.data) {
//           this.stats = response.data.summary;
//         }
//       },
//       error: (error) => {
//         console.error('Failed to load stats:', error);
//       }
//     });
//   }

//   refreshStats() {
//     this.loadStats();
//   }

//   logout() {
//     this.http.post('http://localhost:3000/api/auth/admin-logout', {}, {
//       withCredentials: true
//     }).subscribe({
//       next: () => {
//         this.router.navigate(['/org-login']);
//       },
//       error: (error) => {
//         console.error('Logout failed:', error);
//         this.router.navigate(['/org-login']);
//       }
//     });
//   }

//   // Navigation methods (Moderators can only access these)
//   navigateToCandidates() {
//     this.router.navigate(['/add-candidate']);
//   }

//   navigateToVoters() {
//     this.router.navigate(['/add-voter']);
//   }

//   navigateToResults() {
//     this.router.navigate(['/results']);
//   }
// }

