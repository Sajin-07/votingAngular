import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';
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
export class Step5Component {
  readonly icons = { Check };

  logoImg = '/dataSoft.svg';
  shakeIcon = 'assets/images/shake.png';

  timeLeft = '00:00:00'; // Static for design
  currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  receiptData: any = {
    employee: {
      name: 'John Doe',
      id: 'EMP-1023'
    },
    candidate: {
      name: 'Candidate A'
    },
    vote: {
      timestamp: '10 Feb 2026, 11:42 AM',
      txId: 'a9f3c1e9d8a7b6c5e4f3219a8b7c6d5e4f3'
    }
  };

  STEPS: Step[] = [
    { id: 1, label: 'Scan QR Code', status: 'completed' },
    { id: 2, label: 'Your Information', status: 'completed' },
    { id: 3, label: 'Candidate Choice', status: 'completed' },
    { id: 4, label: 'Finger Verification', status: 'completed' },
    { id: 5, label: 'Success Message', status: 'active' }
  ];

  close() {
    // Design-only placeholder
    console.log('Close clicked');
  }

  downloadReceipt() {
    const doc = new jsPDF();
    const data = this.receiptData;

    doc.setFontSize(22);
    doc.text('DataSoft Popularity Contest', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(82, 159, 45);
    doc.text('Official Digital Vote Receipt', 105, 30, { align: 'center' });

    doc.line(20, 35, 190, 35);

    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Voter Details', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.employee.name}`, 20, y);
    y += 8;
    doc.text(`Employee ID: ${data.employee.id}`, 20, y);
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.text('Blockchain Verification', 20, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Date & Time: ${data.vote.timestamp}`, 20, y);
    y += 10;

    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(data.vote.txId, 170), 20, y);

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

//   // --- TIMER & DATE STATE ---
//   timeLeft = "00:00:00";
//   currentDate = "";
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
//     // 1. Set Realtime Date
//     const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
//     this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

//     // 2. Connect Socket
//     this.socketService.connectVoter();

//     // 3. Subscribe to Timer
//     this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
//       this.updateTimeLeftString(seconds);

//       // REDIRECT LOGIC: If voting closed, kick user out (even from success page)
//       if (!this.socketService.isVotingOpen$.value) {
//         this.router.navigate(['/verify-qr']);
//       }

//       this.cdr.detectChanges();
//     });

//     // 4. Load Receipt Data
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


