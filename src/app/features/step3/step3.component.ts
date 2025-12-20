import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class Step3Component implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Check };
  logoImg = '/dataSoft.svg';
  handVector = '/assets/images/Vector.png';

  // --- MOCK DATA ---
  // Ensure these images exist in assets/images/
  CANDIDATES = [
    { id: 1, name: "Nobi Hasan", department: "MIS Department", image: 'assets/images/professional_headshot_of_a_corporate_male_employee.png' },
    { id: 2, name: "Maniruzzaman", department: "HR Department", image: 'assets/images/professional_headshot_of_a_corporate_male_employee_in_casual_wear.png' },
    { id: 3, name: "Asif Mahmud", department: "MIS", image: 'assets/images/professional_headshot_of_a_corporate_male_employee_with_glasses.png' },
    { id: 4, name: "Asif", department: "MIS", image: 'assets/images/professional_headshot_of_a_corporate_male_employee_with_glasses.png' },
    { id: 5, name: "Asif", department: "MIS", image: 'assets/images/professional_headshot_of_a_corporate_male_employee_with_glasses.png' },
  ];

  STEPS = [
    { id: 1, label: "Login", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "active" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  // --- STATE ---
  selectedCandidateId: number | null = null;
  timeLeft = "05:45:35";
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

  // --- TIMER LOGIC ---
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
  selectCandidate(id: number) {
    this.selectedCandidateId = id;
  }

  proceed() {
    if (this.selectedCandidateId) {
      this.router.navigate(['/step4']);
    }
  }
}