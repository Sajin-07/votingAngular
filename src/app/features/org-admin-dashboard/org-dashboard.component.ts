import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  LucideAngularModule, 
  RefreshCw, 
  Settings, 
  UserPlus, 
  LogOut, 
  Users, 
  User, 
  CheckCircle, 
  PieChart, 
  Briefcase, 
  BarChart3, 
  X, 
  AlertCircle,
  Shield,
  ShieldAlert,
  Loader2,
  Vote
} from 'lucide-angular';

interface UserCreationForm {
  newUserId: string;
  newPassword: string;
  role: 'ADMIN' | 'MODERATOR';
}

interface OrgMember {
  userId: string;
  role: string;
  createdAt?: string;
}

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './org-dashboard.component.html',
  styles: [] // Styles handled by Tailwind
})
export class OrgDashboardComponent implements OnInit, OnDestroy {
  // Icons Registry
  readonly icons = {
    RefreshCw, Settings, UserPlus, LogOut, Users, User, 
    CheckCircle, PieChart, Briefcase, BarChart3, X, 
    AlertCircle, Shield, ShieldAlert, Loader2, Vote
  };

  // User Info
  adminInfo = {
    adminId: '',
    tenantId: '',
    role: ''
  };

  // User Creation Form
  showCreateUserModal = false;
  userForm: UserCreationForm = {
    newUserId: '',
    newPassword: '',
    role: 'MODERATOR'
  };

  // State
  isLoading = false;
  isLoadingStats = false;
  errorMessage = '';
  successMessage = '';
  orgMembers: OrgMember[] = [];

  // Stats
  stats = {
    registeredVoters: 0,
    totalCandidates: 0,
    totalVotesCast: 0,
    votesRemaining: 0,
    turnoutPercentage: '0%'
  };

  // Auto-refresh interval
  private statsRefreshInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Force component to reload every time route is activated
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    console.log('🎯 Dashboard initialized');
    this.loadUserInfo();
    this.loadStatsWithRetry();
    
    // Auto-refresh stats every 10 seconds when on this page
    this.statsRefreshInterval = setInterval(() => {
      console.log('⏰ Auto-refreshing stats...');
      this.loadStats();
    }, 10000);
  }

  ngOnDestroy() {
    // Clear auto-refresh interval
    if (this.statsRefreshInterval) {
      clearInterval(this.statsRefreshInterval);
      console.log('🛑 Stopped auto-refresh');
    }
  }

  loadUserInfo() {
    this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.adminInfo.adminId = response.adminId;
        this.adminInfo.tenantId = response.tenantId;
        this.adminInfo.role = response.role;
        console.log('✅ Admin Info loaded:', this.adminInfo);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Failed to load user info:', error);
        this.router.navigate(['/org-login']);
      }
    });
  }

  loadStatsWithRetry() {
    // Initial load with small delay to ensure component is ready
    setTimeout(() => {
      this.loadStats();
    }, 100);
  }

  loadStats() {
    this.isLoadingStats = true;
    console.log('📊 Loading stats...');
    
    this.http.get<any>('http://localhost:3000/api/stats', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('📦 Stats API Response:', response);
        
        if (response.success && response.data && response.data.summary) {
          // Update stats
          this.stats = {
            registeredVoters: response.data.summary.registeredVoters || 0,
            totalCandidates: response.data.summary.totalCandidates || 0,
            totalVotesCast: response.data.summary.totalVotesCast || 0,
            votesRemaining: response.data.summary.votesRemaining || 0,
            turnoutPercentage: response.data.summary.turnoutPercentage || '0%'
          };
          
          console.log('✅ Stats updated:', this.stats);
        } else {
          console.warn('⚠️ Invalid stats response format:', response);
        }
        
        this.isLoadingStats = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('❌ Failed to load stats:', error);
        console.error('Error details:', error.error);
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Method to manually refresh stats
  refreshStats() {
    console.log('🔄 Manual stats refresh triggered');
    this.loadStats();
  }

  openCreateUserModal() {
    this.showCreateUserModal = true;
    this.resetForm();
  }

  closeCreateUserModal() {
    this.showCreateUserModal = false;
    this.resetForm();
  }

  resetForm() {
    this.userForm = {
      newUserId: '',
      newPassword: '',
      role: 'MODERATOR'
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  createUser() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.userForm.newUserId || !this.userForm.newPassword) {
      this.errorMessage = 'User ID and Password are required';
      return;
    }

    if (this.userForm.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:3000/api/tenant/users/create', this.userForm, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        console.log('User created:', response);
        this.successMessage = response.message || 'User created successfully!';
        this.isLoading = false;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          this.closeCreateUserModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to create user:', error);
        this.errorMessage = error.error?.error || 'Failed to create user. Please try again.';
        this.isLoading = false;
      }
    });
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
        // Navigate anyway
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
    this.router.navigate(['/results']);
  }

  navigateToSettings() {
    this.router.navigate(['/org-settings']);
  }

  // New Navigation methods
  navigateToAllCandidates() {
    this.router.navigate(['/all-candidates']);
  }

  navigateToAllVoters() {
    this.router.navigate(['/all-voters']);
  }
}




// import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router, ActivatedRoute } from '@angular/router';
// import { 
//   LucideAngularModule, 
//   RefreshCw, 
//   Settings, 
//   UserPlus, 
//   LogOut, 
//   Users, 
//   User, 
//   CheckCircle, 
//   PieChart, 
//   Briefcase, 
//   BarChart3, 
//   X, 
//   AlertCircle,
//   Shield,
//   ShieldAlert,
//   Loader2,
//   Vote
// } from 'lucide-angular';

// interface UserCreationForm {
//   newUserId: string;
//   newPassword: string;
//   role: 'ADMIN' | 'MODERATOR';
// }

// interface OrgMember {
//   userId: string;
//   role: string;
//   createdAt?: string;
// }

// @Component({
//   selector: 'app-org-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule],
//   templateUrl: './org-dashboard.component.html',
//   styles: [] // Styles handled by Tailwind
// })
// export class OrgDashboardComponent implements OnInit, OnDestroy {
//   // Icons Registry
//   readonly icons = {
//     RefreshCw, Settings, UserPlus, LogOut, Users, User, 
//     CheckCircle, PieChart, Briefcase, BarChart3, X, 
//     AlertCircle, Shield, ShieldAlert, Loader2, Vote
//   };

//   // User Info
//   adminInfo = {
//     adminId: '',
//     tenantId: '',
//     role: ''
//   };

//   // User Creation Form
//   showCreateUserModal = false;
//   userForm: UserCreationForm = {
//     newUserId: '',
//     newPassword: '',
//     role: 'MODERATOR'
//   };

//   // State
//   isLoading = false;
//   isLoadingStats = false;
//   errorMessage = '';
//   successMessage = '';
//   orgMembers: OrgMember[] = [];

//   // Stats
//   stats = {
//     registeredVoters: 0,
//     totalCandidates: 0,
//     totalVotesCast: 0,
//     votesRemaining: 0,
//     turnoutPercentage: '0%'
//   };

//   // Auto-refresh interval
//   private statsRefreshInterval: any;

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private route: ActivatedRoute,
//     private cdr: ChangeDetectorRef
//   ) {
//     // Force component to reload every time route is activated
//     this.router.routeReuseStrategy.shouldReuseRoute = () => false;
//   }

//   ngOnInit() {
//     console.log('🎯 Dashboard initialized');
//     this.loadUserInfo();
//     this.loadStatsWithRetry();
    
//     // Auto-refresh stats every 10 seconds when on this page
//     this.statsRefreshInterval = setInterval(() => {
//       console.log('⏰ Auto-refreshing stats...');
//       this.loadStats();
//     }, 10000);
//   }

//   ngOnDestroy() {
//     // Clear auto-refresh interval
//     if (this.statsRefreshInterval) {
//       clearInterval(this.statsRefreshInterval);
//       console.log('🛑 Stopped auto-refresh');
//     }
//   }

//   loadUserInfo() {
//     this.http.get<any>('http://localhost:3000/api/auth/admin-status', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.adminInfo.adminId = response.adminId;
//         this.adminInfo.tenantId = response.tenantId;
//         this.adminInfo.role = response.role;
//         console.log('✅ Admin Info loaded:', this.adminInfo);
//         this.cdr.detectChanges();
//       },
//       error: (error) => {
//         console.error('❌ Failed to load user info:', error);
//         this.router.navigate(['/org-login']);
//       }
//     });
//   }

//   loadStatsWithRetry() {
//     // Initial load with small delay to ensure component is ready
//     setTimeout(() => {
//       this.loadStats();
//     }, 100);
//   }

//   loadStats() {
//     this.isLoadingStats = true;
//     console.log('📊 Loading stats...');
    
//     this.http.get<any>('http://localhost:3000/api/stats', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         console.log('📦 Stats API Response:', response);
        
//         if (response.success && response.data && response.data.summary) {
//           // Update stats
//           this.stats = {
//             registeredVoters: response.data.summary.registeredVoters || 0,
//             totalCandidates: response.data.summary.totalCandidates || 0,
//             totalVotesCast: response.data.summary.totalVotesCast || 0,
//             votesRemaining: response.data.summary.votesRemaining || 0,
//             turnoutPercentage: response.data.summary.turnoutPercentage || '0%'
//           };
          
//           console.log('✅ Stats updated:', this.stats);
//         } else {
//           console.warn('⚠️ Invalid stats response format:', response);
//         }
        
//         this.isLoadingStats = false;
//         this.cdr.detectChanges(); // Force UI update
//       },
//       error: (error) => {
//         console.error('❌ Failed to load stats:', error);
//         console.error('Error details:', error.error);
//         this.isLoadingStats = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   // Method to manually refresh stats
//   refreshStats() {
//     console.log('🔄 Manual stats refresh triggered');
//     this.loadStats();
//   }

//   openCreateUserModal() {
//     this.showCreateUserModal = true;
//     this.resetForm();
//   }

//   closeCreateUserModal() {
//     this.showCreateUserModal = false;
//     this.resetForm();
//   }

//   resetForm() {
//     this.userForm = {
//       newUserId: '',
//       newPassword: '',
//       role: 'MODERATOR'
//     };
//     this.errorMessage = '';
//     this.successMessage = '';
//   }

//   createUser() {
//     this.errorMessage = '';
//     this.successMessage = '';

//     // Validation
//     if (!this.userForm.newUserId || !this.userForm.newPassword) {
//       this.errorMessage = 'User ID and Password are required';
//       return;
//     }

//     if (this.userForm.newPassword.length < 6) {
//       this.errorMessage = 'Password must be at least 6 characters';
//       return;
//     }

//     this.isLoading = true;

//     this.http.post<any>('http://localhost:3000/api/tenant/users/create', this.userForm, {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         console.log('User created:', response);
//         this.successMessage = response.message || 'User created successfully!';
//         this.isLoading = false;
        
//         // Close modal after 2 seconds
//         setTimeout(() => {
//           this.closeCreateUserModal();
//         }, 2000);
//       },
//       error: (error) => {
//         console.error('Failed to create user:', error);
//         this.errorMessage = error.error?.error || 'Failed to create user. Please try again.';
//         this.isLoading = false;
//       }
//     });
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
//         // Navigate anyway
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

//   navigateToSettings() {
//     this.router.navigate(['/org-settings']);
//   }
// }


