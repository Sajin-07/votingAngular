import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service'; // Import Socket
import { Subscription } from 'rxjs';
import { jsPDF } from 'jspdf';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

@Component({
  selector: 'app-step5',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.css']
})
export class Step5Component implements OnInit, OnDestroy {
  readonly icons = { Check };
  logoImg = '/dataSoft.svg';
  shakeIcon = 'assets/images/shake.png';

  receiptData: any = null;

  STEPS: Step[] = [
    { id: 1, label: "Scan QR Code", status: "completed" },
    { id: 2, label: "Your Information", status: "completed" },
    { id: 3, label: "Candidate Choice", status: "completed" },
    { id: 4, label: "Finger Verification", status: "completed" },
    { id: 5, label: "Success Message", status: "active" },
  ];

  // --- TIMER & DATE STATE ---
  timeLeft = "00:00:00";
  currentDate = "";
  private timerSub!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private authService: AuthService,
    private socketService: SocketService
  ) {}
  
  get activeIndex(): number { 
    return this.STEPS.findIndex((s) => s.status === "active"); 
  } 

  ngOnInit() {
    // 1. Set Realtime Date
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // 2. Connect Socket
    this.socketService.connectVoter();

    // 3. Subscribe to Timer
    this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
      this.updateTimeLeftString(seconds);

      // REDIRECT LOGIC: If voting closed, kick user out (even from success page)
      if (!this.socketService.isVotingOpen$.value) {
        this.router.navigate(['/verify-qr']);
      }

      this.cdr.detectChanges();
    });

    // 4. Load Receipt Data
    const storedReceipt = sessionStorage.getItem('voteReceipt');
    if (storedReceipt) {
      this.receiptData = JSON.parse(storedReceipt);
    }
  }

  ngOnDestroy() { 
    this.timerSub?.unsubscribe();
  }

  private updateTimeLeftString(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  close() {
    this.authService.logout();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
  
  downloadReceipt() {
    if (!this.receiptData) return;

    const doc = new jsPDF();
    const data = this.receiptData;

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("DataSoft Popularity Contest", 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(82, 159, 45); // Green
    doc.text("Official Digital Vote Receipt", 105, 30, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    let y = 50;
    const leftCol = 20;
    const rightCol = 80;

    // --- Helper to print section ---
    const printSectionTitle = (title: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(82, 159, 45);
      doc.text(title, leftCol, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
    };

    const printRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, leftCol, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || ''), rightCol, y); 
      y += 8;
    };

    // 1. Employee Details
    printSectionTitle("Voter Details");
    printRow("Name:", data.employee.name);
    printRow("Employee ID:", data.employee.id);
    y += 5;

    // 3. Blockchain Verification
    printSectionTitle("Blockchain Verification");
    printRow("Date & Time:", data.vote.timestamp);
    
    doc.setFont("helvetica", "bold");
    doc.text("Block Hash (TxID):", leftCol, y);
    y += 7;
    
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    const splitHash = doc.splitTextToSize(data.vote.txId, 170); // Wrap text
    doc.text(splitHash, leftCol, y);
    
    y += 20;

    // --- Footer ---
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("This receipt confirms that your vote has been securely recorded on the blockchain.", 105, y, { align: 'center' });
    doc.text("Powered by DataSoft Systems Bangladesh Limited", 105, y + 5, { align: 'center' });

    doc.save(`Vote_Receipt_${data.employee.id}.pdf`);
  }
}


// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Check } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';
// import { SocketService } from '../../core/services/socket.service'; // Import Socket
// import { Subscription } from 'rxjs';
// import { jsPDF } from 'jspdf';

// interface Step {
//   id: number;
//   label: string;
//   status: 'completed' | 'active' | 'pending';
// }

// @Component({
//   selector: 'app-step5',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule],
//   templateUrl: './step5.component.html',
//   styleUrls: ['./step5.component.css']
// })
// export class Step5Component implements OnInit, OnDestroy {
//   readonly icons = { Check };
//   logoImg = '/dataSoft.svg';
//   shakeIcon = 'assets/images/shake.png';

//   receiptData: any = null;

//   STEPS: Step[] = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "completed" },
//     { id: 5, label: "Success Message", status: "active" },
//   ];

//   // --- TIMER STATE (Socket) ---
//   timeLeft = "00:00:00";
//   private timerSub!: Subscription;

//   constructor(
//     private cdr: ChangeDetectorRef, 
//     private router: Router,
//     private authService: AuthService,
//     private socketService: SocketService
//   ) {}
  
//   get activeIndex(): number { 
//     return this.STEPS.findIndex((s) => s.status === "active"); 
//   } 

//   ngOnInit() {
//     // 1. Connect Socket
//     this.socketService.connectVoter();

//     // 2. Subscribe to Timer
//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       this.updateTimeLeftString(seconds);
//       this.cdr.detectChanges();
//     });

//     // 3. Load Receipt Data
//     const storedReceipt = sessionStorage.getItem('voteReceipt');
//     if (storedReceipt) {
//       this.receiptData = JSON.parse(storedReceipt);
//     }
//   }

//   ngOnDestroy() { 
//     this.timerSub?.unsubscribe();
//   }

//   private updateTimeLeftString(totalSeconds: number) {
//     const h = Math.floor(totalSeconds / 3600);
//     const m = Math.floor((totalSeconds % 3600) / 60);
//     const s = totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }

//   close() {
//     this.authService.logout();
//     sessionStorage.clear();
//     this.router.navigate(['/']);
//   }
  
//   downloadReceipt() {
//     if (!this.receiptData) return;

//     const doc = new jsPDF();
//     const data = this.receiptData;

//     // --- Header ---
//     doc.setFontSize(22);
//     doc.setTextColor(40, 40, 40);
//     doc.text("DataSoft Popularity Contest", 105, 20, { align: 'center' });
    
//     doc.setFontSize(14);
//     doc.setTextColor(82, 159, 45); // Green
//     doc.text("Official Digital Vote Receipt", 105, 30, { align: 'center' });

//     doc.setDrawColor(200, 200, 200);
//     doc.line(20, 35, 190, 35);

//     let y = 50;
//     const leftCol = 20;
//     const rightCol = 80;

//     // --- Helper to print section ---
//     const printSectionTitle = (title: string) => {
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.setTextColor(82, 159, 45);
//       doc.text(title, leftCol, y);
//       y += 10;
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(11);
//       doc.setTextColor(0, 0, 0);
//     };

//     const printRow = (label: string, value: string) => {
//       doc.setFont("helvetica", "bold");
//       doc.text(label, leftCol, y);
//       doc.setFont("helvetica", "normal");
//       doc.text(String(value || ''), rightCol, y); 
//       y += 8;
//     };

//     // 1. Employee Details
//     printSectionTitle("Voter Details");
//     printRow("Name:", data.employee.name);
//     printRow("Employee ID:", data.employee.id);
//     y += 5;

//     // 3. Blockchain Verification
//     printSectionTitle("Blockchain Verification");
//     printRow("Date & Time:", data.vote.timestamp);
    
//     doc.setFont("helvetica", "bold");
//     doc.text("Block Hash (TxID):", leftCol, y);
//     y += 7;
    
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);
//     const splitHash = doc.splitTextToSize(data.vote.txId, 170); // Wrap text
//     doc.text(splitHash, leftCol, y);
    
//     y += 20;

//     // --- Footer ---
//     doc.setFont("helvetica", "italic");
//     doc.setFontSize(9);
//     doc.setTextColor(100, 100, 100);
//     doc.text("This receipt confirms that your vote has been securely recorded on the blockchain.", 105, y, { align: 'center' });
//     doc.text("Powered by DataSoft Systems Bangladesh Limited", 105, y + 5, { align: 'center' });

//     doc.save(`Vote_Receipt_${data.employee.id}.pdf`);
//   }
// }




// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Check } from 'lucide-angular';
// import { AuthService } from '../../core/services/auth.service';

// import { jsPDF } from 'jspdf';

// // [FIX] Define the interface for the steps
// interface Step {
//   id: number;
//   label: string;
//   status: 'completed' | 'active' | 'pending';
// }

// @Component({
//   selector: 'app-step5',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule],
//   templateUrl: './step5.component.html',
//   styleUrls: ['./step5.component.css']
// })
// export class Step5Component implements OnInit, OnDestroy {
//   readonly icons = { Check };
//   logoImg = '/dataSoft.svg';
//   shakeIcon = 'assets/images/shake.png';

//   receiptData: any = null;

//   // [FIX] Explicitly type the array using the Interface
//   STEPS: Step[] = [
//     { id: 1, label: "Scan QR Code", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "completed" },
//     { id: 5, label: "Success Message", status: "active" },
//   ];

//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(private cdr: ChangeDetectorRef, private router: Router,private authService: AuthService) {}
  
  
//   // This helper is technically not needed for the stepper logic anymore 
//   // since statuses are hardcoded, but good to keep if you make it dynamic later.
//   get activeIndex(): number { 
//     return this.STEPS.findIndex((s) => s.status === "active"); 
//   } 

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();

//     // Load Data
//     const storedReceipt = sessionStorage.getItem('voteReceipt');
//     if (storedReceipt) {
//       this.receiptData = JSON.parse(storedReceipt);
//     }
//   }

//   ngOnDestroy() { 
//     if (this.timerId) clearInterval(this.timerId); 
//   }

//   startTimer() {
//     this.timerId = setInterval(() => {
//       if (this.totalSeconds > 0) {
//         this.totalSeconds--;
//         this.updateTimeLeftString();
//         this.cdr.detectChanges();
//       } else {
//         clearInterval(this.timerId);
//       }
//     }, 1000);
//   }

//   private updateTimeLeftString() {
//     const h = Math.floor(this.totalSeconds / 3600);
//     const m = Math.floor((this.totalSeconds % 3600) / 60);
//     const s = this.totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }

//   close() {
//     this.authService.logout();
//     sessionStorage.clear();
//     this.router.navigate(['/']);
//   }
  

//   downloadReceipt() {
//     if (!this.receiptData) return;

//     const doc = new jsPDF();
//     const data = this.receiptData;

//     // --- Header ---
//     doc.setFontSize(22);
//     doc.setTextColor(40, 40, 40);
//     doc.text("DataSoft Popularity Contest", 105, 20, { align: 'center' });
    
//     doc.setFontSize(14);
//     doc.setTextColor(82, 159, 45); // Green
//     doc.text("Official Digital Vote Receipt", 105, 30, { align: 'center' });

//     doc.setDrawColor(200, 200, 200);
//     doc.line(20, 35, 190, 35);

//     let y = 50;
//     const leftCol = 20;
//     const rightCol = 80;

//     // --- Helper to print section ---
//     const printSectionTitle = (title: string) => {
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.setTextColor(82, 159, 45);
//       doc.text(title, leftCol, y);
//       y += 10;
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(11);
//       doc.setTextColor(0, 0, 0);
//     };

//     // const printRow = (label: string, value: string) => {
//     //   doc.setFont("helvetica", "bold");
//     //   doc.text(label, leftCol, y);
//     //   doc.setFont("helvetica", "normal");
//     //   doc.text(value, rightCol, y);
//     //   y += 8;
//     // };
//     const printRow = (label: string, value: string) => {
//       doc.setFont("helvetica", "bold");
//       doc.text(label, leftCol, y);
//       doc.setFont("helvetica", "normal");
//       // FIX: Add || '' to ensure no nulls are passed
//       doc.text(String(value || ''), rightCol, y); 
//       y += 8;
//     };

//     // 1. Employee Details
//     printSectionTitle("Voter Details");
//     printRow("Name:", data.employee.name);
//     printRow("Employee ID:", data.employee.id);
//     // printRow("Designation:", data.employee.designation);
//     y += 5;

//     // 2. Candidate Details
//     // printSectionTitle("Voted Candidate");
//     // printRow("Candidate Name:", data.candidate.name);
//     // printRow("Department:", data.candidate.department);
//     // y += 5;

//     // 3. Blockchain Verification
//     printSectionTitle("Blockchain Verification");
//     printRow("Date & Time:", data.vote.timestamp);
    
//     doc.setFont("helvetica", "bold");
//     doc.text("Block Hash (TxID):", leftCol, y);
//     y += 7;
    
//     // Hash is long, needs wrapping or smaller font
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);
//     const splitHash = doc.splitTextToSize(data.vote.txId, 170); // Wrap text
//     doc.text(splitHash, leftCol, y);
    
//     y += 20;

//     // --- Footer ---
//     doc.setFont("helvetica", "italic");
//     doc.setFontSize(9);
//     doc.setTextColor(100, 100, 100);
//     doc.text("This receipt confirms that your vote has been securely recorded on the blockchain.", 105, y, { align: 'center' });
//     doc.text("Powered by DataSoft Systems Bangladesh Limited", 105, y + 5, { align: 'center' });

//     doc.save(`Vote_Receipt_${data.employee.id}.pdf`);
//   }
// }

//main2
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Check } from 'lucide-angular';
// // [NEW] Import jsPDF
// import { jsPDF } from 'jspdf';

// @Component({
//   selector: 'app-step5',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule],
//   templateUrl: './step5.component.html',
//   styleUrls: ['./step5.component.css']
// })
// export class Step5Component implements OnInit, OnDestroy {
//   readonly icons = { Check };
//   logoImg = '/dataSoft.svg';
//   shakeIcon = 'assets/images/shake.png';

//   // [NEW] Hold receipt data
//   receiptData: any = null;

//   STEPS = [
//     { id: 1, label: "Login", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "completed" },
//     { id: 5, label: "Success Message", status: "active" },
//   ];

//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(private cdr: ChangeDetectorRef, private router: Router) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();

//     // [NEW] Load Receipt Data
//     const storedReceipt = sessionStorage.getItem('voteReceipt');
//     if (storedReceipt) {
//       this.receiptData = JSON.parse(storedReceipt);
//     } else {
//       // Optional: Redirect if no receipt data found (direct access attempt)
//       // this.router.navigate(['/']); 
//     }
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   startTimer() {
//     this.timerId = setInterval(() => {
//       if (this.totalSeconds > 0) {
//         this.totalSeconds--;
//         this.updateTimeLeftString();
//         this.cdr.detectChanges();
//       } else {
//         clearInterval(this.timerId);
//       }
//     }, 1000);
//   }

//   private updateTimeLeftString() {
//     const h = Math.floor(this.totalSeconds / 3600);
//     const m = Math.floor((this.totalSeconds % 3600) / 60);
//     const s = this.totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }

//   close() {
//     // Clear session and go home
//     sessionStorage.clear();
//     this.router.navigate(['/']);
//   }

//   // [NEW] Generate PDF Logic
//   downloadReceipt() {
//     if (!this.receiptData) {
//       alert("No receipt data found.");
//       return;
//     }

//     const doc = new jsPDF();
//     const data = this.receiptData;

//     // --- PDF STYLING ---
    
//     // Header
//     doc.setFontSize(22);
//     doc.setTextColor(40, 40, 40);
//     doc.text("DataSoft Popularity Contest", 105, 20, { align: 'center' });
    
//     doc.setFontSize(16);
//     doc.setTextColor(82, 159, 45); // Green color
//     doc.text("Official Vote Receipt", 105, 30, { align: 'center' });

//     // Divider Line
//     doc.setDrawColor(200, 200, 200);
//     doc.line(20, 35, 190, 35);

//     // Vote Details Section
//     doc.setFontSize(12);
//     doc.setTextColor(0, 0, 0);

//     let yPos = 50;
//     const lineHeight = 10;

//     // Helper to print label: value
//     const printRow = (label: string, value: string) => {
//       doc.setFont("helvetica", "bold");
//       doc.text(label, 20, yPos);
//       doc.setFont("helvetica", "normal");
//       doc.text(value, 80, yPos);
//       yPos += lineHeight;
//     };

//     printRow("Transaction ID:", `TXN-${Date.now().toString().slice(-8)}`); // Fake transaction ID
//     printRow("Date & Time:", data.timestamp);
    
//     yPos += 5; // Extra spacing

//     // Employee Info
//     doc.setFontSize(14);
//     doc.setTextColor(82, 159, 45);
//     doc.text("Voter Information", 20, yPos);
//     yPos += 10;
    
//     doc.setFontSize(12);
//     doc.setTextColor(0, 0, 0);
//     printRow("Employee Name:", data.voterName);
//     printRow("Employee ID:", data.voterId);

//     yPos += 5;

//     // Candidate Info
//     doc.setFontSize(14);
//     doc.setTextColor(82, 159, 45);
//     doc.text("Voted Candidate", 20, yPos);
//     yPos += 10;

//     doc.setFontSize(12);
//     doc.setTextColor(0, 0, 0);
//     printRow("Candidate Name:", data.candidateName);
//     printRow("Department:", data.candidateDept);

//     // Footer
//     yPos = 250;
//     doc.setFontSize(10);
//     doc.setTextColor(150, 150, 150);
//     doc.text("This receipt confirms that your vote has been securely recorded on the blockchain.", 105, yPos, { align: 'center' });
//     doc.text("Powered by DataSoft Systems Bangladesh Limited", 105, yPos + 6, { align: 'center' });

//     // Save
//     doc.save(`Vote_Receipt_${data.voterId}.pdf`);
//   }
// }




////main
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Check } from 'lucide-angular';

// @Component({
//   selector: 'app-step5',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule],
//   templateUrl: './step5.component.html',
//   styleUrls: ['./step5.component.css']
// })
// export class Step5Component implements OnInit, OnDestroy {
//   // --- ASSETS ---
//   readonly icons = { Check };
//   logoImg = '/dataSoft.svg';
//   shakeIcon = 'assets/images/shake.png'; // Ensure this exists

//   // --- STEPPER ---
//   STEPS = [
//     { id: 1, label: "Login", status: "completed" },
//     { id: 2, label: "Your Information", status: "completed" },
//     { id: 3, label: "Candidate Choice", status: "completed" },
//     { id: 4, label: "Finger Verification", status: "completed" },
//     { id: 5, label: "Success Message", status: "active" },
//   ];

//   // --- STATE ---
//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(private cdr: ChangeDetectorRef, private router: Router) {}

//   get activeIndex(): number {
//     return this.STEPS.findIndex((s) => s.status === "active");
//   }

//   // --- LIFECYCLE ---
//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
//   }

//   ngOnDestroy() {
//     if (this.timerId) clearInterval(this.timerId);
//   }

//   // --- TIMER ---
//   startTimer() {
//     this.timerId = setInterval(() => {
//       if (this.totalSeconds > 0) {
//         this.totalSeconds--;
//         this.updateTimeLeftString();
//         this.cdr.detectChanges();
//       } else {
//         clearInterval(this.timerId);
//       }
//     }, 1000);
//   }

//   private updateTimeLeftString() {
//     const h = Math.floor(this.totalSeconds / 3600);
//     const m = Math.floor((this.totalSeconds % 3600) / 60);
//     const s = this.totalSeconds % 60;
//     this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
//   }

//   private pad(val: number): string {
//     return val < 10 ? `0${val}` : `${val}`;
//   }

//   // --- ACTIONS ---
//   close() {
//     // Navigate back to Login or Home
//     this.router.navigate(['/']);
//   }

//   printReceipt() {
//     window.print(); // Simple browser print trigger
//   }
// }