import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Needed for [(ngModel)]
import { LucideAngularModule, Check, User, IdCard } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class Step1Component implements OnInit, OnDestroy {
  // --- ASSETS & ICONS ---
  readonly icons = { Check, User, IdCard };
  logoImg = '/dataSoft.svg'; 

  // --- STATE ---
  employeeId = '';
  timeLeft = "05:45:35";
  private timerId: any;
  private totalSeconds = 0;

  // --- STEPPER CONFIG ---
  STEPS = [
    { id: 1, label: "Login", status: "active" },
    { id: 2, label: "Your Information", status: "pending" },
    { id: 3, label: "Candidate Choice", status: "pending" },
    { id: 4, label: "Finger Verification", status: "pending" },
    { id: 5, label: "Success Message", status: "pending" },
  ];

  // Helper to calculate progress bar width
  get activeIndex(): number {
    return this.STEPS.findIndex((s) => s.status === "active");
  }

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

  // --- TIMER LOGIC (Robust) ---
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