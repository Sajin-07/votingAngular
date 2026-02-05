import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';
import { jsPDF } from 'jspdf';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
// Import Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    HeaderComponent, 
    StepperComponent
  ],
  template: `
    <div
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
    >
      
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <app-header></app-header>

        <app-stepper [currentStep]="4"></app-stepper>

        <div class="flex-1 max-w-5xl mx-auto w-full mt-10 mb-10 font-inter flex flex-col items-center justify-center">
            
            <div class="w-full h-[360px] bg-[#00000054] border border-[#3E3D45] rounded-xl flex flex-col items-center justify-center relative shadow-[0px_4px_4px_0px_#00000040] p-6">
                
                <div class="mb-6">
                    <img 
                        [src]="shakeIcon" 
                        alt="Success" 
                        class="w-[100px] h-[69px] object-contain"
                    />
                </div>

                <h2 class="text-[20px] font-bold text-white text-center leading-tight mb-2">
                    Congratulations, your vote has been<br />cast successfully.
                </h2>

            </div>
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto">
          
          <button
            (click)="close()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            CLOSE
          </button>
         
          <button
            (click)="downloadReceipt()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#529F2D] to-[#1D3910] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-[0_8px_24px_rgba(82,159,45,0.45)] hover:from-[#5fb834] hover:to-[#234715] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            DOWNLOAD RECEIPT
          </button>

        </div>

      </div>
    </div>
  `,
  styles: []
})
export class Step4Component implements OnInit {
  readonly icons = { Check };
  shakeIcon = 'assets/images/shake.png';

  // Default Data (Fallbacks)
  receiptData = {
    voterId: 'UNKNOWN',
    timestamp: new Date().toLocaleString(),
    txId: 'PENDING_VERIFICATION'
  };

  constructor(private router: Router,private http: HttpClient) {}

  ngOnInit() {
    // 1. Try to get data from storage
    const storedData = sessionStorage.getItem('voteReceipt');

    if (storedData) {
      const parsed = JSON.parse(storedData);
      
      // 2. Format the date
      const dateObj = new Date(parsed.timestamp);
      const formattedTime = dateObj.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });

      // 3. Update the view variables with REAL data
      this.receiptData = {
        voterId: parsed.voterId,
        timestamp: formattedTime,
        txId: parsed.txId
      };
    } else {
      console.warn('No receipt data found in session storage.');
    }
  }

  close() {
  // Clear local session storage
  sessionStorage.removeItem('voteReceipt');

  // Call the Logout API to clear the cookie
  this.http.post('http://localhost:3000/api/voter/logout', {}, { withCredentials: true })
    .pipe(
      finalize(() => {
        this.router.navigate(['/']); 
      })
    )
    .subscribe({
      next: () => console.log('Logged out successfully'),
      error: (err) => console.error('Logout error', err)
    });
}

  downloadReceipt() {
    const doc = new jsPDF();
    const data = this.receiptData;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('DataSoft Popularity Contest', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(82, 159, 45); // Green color
    doc.text('Official Digital Vote Receipt', 105, 30, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    let y = 50;

    // Voter Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Voter Information', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Voter ID
    doc.text(`Voter ID:`, 20, y);
    doc.text(data.voterId, 60, y);
    y += 8;

    // Date
    doc.text(`Time Recorded:`, 20, y);
    doc.text(data.timestamp, 60, y);
    y += 15;

    // Blockchain Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Blockchain Verification', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Transaction Hash (TxID):', 20, y);
    y += 6;

    // Print Hash in Monospace font, wrapping text if too long
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    // Split long hash into multiple lines to fit page width
    const splitHash = doc.splitTextToSize(data.txId, 170);
    doc.text(splitHash, 20, y);

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This receipt is cryptographically secured on the Hyperledger Fabric network.', 105, 280, { align: 'center' });

    doc.save(`Vote_Receipt_${data.voterId}.pdf`);
  }
}

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { LucideAngularModule, Check } from 'lucide-angular';
// import { jsPDF } from 'jspdf';

// interface Step {
//   id: number;
//   label: string;
//   status: 'completed' | 'active' | 'pending';
// }

// @Component({
//   selector: 'app-step4',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule],
//   templateUrl: './step4.component.html',
//   styles: [] // Keep your styles or css file link
// })
// export class Step4Component implements OnInit {
//   readonly icons = { Check };

//   logoImg = '/dataSoft.svg';
//   shakeIcon = 'assets/images/shake.png';

//   timeLeft = '00:00:00'; 
//   currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

//   // Default Data (Fallbacks)
//   receiptData = {
//     voterId: 'UNKNOWN',
//     timestamp: new Date().toLocaleString(),
//     txId: 'PENDING_VERIFICATION'
//   };

//   STEPS: Step[] = [
//     { id: 1, label: 'Scan QR Code', status: 'completed' },
//     { id: 2, label: 'Your Information', status: 'completed' },
//     { id: 3, label: 'Candidate Choice', status: 'completed' },
//     { id: 4, label: 'Success Message', status: 'active' }
//   ];

//   constructor(private router: Router) {}

//   ngOnInit() {
//   // 1. Try to get data from storage
//   const storedData = sessionStorage.getItem('voteReceipt');

//   if (storedData) {
//     const parsed = JSON.parse(storedData);
    
//     // 2. Format the date
//     const dateObj = new Date(parsed.timestamp);
//     const formattedTime = dateObj.toLocaleString('en-GB', {
//       day: 'numeric', month: 'short', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit'
//     });

//     // 3. Update the view variables with REAL data
//     this.receiptData = {
//       voterId: parsed.voterId,
//       timestamp: formattedTime,
//       txId: parsed.txId
//     };
//   } else {
//     // Optional: If no data found, maybe redirect back to start?
//     console.warn('No receipt data found in session storage.');
//   }
// }

//   close() {
//     // Clear session and go home
//     sessionStorage.removeItem('voteReceipt');
//     this.router.navigate(['/']);
//   }

//   downloadReceipt() {
//     const doc = new jsPDF();
//     const data = this.receiptData;

//     // Header
//     doc.setFontSize(22);
//     doc.setTextColor(0, 0, 0);
//     doc.text('DataSoft Popularity Contest', 105, 20, { align: 'center' });

//     doc.setFontSize(14);
//     doc.setTextColor(82, 159, 45); // Green color
//     doc.text('Official Digital Vote Receipt', 105, 30, { align: 'center' });

//     doc.setDrawColor(200, 200, 200);
//     doc.line(20, 35, 190, 35);

//     let y = 50;

//     // Voter Details Section
//     doc.setTextColor(0, 0, 0);
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(14);
//     doc.text('Voter Information', 20, y);
//     y += 10;

//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'normal');
    
//     // Voter ID
//     doc.text(`Voter ID:`, 20, y);
//     doc.text(data.voterId, 60, y);
//     y += 8;

//     // Date
//     doc.text(`Time Recorded:`, 20, y);
//     doc.text(data.timestamp, 60, y);
//     y += 15;

//     // Blockchain Section
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(14);
//     doc.text('Blockchain Verification', 20, y);
//     y += 10;

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Transaction Hash (TxID):', 20, y);
//     y += 6;

//     // Print Hash in Monospace font, wrapping text if too long
//     doc.setFont('courier', 'normal');
//     doc.setFontSize(9);
//     doc.setTextColor(60, 60, 60);
    
//     // Split long hash into multiple lines to fit page width
//     const splitHash = doc.splitTextToSize(data.txId, 170);
//     doc.text(splitHash, 20, y);

//     // Footer
//     doc.setFont('helvetica', 'italic');
//     doc.setFontSize(8);
//     doc.setTextColor(150, 150, 150);
//     doc.text('This receipt is cryptographically secured on the Hyperledger Fabric network.', 105, 280, { align: 'center' });

//     doc.save(`Vote_Receipt_${data.voterId}.pdf`);
//   }
// }
