import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  User,
  LogOut,
  List,
  UserPlus,
  BadgeCheck,
  Play,
  Square
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {

  // --- ICONS & ASSETS ---
  readonly icons = { User, LogOut, List, UserPlus, BadgeCheck, Play, Square };
  logoImg = '/dataSoft.svg';

  // --- UI STATE (MOCKED) ---
  timeLeft = '00:00:00'; 
  isVotingOpen = false;
  timerInput: number = 30;

  // --- MOCK DATA FOR DESIGN ---
  STATS = [
    { label: 'Total Voter', value: 150, color: 'text-[#C084FC]' },
    { label: 'Vote Cast', value: 45, color: 'text-[#86EFAC]' },
    { label: 'Total Candidates', value: 12, color: 'text-[#F87171]' },
    { label: 'Vote Left', value: 105, color: 'text-[#FDBA74]' }
  ];

  ACTIVITIES = [
    { time: '10:30:05', action: 'Md. Ashiful Islam logged in' },
    { time: '10:28:15', action: 'Vote cast by Employee #1023' },
    { time: '10:25:00', action: 'New Candidate Registered' },
    { time: '10:00:00', action: 'System Initialized' }
  ];

  constructor() {}

  // --- EMPTY METHODS (To prevent HTML errors on click) ---
  startVoting() {
    console.log('UI Interaction: Start Voting clicked');
    this.isVotingOpen = true; // Simple toggle for UI demo
  }

  stopVoting() {
    console.log('UI Interaction: Stop Voting clicked');
    this.isVotingOpen = false; // Simple toggle for UI demo
  }

  handleLogout() {
    console.log('UI Interaction: Logout clicked');
  }
}

// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms'; // <--- IMPORT THIS
// import {
//   LucideAngularModule,
//   User,
//   LogOut,
//   List,
//   UserPlus,
//   BadgeCheck,
//   Play,    // Added Icon
//   Square   // Added Icon
// } from 'lucide-angular';
// import { RouterLink } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';
// import { SocketService } from '../../core/services/socket.service'; // Import Socket
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, LucideAngularModule, RouterLink, FormsModule], // <--- Add FormsModule
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css']
// })
// export class AdminDashboardComponent implements OnInit, OnDestroy {

//   readonly icons = { User, LogOut, List, UserPlus, BadgeCheck, Play, Square };
//   logoImg = '/dataSoft.svg';

//   private activitySub!: Subscription;
//   private historySub!: Subscription;
//   private timerSub!: Subscription;

//   // --- TIMER STATE ---
//   timeLeft = '00:00:00'; // Display string
//   isVotingOpen = false;  // Status
//   timerInput: number = 30; // Default input minutes

//   STATS = [
//     { label: 'Total Voter', value: 0, color: 'text-[#C084FC]' },
//     { label: 'Vote Cast', value: 0, color: 'text-[#86EFAC]' },
//     { label: 'Total Candidates', value: 0, color: 'text-[#F87171]' },
//     { label: 'Vote Left', value: 0, color: 'text-[#FDBA74]' }
//   ];

//   ACTIVITIES: Array<{ time: string; action: string }> = [];

//   constructor(
//     private authService: AuthService,
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef,
//     private socketService: SocketService
//   ) {}

//   ngOnInit() {
//     // 1. CONNECT SOCKET (ADMIN NAMESPACE)
//     this.socketService.connectAdmin();

//     // 2. SUBSCRIBE TO TIMER FROM SERVER
//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       // Update Status
//       this.isVotingOpen = this.socketService.isVotingOpen$.value;
      
//       // Update formatted time
//       this.updateTimeLeftString(seconds);
      
//       this.cdr.detectChanges();
//     });

//     // 3. LOAD HISTORY
//     this.historySub = this.socketService.onActivityHistory().subscribe(history => {
//       this.ACTIVITIES = [...history].map(a => ({
//         time: a.time,
//         action: a.message
//       }));
//       this.cdr.detectChanges();
//     });

//     // 4. LIVE EVENTS
//     this.activitySub = this.socketService.onActivity().subscribe(activity => {
//       this.ACTIVITIES.unshift({
//         time: activity.time,
//         action: activity.message
//       });

//       if (this.ACTIVITIES.length > 200) {
//         this.ACTIVITIES.pop();
//       }

//       this.fetchStats();
//       this.cdr.detectChanges();
//     });
    
//     // Initial Fetch
//     this.fetchStats();
//   }

//   ngOnDestroy() {
//     this.activitySub?.unsubscribe();
//     this.historySub?.unsubscribe();
//     this.timerSub?.unsubscribe();
//     this.socketService.disconnect();
//   }

//   // --- TIMER CONTROLS ---
//   startVoting() {
//     if (this.timerInput > 0) {
//       this.socketService.startTimer(this.timerInput);
//     }
//   }

//   stopVoting() {
//     if (confirm('Are you sure you want to stop voting immediately?')) {
//       this.socketService.stopTimer();
//     }
//   }

//   private updateTimeLeftString(totalSeconds: number) {
//     const h = Math.floor(totalSeconds / 3600);
//     const m = Math.floor((totalSeconds % 3600) / 60);
//     const s = totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(v: number) {
//     return v < 10 ? `0${v}` : `${v}`;
//   }

//   // --- EXISTING METHODS ---
//   fetchStats() {
//     this.http.get<any>('http://localhost:3000/api/stats',{ withCredentials: true }).subscribe(data => {
//       this.STATS = [
//         { label: 'Total Candidates', value: data.candidates?.total || 0, color: 'text-[#F87171]' },
//         { label: 'Total Voter', value: data.employees?.total || 0, color: 'text-[#C084FC]' },
//         { label: 'Vote Cast', value: data.employees?.voted || 0, color: 'text-[#86EFAC]' },
//         { label: 'Vote Left', value: data.employees?.notVoted || 0, color: 'text-[#FDBA74]' }
//       ];
//       this.cdr.detectChanges();
//     });
//   }

//   handleLogout() {
//     if (confirm('Are you sure you want to logout?')) {
//       this.authService.logoutAdmin();
//     }
//   }
// }


