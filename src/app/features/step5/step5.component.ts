import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-step5',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.css']
})
export class Step5Component implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Check };
  logoImg = '/dataSoft.svg';
  shakeIcon = 'assets/images/shake.png'; // Ensure this exists

  // --- STEPPER ---
  STEPS = [
    { id: 1, label: "Login", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "completed" },
    { id: 4, label: "Finger Verification", status: "completed" },
    { id: 5, label: "Success Message", status: "active" },
  ];

  // --- STATE ---
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
  close() {
    // Navigate back to Login or Home
    this.router.navigate(['/']);
  }

  printReceipt() {
    window.print(); // Simple browser print trigger
  }
}