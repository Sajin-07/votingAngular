import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, QrCode, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Lock, User, Printer, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-qr-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, LucideAngularModule],
  template: `
    <div
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #36343b 0%, #1e1d24 100%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 gap-6 mt-4">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 class="uppercase text-2xl md:text-[28px] mb-2 font-bold tracking-tight text-white">
              QR CODE GENERATION
            </h1>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[16px]">
              <p class="text-[#A1A1A1]">
                Role:
                <span class="ml-1 text-[#86EFAC] font-inter font-bold">
                  Moderator
                </span>
              </p>
              <p class="text-[#A1A1A1]">
                Date
                <span class="ml-1 text-white font-bold">{{ currentDate }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-2 md:mt-0">
            <p class="text-base md:text-[14px] text-[#A1A1A1]">Powered by</p>
            <span class="font-bold text-xl tracking-wider">DataSoft</span>
          </div>
        </header>

        <div class="w-full flex-1">
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div class="space-y-6">
              
              <h2 class="text-[#EC9D37] text-xl font-bold">Generate Voter QR Code</h2>

              <div class="w-full">
                <label class="block text-white text-base mb-2">
                  Enter Voter ID
                </label>

                <div class="flex flex-col gap-4 w-full">
                  
                  <div class="w-full flex flex-col">
                    
                    <div class="relative w-full">
                      <input
                        type="text"
                        [(ngModel)]="voterId"
                        name="voterId"
                        placeholder="Enter Voter ID"
                        class="w-full h-[56px] px-4 bg-[#EAF0F6] border border-transparent rounded-md text-[#1a1a1a] placeholder-[#707070] focus:outline-none focus:border-[#EC9D37] focus:ring-2 focus:ring-[#EC9D37]/50 transition-all font-inter text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        [disabled]="loading"
                        (input)="errorMessage = ''" 
                      />
                    </div>

                    <div class="mt-3 min-h-[24px]">
                      <div *ngIf="errorMessage" class="flex items-center gap-2 text-[#ff6b6b] animate-fade-in">
                        <lucide-icon [img]="icons.AlertCircle" [size]="18"></lucide-icon>
                        <span class="text-sm font-medium">{{ errorMessage }}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    (click)="generateQR()"
                    [disabled]="loading || !voterId"
                    class="h-[56px] w-full px-8 bg-[#E77E22] hover:bg-[#d9721a] active:bg-[#c56616] text-white text-lg font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap shadow-lg"
                  >
                    <span *ngIf="!loading">Generate QR Code</span>
                    <span *ngIf="loading" class="text-base">Processing...</span>
                  </button>

                </div>
              </div>

              <div *ngIf="qrImage" class="bg-[#2a2833] border border-[#3d3a47] rounded-lg p-6 space-y-4 animate-fade-in">
                <div class="flex items-center gap-3 mb-4">
                  <lucide-icon [img]="icons.User" [size]="24" class="text-[#EC9D37]"></lucide-icon>
                  <h3 class="text-xl font-bold text-white">Session Information</h3>
                </div>

                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <lucide-icon [img]="icons.ShieldCheck" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Voter ID</p>
                      <p class="text-white font-medium">{{ voterId }}</p>
                    </div>
                  </div>

                  <div *ngIf="attemptsMsg" class="flex items-start gap-3">
                    <lucide-icon [img]="icons.Lock" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Status</p>
                      <p class="text-white font-medium">{{ attemptsMsg }}</p>
                    </div>
                  </div>
                  
                  <div class="pt-3 border-t border-[#3d3a47]">
                    <div class="flex items-center gap-2">
                       <p class="text-green-400 text-sm">QR Generated Successfully</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="space-y-6">
              
              <div *ngIf="qrImage" class="bg-[#2a2833] border border-[#3d3a47] rounded-lg p-8 space-y-6 animate-fade-in">
                
                <div class="flex items-center gap-3 mb-4">
                  <lucide-icon [img]="icons.QrCode" [size]="24" class="text-[#EC9D37]"></lucide-icon>
                  <h3 class="text-xl font-bold text-white">QR Code</h3>
                </div>

                <div class="flex justify-center items-center bg-white p-8 rounded-lg">
                  <img 
                    [src]="qrImage" 
                    alt="Voter QR Code"
                    class="w-full max-w-[300px] h-auto"
                  />
                </div>

                <div class="space-y-2 text-center">
                  <p class="text-[#A1A1A1] text-sm">
                    QR Code for: <span class="text-white font-medium">{{ voterId }}</span>
                  </p>
                  <p class="text-[#A1A1A1] text-xs">
                    Expires in 30 minutes
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <button
                    (click)="printQR()"
                    class="h-[48px] px-6 bg-[#4a4755] hover:bg-[#5a5565] text-white text-base font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <lucide-icon [img]="icons.Printer" [size]="18"></lucide-icon>
                    Print
                  </button>

                  <button
                    (click)="reset()"
                    class="h-[48px] px-6 bg-[#E77E22] hover:bg-[#d9721a] text-white text-base font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <lucide-icon [img]="icons.RefreshCw" [size]="18"></lucide-icon>
                    Generate Another
                  </button>
                </div>

                <div class="bg-[#3b2d2d] border border-[#EC9D37]/20 p-4 rounded-md">
                  <div class="flex items-start gap-3">
                    <lucide-icon [img]="icons.Lock" [size]="18" class="text-[#EC9D37] mt-0.5 flex-shrink-0"></lucide-icon>
                    <div>
                      <p class="text-[#EC9D37] text-sm font-semibold mb-1">Security Notice</p>
                      <p class="text-[#d1d1d1] text-xs">
                        This QR code is valid for 30 minutes and is linked to this specific voter only. 
                        Do not share this QR code publicly.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div *ngIf="!qrImage" class="bg-[#2a2833] border border-[#3d3a47] border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                <lucide-icon [img]="icons.QrCode" [size]="64" class="text-[#4a4755]"></lucide-icon>
                <p class="text-[#A1A1A1] text-base">
                  Enter a Voter ID and generate QR code to see it here
                </p>
              </div>

            </div>

          </div>

          <div class="mt-12 w-full flex justify-center">
            <a routerLink="/moderator-dashboard" class="inline-flex items-center gap-2 text-[#A1A1A1] hover:text-[#EC9D37] transition-colors cursor-pointer group py-2">
              <lucide-icon [img]="icons.ArrowLeft" [size]="20" class="group-hover:-translate-x-1 transition-transform"></lucide-icon>
              <span class="font-medium text-base">Back to Dashboard</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
  `]
})
export class QrLoginComponent implements OnInit {
  // Design assets from Version 1
  readonly icons = { 
    QrCode, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Lock, 
    User, Printer, RefreshCw 
  };
  currentDate: string = '';

  // Logic variables from Version 2
  voterId: string = '';
  qrImage: string | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  attemptsMsg: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Purely for the V1 Header Design
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);
  }

  // Exact Logic from Version 2
  generateQR() {
    this.loading = true;
    this.errorMessage = '';
    this.qrImage = null;

    this.http.post<any>('http://localhost:3000/api/moderator/generate-voter-qr', { 
      voterId: this.voterId 
    }, { withCredentials: true })
    .subscribe({
      next: (res) => {
        this.qrImage = res.qrImage;
        this.loading = false;
        
        if(res.remainingAttempts !== undefined) {
             this.attemptsMsg = `Remaining attempts: ${res.remainingAttempts}`;
        }

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to generate QR';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Exact Logic from Version 2
  printQR() {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="text-align:center; font-family: sans-serif;">
            <h1>Voter Access Code</h1>
            <p>ID: ${this.voterId}</p>
            <img src="${this.qrImage}" style="width:300px;height:300px;"/>
            <p style="color:red">Expires in 30 Minutes</p>
            <script>window.print();window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  // Exact Logic from Version 2
  reset() {
    this.voterId = '';
    this.qrImage = null;
    this.errorMessage = '';
    this.attemptsMsg = '';
  }
}



// // main2
// import { Component, ChangeDetectorRef } from '@angular/core'; // <--- Import CDR
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-qr-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="container">
//       <h2>Generate Voter QR Code</h2>
      
//       <div class="form-group">
//         <label>Voter ID</label>
//         <input type="text" [(ngModel)]="voterId" placeholder="Enter Voter ID" class="form-control">
//       </div>
      
//       <button (click)="generateQR()" [disabled]="loading || !voterId" class="btn-primary">
//         {{ loading ? 'Generating...' : 'Generate QR' }}
//       </button>

//       <div *ngIf="errorMessage" class="error-box">
//         ⚠️ {{ errorMessage }}
//       </div>

//       <div *ngIf="qrImage" class="qr-result">
//         <h3>QR Code Generated</h3>
//         <p>Voter: <strong>{{ voterId }}</strong></p>
//         <p class="expiry-note">Expires in 30 minutes</p>
        
//         <img [src]="qrImage" alt="Voter QR Code" class="qr-img">
        
//         <p class="attempts" *ngIf="attemptsMsg">{{ attemptsMsg }}</p>

//         <div class="actions">
//           <button (click)="printQR()">Print QR</button>
//           <button (click)="reset()">Clear</button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .container { max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
//     .qr-img { width: 250px; height: 250px; margin: 1rem 0; border: 1px solid #ccc; }
//     .error-box { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin-top: 15px; border-radius: 4px; }
//     .btn-primary { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 4px; }
//     button:disabled { opacity: 0.6; cursor: not-allowed; }
//     .expiry-note { color: #666; font-size: 0.9rem; font-style: italic; }
//     .attempts { font-size: 0.85rem; color: #555; margin-top: 5px; }
//     .actions button { margin: 0 5px; padding: 5px 10px; cursor: pointer; }
//   `]
// })
// export class QrLoginComponent {
//   voterId: string = '';
//   qrImage: string | null = null;
//   loading: boolean = false;
//   errorMessage: string = '';
//   attemptsMsg: string = '';

//   constructor(
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef // <--- Inject CDR
//   ) {}

//   generateQR() {
//     this.loading = true;
//     this.errorMessage = '';
//     this.qrImage = null;

//     this.http.post<any>('http://localhost:3000/api/moderator/generate-voter-qr', { 
//       voterId: this.voterId 
//     }, { withCredentials: true })
//     .subscribe({
//       next: (res) => {
//         this.qrImage = res.qrImage;
//         this.loading = false;
        
//         if(res.remainingAttempts !== undefined) {
//              this.attemptsMsg = `Remaining attempts: ${res.remainingAttempts}`;
//         }

//         // Fix: Force UI Update immediately
//         this.cdr.detectChanges(); 
//       },
//       error: (err) => {
//         // Show "Limit Reached" or other errors
//         this.errorMessage = err.error?.error || 'Failed to generate QR';
//         this.loading = false;
        
//         // Fix: Force UI Update immediately
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   printQR() {
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(`
//         <html>
//           <body style="text-align:center; font-family: sans-serif;">
//             <h1>Voter Access Code</h1>
//             <p>ID: ${this.voterId}</p>
//             <img src="${this.qrImage}" style="width:300px;height:300px;"/>
//             <p style="color:red">Expires in 30 Minutes</p>
//             <script>window.print();window.close();</script>
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//     }
//   }

//   reset() {
//     this.voterId = '';
//     this.qrImage = null;
//     this.errorMessage = '';
//     this.attemptsMsg = '';
//   }
// }







////main
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common'; // <--- Added
// import { FormsModule } from '@angular/forms';     // <--- Added
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-qr-login',
//   standalone: true, // <--- Ensure this is true
//   imports: [CommonModule, FormsModule], // <--- Essential for *ngIf and [(ngModel)]
//   template: `
//     <div class="container">
//       <h2>Generate Voter QR Code</h2>
      
//       <div class="form-group">
//         <label>Voter ID</label>
//         <input type="text" [(ngModel)]="voterId" placeholder="Enter Voter ID" class="form-control">
//       </div>
      
//       <button (click)="generateQR()" [disabled]="loading || !voterId" class="btn-primary">
//         {{ loading ? 'Generating...' : 'Generate QR' }}
//       </button>

//       <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

//       <div *ngIf="qrImage" class="qr-result">
//         <h3>QR Code Generated</h3>
//         <p>Voter: <strong>{{ voterId }}</strong></p>
//         <img [src]="qrImage" alt="Voter QR Code" class="qr-img">
        
//         <div class="actions">
//           <button (click)="printQR()">Print QR</button>
//           <button (click)="reset()">Clear</button>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .container { max-width: 500px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; text-align: center; }
//     .qr-img { width: 250px; height: 250px; margin: 1rem 0; border: 1px solid #ccc; }
//     .error { color: red; margin-top: 10px; }
//     .btn-primary { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
//     button:disabled { opacity: 0.6; }
//   `]
// })
// export class QrLoginComponent {
//   voterId: string = '';
//   qrImage: string | null = null;
//   loading: boolean = false;
//   errorMessage: string = '';

//   constructor(private http: HttpClient) {}

//   generateQR() {
//     this.loading = true;
//     this.errorMessage = '';
//     this.qrImage = null;

//     this.http.post<any>('http://localhost:3000/api/moderator/generate-voter-qr', { 
//       voterId: this.voterId 
//     }, { withCredentials: true })
//     .subscribe({
//       next: (res) => {
//         this.qrImage = res.qrImage;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.errorMessage = err.error?.error || 'Failed to generate QR';
//         this.loading = false;
//       }
//     });
//   }

//   printQR() {
//     const printWindow = window.open('', '_blank');
//     if (printWindow) {
//       printWindow.document.write(`
//         <html>
//           <body style="text-align:center; font-family: sans-serif;">
//             <h1>Voter Access Code</h1>
//             <p>ID: ${this.voterId}</p>
//             <img src="${this.qrImage}" style="width:300px;height:300px;"/>
//             <script>window.print();window.close();</script>
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//     }
//   }

//   reset() {
//     this.voterId = '';
//     this.qrImage = null;
//     this.errorMessage = '';
//   }
// }