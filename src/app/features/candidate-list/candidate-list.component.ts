import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, CheckCircle, XCircle, User } from 'lucide-angular';

interface Employee {
  dsId: string;
  name: string;
  designation: string;
  photoUrl: string;
  isRegistered: boolean;
  hasVoted: boolean;
}

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './candidate-list.component.html',
  styles: []
})
export class CandidateListComponent implements OnInit {
  readonly icons = { ArrowLeft, CheckCircle, XCircle, User };
  logoImg = '/dataSoft.svg';
  timeLeft = '05:45:35';
  
  activeTab: 'not-voted' | 'voted' = 'voted';
  isLoading = true;
  
  allEmployees: Employee[] = [];
  displayedEmployees: Employee[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef // <-- 2. Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/api/employees', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.allEmployees = data.employees || [];
          this.filterEmployees(); 
          this.isLoading = false;
          
          this.cdr.detectChanges(); // <-- 3. FORCE UPDATE HERE
        },
        error: (err) => {
          console.error('Failed to load employees', err);
          this.isLoading = false;
          this.cdr.detectChanges(); // (Optional) Good practice to update on error too
        }
      });
  }

  setTab(tab: 'not-voted' | 'voted') {
    this.activeTab = tab;
    this.filterEmployees();
  }

  filterEmployees() {
    if (this.activeTab === 'voted') {
      this.displayedEmployees = this.allEmployees.filter(e => e.hasVoted);
    } else {
      this.displayedEmployees = this.allEmployees.filter(e => !e.hasVoted);
    }
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
    event.target.nextElementSibling.style.display = 'flex';
  }
}


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { RouterLink } from '@angular/router';
// import { LucideAngularModule, ArrowLeft, CheckCircle, XCircle, User } from 'lucide-angular';

// interface Employee {
//   dsId: string;
//   name: string;
//   designation: string;
//   photoUrl: string;
//   isRegistered: boolean;
//   hasVoted: boolean;
// }

// @Component({
//   selector: 'app-candidate-list',
//   standalone: true,
//   imports: [CommonModule, LucideAngularModule, RouterLink],
//   templateUrl: './candidate-list.component.html',
//   styles: []
// })
// export class CandidateListComponent implements OnInit {
//   readonly icons = { ArrowLeft, CheckCircle, XCircle, User };
//   logoImg = '/dataSoft.svg';
//   timeLeft = '05:45:35'; // Static placeholder to match header style
  
//   // State
// //   activeTab: 'not-voted' | 'voted' = 'not-voted';
//   activeTab: 'not-voted' | 'voted' = 'voted';
//   isLoading = true;
  
//   // Data
//   allEmployees: Employee[] = [];
//   displayedEmployees: Employee[] = [];

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.fetchEmployees();
//   }

//   fetchEmployees() {
//     this.isLoading = true;
//     this.http.get<any>('http://localhost:3000/api/employees', { withCredentials: true })
//       .subscribe({
//         next: (data) => {
//           this.allEmployees = data.employees || [];
//           this.filterEmployees(); // Initial filter
//           this.isLoading = false;
//         },
//         error: (err) => {
//           console.error('Failed to load employees', err);
//           this.isLoading = false;
//         }
//       });
//   }

//   setTab(tab: 'not-voted' | 'voted') {
//     this.activeTab = tab;
//     this.filterEmployees();
//   }

//   filterEmployees() {
//     if (this.activeTab === 'voted') {
//       this.displayedEmployees = this.allEmployees.filter(e => e.hasVoted);
//     } else {
//       this.displayedEmployees = this.allEmployees.filter(e => !e.hasVoted);
//     }
//   }

//   // Handle broken images by hiding the img tag and showing a fallback icon
//   handleImageError(event: any) {
//     event.target.style.display = 'none';
//     event.target.nextElementSibling.style.display = 'flex';
//   }
// }