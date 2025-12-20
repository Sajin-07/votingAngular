import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class Step2Component implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Check };
  logoImg = '/dataSoft.svg';
  // Ensure this image exists in your assets folder
  profileImg = '/assets/images/professional_headshot_of_a_man.png';

  // --- MOCK DATA ---
  USER_DATA = {
    name: "Raisul Kabir",
    designation: "Senior Business Analyst",
    issueDate: "June 01, 2022",
    id: "DS00615",
    bloodGroup: "B+",
    joiningDate: "May 08, 2016",
  };

  // Helper to map data for the view loop
  get userProfileFields() {
    return [
      { label: "Name", value: this.USER_DATA.name },
      { label: "DS ID", value: this.USER_DATA.id },
      { label: "Designation", value: this.USER_DATA.designation },
      { label: "Blood Group", value: this.USER_DATA.bloodGroup },
      { label: "Issue Date", value: this.USER_DATA.issueDate },
      { label: "Date of Joining", value: this.USER_DATA.joiningDate },
    ];
  }

  // --- STEPPER CONFIG ---
  STEPS = [
    { id: 1, label: "Login", status: "completed" },
    { id: 2, label: "Your Information", status: "active" },
    { id: 3, label: "Candidate Choice", status: "pending" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }

  // --- TIMER STATE ---
  timeLeft = "05:45:35";
  private timerId: any;
  private totalSeconds = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Initialize Timer
    const [h, m, s] = this.timeLeft.split(":").map(Number);
    this.totalSeconds = (h * 3600) + (m * 60) + s;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  // --- ROBUST TIMER LOGIC ---
  startTimer() {
    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateTimeLeftString();
        this.cdr.detectChanges(); // Force screen update
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
}