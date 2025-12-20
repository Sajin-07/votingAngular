import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Check, Fingerprint } from 'lucide-angular';

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.css']
})
export class Step4Component implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Check, Fingerprint };
  logoImg = '/dataSoft.svg';
  
  // MOCK USER & CANDIDATE IMAGES
  userProfileImg = 'assets/images/professional_headshot_of_a_corporate_male_employee_in_casual_wear.png';
  
  // In a real app, this data would come from a Service/State Management
  selectedCandidate = {
    id: 1,
    name: "Nobi Hasan",
    department: "MIS Department",
    image: 'assets/images/professional_headshot_of_a_corporate_male_employee.png'
  };

  STEPS = [
    { id: 1, label: "Login", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "completed" },
    { id: 4, label: "Finger Verification", status: "active" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  // --- STATE ---
  timeLeft = "05:45:35";
  verificationStatus: 'idle' | 'scanning' | 'success' | 'error' = 'idle';
  private timerId: any;
  private totalSeconds = 0;

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }

  // --- LIFECYCLE ---
  ngOnInit() {
    const [h, m, s] = this.timeLeft.split(":").map(Number);
    this.totalSeconds = (h * 3600) + (m * 60) + s;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  // --- TIMER ---
  startTimer() {
    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateTimeLeftString();
        this.cdr.detectChanges();
      } else {
        clearInterval(this.timerId);
      }
    }, 1000);
  }

  private updateTimeLeftString() {
    const h = Math.floor(this.totalSeconds / 3600);
    const m = Math.floor((this.totalSeconds % 3600) / 60);
    const s = this.totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  // --- ACTIONS ---
  handleCastVote() {
    if (this.verificationStatus === 'success') return;
    
    this.verificationStatus = 'scanning';
    
    // Simulate API Call / Hardware Scan
    setTimeout(() => {
      this.verificationStatus = 'success';
      this.cdr.detectChanges();
      
      // Optional: Auto-navigate after success
      // setTimeout(() => this.router.navigate(['/step5']), 1000);
    }, 2500); 
  }
}