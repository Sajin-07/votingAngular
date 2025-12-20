import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, LogOut, QrCode, List, Lock } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // --- ASSETS & ICONS ---
  readonly icons = { User, LogOut, QrCode, List, Lock };
  // Make sure this image exists in src/assets/images/ or update the path
  logoImg = '/dataSoft.svg'; 

  // --- STATE ---
  timeLeft = "05:45:35"; // Initial string for display
  private timerId: any;
  private totalSeconds = 0; // Internal integer for robust counting

  // --- MOCK DATA ---
  ACTIVITIES = [
    { time: "09:59 AM", action: "Generated a QR code for ID DS00700" },
    { time: "09:53 AM", action: "Vote cast by ID DS00640" },
    { time: "09:49 AM", action: "Regenerated a QR code for ID DS00640" },
    { time: "09:44 AM", action: "QR Code got expired for ID DS00640" },
    { time: "09:42 AM", action: "Generated a QR code for ID DS00640" },
    { time: "09:40 AM", action: "Vote cast by ID DS00616" },
    { time: "09:39 AM", action: "Generated a QR code for ID DS00616" },
    { time: "09:37 AM", action: "Vote cast by ID DS00615" },
    { time: "09:35 AM", action: "Generated a QR code for ID DS00615" },
    { time: "09:30 AM", action: "Vote cast by ID DS00600" },
    { time: "09:25 AM", action: "Generated a QR code for ID DS00600" },
    { time: "09:20 AM", action: "Vote cast by ID DS00590" },
    { time: "09:15 AM", action: "Generated a QR code for ID DS00590" },
  ];

  STATS = [
    { label: "Total Voter", value: 70, color: "text-[#C084FC]" },
    { label: "Vote Cast", value: 30, color: "text-[#86EFAC]" },
    { label: "No Vote", value: 10, color: "text-[#F87171]" },
    { label: "Vote Left", value: 30, color: "text-[#FDBA74]" },
  ];

  // --- LIFECYCLE HOOKS ---
  ngOnInit() {
    // 1. Calculate total seconds from the initial "05:45:35" string
    const [h, m, s] = this.timeLeft.split(":").map(Number);
    this.totalSeconds = (h * 3600) + (m * 60) + s;

    // 2. Start the countdown
    this.startTimer();
  }

  ngOnDestroy() {
    // Stop the timer if the user leaves the page to prevent memory leaks
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  // --- LOGIC ---
  startTimer() {
    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--; // Decrease by 1 second
        this.updateTimeLeftString(); // Update the display string
      } else {
        clearInterval(this.timerId); // Stop when we hit 0
      }
    }, 1000);
  }

  // Helper: Converts the integer back to "HH:MM:SS" format for the UI
  private updateTimeLeftString() {
    const h = Math.floor(this.totalSeconds / 3600);
    const m = Math.floor((this.totalSeconds % 3600) / 60);
    const s = this.totalSeconds % 60;

    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  // Helper: Adds a leading zero (e.g., 5 -> "05")
  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }
}