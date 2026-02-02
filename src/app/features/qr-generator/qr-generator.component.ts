import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle } from 'lucide-angular';
import * as QRCode from 'qrcode';
import { SocketService } from '../../core/services/socket.service'; // Import SocketService
import { Subscription } from 'rxjs';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  template: `
    <div 
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter no-print"
      [style.background]="'radial-gradient(circle at center, #36343b 0%, #1e1d24 100%)'"
    >
      <div class="max-w-[1200px] mx-auto w-full flex flex-col h-full">
        
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 gap-6 mt-4 flex-shrink-0">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
              DATASOFT POPULARITY CONTEST
            </h1>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
              <p class="text-[#A1A1A1]">
                Vote Ends In
                <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
              </p>
              <p class="text-[#A1A1A1]">
                Date
                <span class="ml-1 text-white font-bold">{{ currentDate }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-2 md:mt-0">
            <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
            <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
          </div>
        </header>

        <div class="w-full">
          
          <h2 class="text-[#EC9D37] text-xl font-bold mb-6">QR Generation for Voting</h2>

          <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full animate-fade-in">
            
            <div class="lg:col-span-3 bg-[#232228] border border-[#3E3D45] rounded-lg p-6 md:p-8 shadow-lg relative min-h-[300px] flex items-center">
              
              <div *ngIf="isLoading" class="absolute inset-0 z-20 bg-[#232228] flex flex-col items-center justify-center gap-4 rounded-lg">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#EC9D37]"></div>
              </div>

              <div *ngIf="!isLoading && hasError" class="w-full flex flex-col items-center justify-center text-center gap-4">
                 <lucide-icon [img]="icons.AlertTriangle" [size]="32" class="text-red-400"></lucide-icon>
                 <h3 class="text-lg font-bold">Employee Not Found</h3>
                 <button (click)="retryLoad()" class="text-[#EC9D37] underline">Retry</button>
              </div>

              <div *ngIf="!isLoading && !hasError && employeeInfo" class="flex flex-col md:flex-row gap-8 w-full items-start md:items-center">
                 
                 <div class="flex-shrink-0 mx-auto md:mx-0">
                    <div class="w-[110px] h-[110px] bg-white p-1 shadow-sm overflow-hidden rounded-sm">
                      <img 
                        [src]="employeeInfo.photoUrl || '/assets/default-avatar.png'" 
                        class="w-full h-full object-cover"
                        (error)="handleImageError($event)"
                      />
                    </div>
                 </div>

                 <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    
                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Name</span>
                       <span class="text-white text-[18px] font-bold leading-tight">{{ employeeInfo?.name || 'N/A' }}</span>
                    </div>

                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">DS ID</span>
                       <span class="text-white text-[18px] font-bold leading-tight uppercase">{{ employeeInfo?.dsId || 'N/A' }}</span>
                    </div>

                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Designation</span>
                       <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo?.designation || 'N/A' }}</span>
                    </div>

                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Blood Group</span>
                       <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo?.bloodGroup || 'N/A' }}</span>
                    </div>

                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Issue Date</span>
                       <span class="text-white text-[16px] font-normal leading-tight">{{ getIssueDate() }}</span>
                    </div>

                    <div class="flex flex-col">
                       <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Date of Joining</span>
                       <span class="text-white text-[16px] font-normal leading-tight">{{ getDateOfJoining() }}</span>
                    </div>

                 </div>
              </div>
            </div>

            <div class="lg:col-span-2 bg-[#232228] border border-[#3E3D45] rounded-lg p-8 shadow-lg flex flex-col items-center justify-center text-center">
              
              <div class="bg-white p-3 rounded-md mb-5">
                 <canvas #qrCanvas class="w-[140px] h-[140px] object-contain"></canvas>
              </div>

              <div class="mb-6">
                <h3 class="text-white font-bold text-lg mb-1">{{ employeeInfo?.name || 'N/A' }}</h3>
                <p class="text-[#A1A1A1] text-sm uppercase">{{ dsId }}</p>
              </div>

              <button 
                (click)="printQR()"
                class="w-full max-w-[280px] h-[48px] border border-[#504e58] hover:border-white hover:bg-white/5 text-white rounded-md flex items-center justify-center gap-2 transition-all font-medium text-sm tracking-wide"
              >
                Print QR Code
              </button>

            </div>

          </div>

          <div class="mt-12 flex justify-center">
             <button 
                (click)="generateAnother()"
                class="h-[52px] px-8 bg-[#965E26] hover:bg-[#A6692A] text-white/90 font-medium rounded-md shadow-lg transition-colors text-base"
             >
               Generate Another
             </button>
          </div>

        </div>
      </div>
    </div>

    <div id="print-area" class="print-only">
      <div class="print-content">
        <div class="qr-container">
          <canvas #qrCanvasPrint></canvas>
        </div>
        <div class="print-info">
          <h2 class="print-name">{{ employeeInfo?.name || 'N/A' }}</h2>
          <p class="print-id">{{ dsId }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
    
    /* Hide print area on screen */
    .print-only {
      display: none;
    }
    
    /* Print Styles */
    @media print {
      /* Hide everything except print area */
      .no-print {
        display: none !important;
      }
      
      /* Show only print area */
      .print-only {
        display: block !important;
      }
      
      /* Center content on page */
      .print-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 40px;
      }
      
      /* QR Code styling */
      .qr-container {
        background: white;
        padding: 20px;
        border: 2px solid #000;
        border-radius: 8px;
        margin-bottom: 30px;
      }
      
      .qr-container canvas {
        display: block;
        width: 300px !important;
        height: 300px !important;
      }
      
      /* Text styling */
      .print-info {
        text-align: center;
      }
      
      .print-name {
        font-size: 24px;
        font-weight: bold;
        color: #000;
        margin: 0 0 10px 0;
      }
      
      .print-id {
        font-size: 18px;
        color: #666;
        text-transform: uppercase;
        margin: 0;
        font-weight: 500;
      }
      
      /* Remove page margins */
      @page {
        margin: 0;
      }
    }
  `]
})
export class QrGeneratorComponent implements OnInit, OnDestroy {
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrCanvasPrint', { static: false }) qrCanvasPrint!: ElementRef<HTMLCanvasElement>;
  
  readonly icons = { QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle };
  logoImg = '/dataSoft.svg';
  
  // --- TIMER STATE ---
  timeLeft = "00:00:00";
  currentDate = "";
  private timerSub!: Subscription;
  private isVotingOpen = false;

  dsId: string = '';
  employeeInfo: any = null;
  qrPayload: any = null;
  
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService // Injected Socket Service
  ) {}

  ngOnInit() {
    // 1. Set Realtime Date
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);
    // 1. CONNECT TO SOCKET
    // We connect as a voter (or admin) to listen to the timer
    this.socketService.connectVoter();

    // 2. SUBSCRIBE TO TIMER & ACCESS CONTROL
    this.timerSub = this.socketService.timeLeft$.subscribe(seconds => {
      this.isVotingOpen = this.socketService.isVotingOpen$.value;
      
      // Update Timer UI
      this.updateTimeLeftString(seconds);

      // --- SECURITY CHECK ---
      // If voting is closed or timer hits 0, redirect immediately.
      // We allow a small grace period (seconds > 0) or check the flag.
      if (!this.isVotingOpen && seconds <= 0) {
         // Stop generating, redirect to home
         console.warn("Voting session ended. Redirecting...");
         this.router.navigate(['/qr-login']); 
      }
      
      this.cdr.detectChanges();
    });

    // 3. QR & Data Logic
    this.dsId = this.route.snapshot.paramMap.get('dsId') || '';
    
    if (!this.dsId) {
      this.router.navigate(['/qr-login']);
      return;
    }

    const navState: any = (history && history.state) ? history.state : null;

    // Handle QR Payload
    if (navState && navState.qr) {
      this.qrPayload = navState.qr;
    } else {
      this.qrPayload = {
        dsId: this.dsId,
        type: 'VOTER_AUTH',
        timestamp: new Date().toISOString()
      };
    }

    // Render QR Code immediately
    setTimeout(() => this.generateQRCode(), 0);

    // Handle Employee Info
    if (navState && navState.employee) {
      this.employeeInfo = navState.employee;
      this.isLoading = false;
      console.log('Employee Info from navigation:', this.employeeInfo);
    } else {
      this.loadEmployeeInfo();
    }
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }

  // --- TIMER HELPER ---
  private updateTimeLeftString(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }

  // --- DATA LOADING ---
  loadEmployeeInfo() {
    this.isLoading = true;
    this.hasError = false;

    this.http.get(`${API_URL}/api/employee/${this.dsId}`)
      .toPromise()
      .then((response: any) => {
        if (response) {
          this.employeeInfo = response;
          this.cdr.detectChanges(); 
        } else {
          this.hasError = true;
        }
      })
      .catch((error) => {
        console.error('Error loading employee info:', error);
        this.hasError = true;
      })
      .finally(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  getIssueDate(): string {
    if (!this.employeeInfo) return 'N/A';
    return this.employeeInfo.issueDate || 'N/A';
  }

  getDateOfJoining(): string {
    if (!this.employeeInfo) return 'N/A';
    return this.employeeInfo.dateOfJoining || 'N/A';
  }

  retryLoad() {
    this.loadEmployeeInfo();
  }

  generateAnother() {
    this.router.navigate(['/qr-login']);
  }

  async generateQRCode() {
    if (!this.qrCanvas) return;
    try {
      const qrData = JSON.stringify(this.qrPayload);
      await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
        width: 256,
        margin: 0,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  async generatePrintQRCode() {
    if (!this.qrCanvasPrint) return;
    try {
      const qrData = JSON.stringify(this.qrPayload);
      await QRCode.toCanvas(this.qrCanvasPrint.nativeElement, qrData, {
        width: 300,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      });
    } catch (error) {
      console.error('Error generating print QR code:', error);
    }
  }

  async printQR() {
    await this.generatePrintQRCode();
    setTimeout(() => {
      window.print();
    }, 100);
  }

  verifyQR() {
    this.router.navigate(['/verify-qr'], {
      queryParams: { dsId: this.dsId }
    });
  }
  
  handleImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=' + (this.employeeInfo?.name || 'User') + '&background=random&color=fff';
  }
}

// //v4 qr-generator.component.ts - FIXED DATA BINDING
// import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle } from 'lucide-angular';
// import * as QRCode from 'qrcode';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-qr-generator',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   template: `
//     <div 
//       class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter no-print"
//       [style.background]="'radial-gradient(circle at center, #36343b 0%, #1e1d24 100%)'"
//     >
//       <div class="max-w-[1200px] mx-auto w-full flex flex-col h-full">
        
//         <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 gap-6 mt-4 flex-shrink-0">
//           <div class="flex flex-col items-center md:items-start text-center md:text-left">
//             <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
//               DATASOFT POPULARITY CONTEST
//             </h1>
//             <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
//               <p class="text-[#A1A1A1]">
//                 Vote Ends In
//                 <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
//               </p>
//               <p class="text-[#A1A1A1]">
//                 Date
//                 <span class="ml-1 text-white font-bold">15 December 2025</span>
//               </p>
//             </div>
//           </div>

//           <div class="flex items-center gap-4 mt-2 md:mt-0">
//             <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
//             <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
//           </div>
//         </header>

//         <div class="w-full">
          
//           <h2 class="text-[#EC9D37] text-xl font-bold mb-6">QR Generation for Voting</h2>

//           <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full animate-fade-in">
            
//             <div class="lg:col-span-3 bg-[#232228] border border-[#3E3D45] rounded-lg p-6 md:p-8 shadow-lg relative min-h-[300px] flex items-center">
              
//               <div *ngIf="isLoading" class="absolute inset-0 z-20 bg-[#232228] flex flex-col items-center justify-center gap-4 rounded-lg">
//                 <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#EC9D37]"></div>
//               </div>

//               <div *ngIf="!isLoading && hasError" class="w-full flex flex-col items-center justify-center text-center gap-4">
//                  <lucide-icon [img]="icons.AlertTriangle" [size]="32" class="text-red-400"></lucide-icon>
//                  <h3 class="text-lg font-bold">Employee Not Found</h3>
//                  <button (click)="retryLoad()" class="text-[#EC9D37] underline">Retry</button>
//               </div>

//               <div *ngIf="!isLoading && !hasError && employeeInfo" class="flex flex-col md:flex-row gap-8 w-full items-start md:items-center">
                 
//                  <div class="flex-shrink-0 mx-auto md:mx-0">
//                     <div class="w-[110px] h-[110px] bg-white p-1 shadow-sm overflow-hidden rounded-sm">
//                       <img 
//                         [src]="employeeInfo.photoUrl || '/assets/default-avatar.png'" 
//                         class="w-full h-full object-cover"
//                         (error)="handleImageError($event)"
//                       />
//                     </div>
//                  </div>

//                  <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    
//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Name</span>
//                        <span class="text-white text-[18px] font-bold leading-tight">{{ employeeInfo?.name || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">DS ID</span>
//                        <span class="text-white text-[18px] font-bold leading-tight uppercase">{{ employeeInfo?.dsId || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Designation</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo?.designation || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Blood Group</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo?.bloodGroup || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Issue Date</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ getIssueDate() }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Date of Joining</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ getDateOfJoining() }}</span>
//                     </div>

//                  </div>
//               </div>
//             </div>

//             <div class="lg:col-span-2 bg-[#232228] border border-[#3E3D45] rounded-lg p-8 shadow-lg flex flex-col items-center justify-center text-center">
              
//               <div class="bg-white p-3 rounded-md mb-5">
//                  <canvas #qrCanvas class="w-[140px] h-[140px] object-contain"></canvas>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-white font-bold text-lg mb-1">{{ employeeInfo?.name || 'N/A' }}</h3>
//                 <p class="text-[#A1A1A1] text-sm uppercase">{{ dsId }}</p>
//               </div>

//               <button 
//                 (click)="printQR()"
//                 class="w-full max-w-[280px] h-[48px] border border-[#504e58] hover:border-white hover:bg-white/5 text-white rounded-md flex items-center justify-center gap-2 transition-all font-medium text-sm tracking-wide"
//               >
//                 Print QR Code
//               </button>

//             </div>

//           </div>

//           <div class="mt-12 flex justify-center">
//              <button 
//                 (click)="generateAnother()"
//                 class="h-[52px] px-8 bg-[#965E26] hover:bg-[#A6692A] text-white/90 font-medium rounded-md shadow-lg transition-colors text-base"
//              >
//                Generate Another
//              </button>
//           </div>

//         </div>
//       </div>
//     </div>

//     <!-- Print-only section -->
//     <div id="print-area" class="print-only">
//       <div class="print-content">
//         <div class="qr-container">
//           <canvas #qrCanvasPrint></canvas>
//         </div>
//         <div class="print-info">
//           <h2 class="print-name">{{ employeeInfo?.name || 'N/A' }}</h2>
//           <p class="print-id">{{ dsId }}</p>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     @keyframes fade-in {
//       from { opacity: 0; transform: translateY(10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//     .animate-fade-in {
//       animation: fade-in 0.4s ease-out forwards;
//     }
    
//     /* Hide print area on screen */
//     .print-only {
//       display: none;
//     }
    
//     /* Print Styles */
//     @media print {
//       /* Hide everything except print area */
//       .no-print {
//         display: none !important;
//       }
      
//       /* Show only print area */
//       .print-only {
//         display: block !important;
//       }
      
//       /* Center content on page */
//       .print-content {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//         min-height: 100vh;
//         padding: 40px;
//       }
      
//       /* QR Code styling */
//       .qr-container {
//         background: white;
//         padding: 20px;
//         border: 2px solid #000;
//         border-radius: 8px;
//         margin-bottom: 30px;
//       }
      
//       .qr-container canvas {
//         display: block;
//         width: 300px !important;
//         height: 300px !important;
//       }
      
//       /* Text styling */
//       .print-info {
//         text-align: center;
//       }
      
//       .print-name {
//         font-size: 24px;
//         font-weight: bold;
//         color: #000;
//         margin: 0 0 10px 0;
//       }
      
//       .print-id {
//         font-size: 18px;
//         color: #666;
//         text-transform: uppercase;
//         margin: 0;
//         font-weight: 500;
//       }
      
//       /* Remove page margins */
//       @page {
//         margin: 0;
//       }
//     }
//   `]
// })
// export class QrGeneratorComponent implements OnInit {
//   @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('qrCanvasPrint', { static: false }) qrCanvasPrint!: ElementRef<HTMLCanvasElement>;
  
//   readonly icons = { QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle };
//   logoImg = '/dataSoft.svg';
//   timeLeft = "05:45:35";

//   dsId: string = '';
//   employeeInfo: any = null;
//   qrPayload: any = null;
  
//   isLoading: boolean = true;
//   hasError: boolean = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.dsId = this.route.snapshot.paramMap.get('dsId') || '';
    
//     if (!this.dsId) {
//       this.router.navigate(['/qr-login']);
//       return;
//     }

//     const navState: any = (history && history.state) ? history.state : null;

//     // Handle QR Payload
//     if (navState && navState.qr) {
//       this.qrPayload = navState.qr;
//     } else {
//       this.qrPayload = {
//         dsId: this.dsId,
//         type: 'VOTER_AUTH',
//         timestamp: new Date().toISOString()
//       };
//     }

//     // Render QR Code immediately
//     setTimeout(() => this.generateQRCode(), 0);

//     // Handle Employee Info
//     if (navState && navState.employee) {
//       this.employeeInfo = navState.employee;
//       this.isLoading = false;
//       console.log('Employee Info from navigation:', this.employeeInfo);
//     } else {
//       this.loadEmployeeInfo();
//     }
//   }

//   loadEmployeeInfo() {
//     this.isLoading = true;
//     this.hasError = false;

//     this.http.get(`${API_URL}/api/employee/${this.dsId}`)
//       .toPromise()
//       .then((response: any) => {
//         console.log('Employee Info from API:', response);
//         if (response) {
//           this.employeeInfo = response;
//           console.log('Issue Date:', this.employeeInfo.issueDate);
//           console.log('Date of Joining:', this.employeeInfo.dateOfJoining);
//           this.cdr.detectChanges(); // Force change detection
//         } else {
//           this.hasError = true;
//         }
//       })
//       .catch((error) => {
//         console.error('Error loading employee info:', error);
//         this.hasError = true;
//       })
//       .finally(() => {
//         this.isLoading = false;
//         this.cdr.detectChanges(); // Force change detection
//       });
//   }

//   getIssueDate(): string {
//     if (!this.employeeInfo) return 'N/A';
//     const issueDate = this.employeeInfo.issueDate;
//     return issueDate ? issueDate : 'N/A';
//   }

//   getDateOfJoining(): string {
//     if (!this.employeeInfo) return 'N/A';
//     const dateOfJoining = this.employeeInfo.dateOfJoining;
//     return dateOfJoining ? dateOfJoining : 'N/A';
//   }

//   retryLoad() {
//     this.loadEmployeeInfo();
//   }

//   generateAnother() {
//     this.router.navigate(['/qr-login']);
//   }

//   async generateQRCode() {
//     if (!this.qrCanvas) return;
//     try {
//       const qrData = JSON.stringify(this.qrPayload);
//       await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
//         width: 256,
//         margin: 0,
//         color: { dark: '#000000', light: '#FFFFFF' },
//         errorCorrectionLevel: 'H'
//       });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     }
//   }

//   async generatePrintQRCode() {
//     if (!this.qrCanvasPrint) return;
//     try {
//       const qrData = JSON.stringify(this.qrPayload);
//       await QRCode.toCanvas(this.qrCanvasPrint.nativeElement, qrData, {
//         width: 300,
//         margin: 1,
//         color: { dark: '#000000', light: '#FFFFFF' },
//         errorCorrectionLevel: 'H'
//       });
//     } catch (error) {
//       console.error('Error generating print QR code:', error);
//     }
//   }

//   async printQR() {
//     // Generate QR code for print canvas
//     await this.generatePrintQRCode();
    
//     // Small delay to ensure canvas is rendered
//     setTimeout(() => {
//       window.print();
//     }, 100);
//   }

//     verifyQR() {
//     this.router.navigate(['/verify-qr'], {
//       queryParams: { dsId: this.dsId }
//     });
//   }
  
//   handleImageError(event: any) {
//     event.target.src = 'https://ui-avatars.com/api/?name=' + (this.employeeInfo?.name || 'User') + '&background=random&color=fff';
//   }
// }



// //v3 qr-generator.component.ts
// import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle } from 'lucide-angular';
// import * as QRCode from 'qrcode';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-qr-generator',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   template: `
//     <div 
//       class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
//       [style.background]="'radial-gradient(circle at center, #36343b 0%, #1e1d24 100%)'"
//     >
//       <div class="max-w-[1200px] mx-auto w-full flex flex-col h-full">
        
//         <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 gap-6 mt-4 flex-shrink-0">
//           <div class="flex flex-col items-center md:items-start text-center md:text-left">
//             <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
//               DATASOFT POPULARITY CONTEST
//             </h1>
//             <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
//               <p class="text-[#A1A1A1]">
//                 Vote Ends In
//                 <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
//               </p>
//               <p class="text-[#A1A1A1]">
//                 Date
//                 <span class="ml-1 text-white font-bold">15 December 2025</span>
//               </p>
//             </div>
//           </div>

//           <div class="flex items-center gap-4 mt-2 md:mt-0">
//             <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
//             <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
//           </div>
//         </header>

//         <div class="w-full">
          
//           <h2 class="text-[#EC9D37] text-xl font-bold mb-6">QR Generation for Voting</h2>

//           <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full animate-fade-in">
            
//             <div class="lg:col-span-3 bg-[#232228] border border-[#3E3D45] rounded-lg p-6 md:p-8 shadow-lg relative min-h-[300px] flex items-center">
              
//               <div *ngIf="isLoading" class="absolute inset-0 z-20 bg-[#232228] flex flex-col items-center justify-center gap-4 rounded-lg">
//                 <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#EC9D37]"></div>
//               </div>

//               <div *ngIf="!isLoading && hasError" class="w-full flex flex-col items-center justify-center text-center gap-4">
//                  <lucide-icon [img]="icons.AlertTriangle" [size]="32" class="text-red-400"></lucide-icon>
//                  <h3 class="text-lg font-bold">Employee Not Found</h3>
//                  <button (click)="retryLoad()" class="text-[#EC9D37] underline">Retry</button>
//               </div>

//               <div *ngIf="!isLoading && !hasError && employeeInfo" class="flex flex-col md:flex-row gap-8 w-full items-start md:items-center">
                 
//                  <div class="flex-shrink-0 mx-auto md:mx-0">
//                     <div class="w-[110px] h-[110px] bg-white p-1 shadow-sm overflow-hidden rounded-sm">
//                       <img 
//                         [src]="employeeInfo.photoUrl || '/assets/default-avatar.png'" 
//                         class="w-full h-full object-cover"
//                         (error)="handleImageError($event)"
//                       />
//                     </div>
//                  </div>

//                  <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    
//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Name</span>
//                        <span class="text-white text-[18px] font-bold leading-tight">{{ employeeInfo.name }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">DS ID</span>
//                        <span class="text-white text-[18px] font-bold leading-tight uppercase">{{ employeeInfo.dsId }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Designation</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo.designation }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Blood Group</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo.bloodGroup || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Issue Date</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo.issueDate || 'N/A' }}</span>
//                     </div>

//                     <div class="flex flex-col">
//                        <span class="text-[#A1A1A1] text-[11px] uppercase tracking-wider font-medium mb-1">Date of Joining</span>
//                        <span class="text-white text-[16px] font-normal leading-tight">{{ employeeInfo.dateOfJoining }}</span>
//                     </div>

//                  </div>
//               </div>
//             </div>

//             <div class="lg:col-span-2 bg-[#232228] border border-[#3E3D45] rounded-lg p-8 shadow-lg flex flex-col items-center justify-center text-center">
              
//               <div class="bg-white p-3 rounded-md mb-5">
//                  <canvas #qrCanvas class="w-[140px] h-[140px] object-contain"></canvas>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-white font-bold text-lg mb-1">{{ employeeInfo?.name }}</h3>
//                 <p class="text-[#A1A1A1] text-sm uppercase">{{ dsId }}</p>
//               </div>

//               <button 
//                 (click)="printQR()"
//                 class="w-full max-w-[280px] h-[48px] border border-[#504e58] hover:border-white hover:bg-white/5 text-white rounded-md flex items-center justify-center gap-2 transition-all font-medium text-sm tracking-wide"
//               >
//                 Print QR Code
//               </button>

//             </div>

//           </div>

//           <div class="mt-12 flex justify-center">
//              <button 
//                 (click)="generateAnother()"
//                 class="h-[52px] px-8 bg-[#965E26] hover:bg-[#A6692A] text-white/90 font-medium rounded-md shadow-lg transition-colors text-base"
//              >
//                Generate Another
//              </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     @keyframes fade-in {
//       from { opacity: 0; transform: translateY(10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//     .animate-fade-in {
//       animation: fade-in 0.4s ease-out forwards;
//     }
    
//     /* Print Styles */
//     @media print {
//       body * { visibility: hidden; }
//       #print-area, #print-area * { visibility: visible; }
//       canvas {
//         position: absolute;
//         top: 20%;
//         left: 50%;
//         transform: translate(-50%, -50%);
//         width: 300px !important;
//         height: 300px !important;
//         border: 2px solid black;
//       }
//     }
//   `]
// })
// export class QrGeneratorComponent implements OnInit {
//   @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
//   readonly icons = { QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle };
//   logoImg = '/dataSoft.svg';
//   timeLeft = "05:45:35";

//   dsId: string = '';
//   employeeInfo: any = null;
//   qrPayload: any = null;
  
//   isLoading: boolean = true;
//   hasError: boolean = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient
//   ) {}

//   ngOnInit() {
//     this.dsId = this.route.snapshot.paramMap.get('dsId') || '';
    
//     if (!this.dsId) {
//       this.router.navigate(['/qr-login']);
//       return;
//     }

//     const navState: any = (history && history.state) ? history.state : null;

//     // Handle QR Payload
//     if (navState && navState.qr) {
//       this.qrPayload = navState.qr;
//     } else {
//       this.qrPayload = {
//         dsId: this.dsId,
//         type: 'VOTER_AUTH',
//         timestamp: new Date().toISOString()
//       };
//     }

//     // Render QR Code immediately
//     setTimeout(() => this.generateQRCode(), 0);

//     // Handle Employee Info
//     if (navState && navState.employee) {
//       this.employeeInfo = navState.employee;
//       this.isLoading = false;
//     } else {
//       this.loadEmployeeInfo();
//     }
//   }

//   loadEmployeeInfo() {
//     this.isLoading = true;
//     this.hasError = false;

//     this.http.get(`${API_URL}/api/employee/${this.dsId}`)
//       .toPromise()
//       .then((response: any) => {
//         if (response) {
//           this.employeeInfo = response;
//         } else {
//           this.hasError = true;
//         }
//       })
//       .catch((error) => {
//         console.error('Error loading employee info:', error);
//         this.hasError = true;
//       })
//       .finally(() => {
//         this.isLoading = false;
//       });
//   }

//   retryLoad() {
//     this.loadEmployeeInfo();
//   }

//   generateAnother() {
//     this.router.navigate(['/qr-login']);
//   }

//   async generateQRCode() {
//     if (!this.qrCanvas) return;
//     try {
//       const qrData = JSON.stringify(this.qrPayload);
//       await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
//         width: 256,
//         margin: 0,
//         color: { dark: '#000000', light: '#FFFFFF' },
//         errorCorrectionLevel: 'H'
//       });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     }
//   }

//   printQR() {
//     window.print();
//   }
//   verifyQR() {
//     this.router.navigate(['/verify-qr'], {
//       queryParams: { dsId: this.dsId }
//     });
//   }
  
//   handleImageError(event: any) {
//     event.target.src = 'https://ui-avatars.com/api/?name=' + (this.employeeInfo?.name || 'User') + '&background=random&color=fff';
//   }
// }


// // //v2 qr-generator.component.ts
// import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle } from 'lucide-angular';
// import * as QRCode from 'qrcode';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-qr-generator',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   template: `
//     <div 
//       class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
//       [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
//     >
//       <div class="max-w-[1400px] mx-auto w-full flex flex-col h-full">
        
//         <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 gap-6 mt-4 flex-shrink-0">
//           <div class="flex flex-col items-center md:items-start text-center md:text-left">
//             <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
//               DATASOFT POPULARITY CONTEST
//             </h1>
//             <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
//               <p class="text-[#A1A1A1]">
//                 Vote Ends In
//                 <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
//               </p>
//               <p class="text-[#A1A1A1]">
//                 Date
//                 <span class="ml-1 text-white font-bold">15 January 2026</span>
//               </p>
//             </div>
//           </div>

//           <div class="flex items-center gap-4 mt-2 md:mt-0">
//             <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
//             <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
//           </div>
//         </header>

//         <div class="flex-1 flex flex-col items-center justify-center min-h-0 w-full">
          
//           <div class="text-center mb-8 flex-shrink-0">
//             <h2 class="text-[24px] font-bold text-white mb-2">Voter Token Generated</h2>
//             <p class="text-[#A1A1A1]">Verify the employee details and print the QR token</p>
//           </div>

//           <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            
//             <div class="bg-[#2A2931] border border-[#3E3D45] rounded-xl p-6 lg:p-8 shadow-[0px_4px_4px_0px_#00000040] relative overflow-hidden flex flex-col justify-center min-h-[350px]">
              
//               <div *ngIf="isLoading" class="absolute inset-0 z-20 bg-[#2A2931] flex flex-col items-center justify-center gap-4">
//                 <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#529F2D]"></div>
//                 <p class="text-[#A1A1A1] text-sm animate-pulse">Fetching Voter Details...</p>
//               </div>

//               <div *ngIf="!isLoading && hasError" class="flex flex-col items-center justify-center text-center h-full gap-4">
//                 <div class="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
//                    <lucide-icon [img]="icons.AlertTriangle" [size]="32" class="text-red-400"></lucide-icon>
//                 </div>
//                 <h3 class="text-xl font-bold text-white">Employee Info Not Found</h3>
//                 <p class="text-[#A1A1A1] max-w-xs">Could not retrieve details for {{ dsId }}. The blockchain node might be busy.</p>
//                 <button (click)="retryLoad()" class="mt-4 px-6 py-2 bg-[#3E3D45] hover:bg-[#4a4952] rounded-lg text-sm font-semibold transition">
//                   Retry Fetch
//                 </button>
//               </div>

//               <div *ngIf="!isLoading && !hasError && employeeInfo" class="flex flex-col sm:flex-row gap-6 lg:gap-8 items-center sm:items-start h-full justify-center animate-fade-in">
                
//                 <div class="flex-shrink-0">
//                   <div class="w-[160px] h-[190px] bg-gray-700 rounded border-[3px] border-white overflow-hidden shadow-lg relative">
//                     <img 
//                       [src]="employeeInfo.photoUrl || '/assets/default-avatar.png'" 
//                       alt="Employee Photo" 
//                       class="w-full h-full object-cover"
//                       (error)="handleImageError($event)"
//                     />
//                   </div>
//                 </div>

//                 <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  
//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">Name</span>
//                     <span class="text-[20px] font-bold text-white leading-tight break-words">{{ employeeInfo.name }}</span>
//                   </div>

//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">DS ID</span>
//                     <span class="text-[20px] font-bold text-white leading-tight">{{ employeeInfo.dsId }}</span>
//                   </div>

//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">Designation</span>
//                     <span class="text-[18px] font-bold text-white leading-tight">{{ employeeInfo.designation }}</span>
//                   </div>

//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">Blood Group</span>
//                     <span class="text-[18px] font-bold text-white leading-tight">{{ employeeInfo.bloodGroup || 'N/A' }}</span>
//                   </div>

//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">Issue Date</span>
//                     <span class="text-[18px] font-bold text-white leading-tight">{{ employeeInfo.issueDate || '2026-01-11' }}</span>
//                   </div>

//                   <div class="flex flex-col">
//                     <span class="text-[11px] uppercase tracking-wider text-[#A1A1A1] font-semibold mb-1">Date of Joining</span>
//                     <span class="text-[18px] font-bold text-white leading-tight">{{ employeeInfo.dateOfJoining }}</span>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             <div class="bg-[#00000054] border border-[#3E3D45] rounded-xl p-8 shadow-[0px_4px_4px_0px_#00000040] backdrop-blur-sm flex flex-col items-center justify-center">
              
//               <div class="bg-white rounded-xl p-6 mb-8 shadow-inner w-full max-w-[320px] aspect-square flex items-center justify-center">
//                 <div class="relative w-full h-full flex flex-col items-center justify-center">
//                     <canvas #qrCanvas class="w-full h-full object-contain"></canvas>
//                 </div>
//               </div>

//               <div class="w-full max-w-[320px] space-y-4">
//                 <div class="text-center mb-2">
//                    <p class="text-white text-lg font-bold tracking-widest">{{ dsId }}</p>
//                    <p class="text-[#529F2D] text-xs uppercase font-semibold">Ready to Scan</p>
//                 </div>

//                 <button
//                   (click)="printQR()"
//                   class="h-[56px] w-full uppercase font-semibold text-[15px] bg-gradient-to-r from-[#444249] to-[#222126] border border-[#3E3D45] outline-none shadow-md transition-all duration-200 hover:from-[#529F2D] hover:to-[#1D3910] hover:border-[#529F2D] active:scale-95 cursor-pointer rounded-lg text-white flex items-center justify-center gap-2 group"
//                 >
//                   <lucide-icon [img]="icons.Printer" [size]="20" class="group-hover:animate-pulse"></lucide-icon>
//                   <span>Print QR Token</span>
//                 </button>
//               </div>

//             </div>

//           </div>

//           <div class="text-center mt-8 flex-shrink-0">
//             <a routerLink="/qr-login" class="text-[#A1A1A1] hover:text-white text-sm transition-colors border-b border-transparent hover:border-white pb-0.5">
//               ← Generate Another Token
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     canvas {
//       max-width: 100%;
//       height: auto;
//     }
//     .animate-fade-in {
//       animation: fadeIn 0.5s ease-out;
//     }
//     @keyframes fadeIn {
//       from { opacity: 0; transform: translateY(5px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//     @media print {
//       body * { visibility: hidden; }
//       canvas, canvas * { visibility: visible; }
//       canvas {
//         position: absolute;
//         left: 50%;
//         top: 20%;
//         transform: translate(-50%, -50%);
//         width: 400px !important;
//         height: 400px !important;
//       }
//     }
//   `]
// })
// export class QrGeneratorComponent implements OnInit {
//   @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
//   readonly icons = { QrCode, Printer, ScanLine, CheckCircle, User, AlertTriangle };
  
//   logoImg = '/dataSoft.svg';
//   timeLeft = "05:45:35";

//   dsId: string = '';
//   employeeInfo: any = null;
//   qrPayload: any = null;
  
//   isLoading: boolean = true;
//   hasError: boolean = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient
//   ) {}

//   ngOnInit() {
//     this.dsId = this.route.snapshot.paramMap.get('dsId') || '';
    
//     if (!this.dsId) {
//       this.router.navigate(['/qr-login']);
//       return;
//     }

//     // 1. Get State from previous component (Fast Load Strategy)
//     const navState: any = (history && history.state) ? history.state : null;

//     // Handle QR Payload
//     if (navState && navState.qr) {
//       this.qrPayload = navState.qr;
//     } else {
//       this.qrPayload = {
//         dsId: this.dsId,
//         type: 'VOTER_AUTH',
//         timestamp: new Date().toISOString()
//       };
//     }

//     // Render QR Code immediately
//     this.generateQRCode();

//     // 2. Handle Employee Info
//     if (navState && navState.employee) {
//       // Data was passed from login page -> Show instantly
//       this.employeeInfo = navState.employee;
//       this.isLoading = false;
//     } else {
//       // Data missing (e.g. Refresh) -> Fetch from API
//       this.loadEmployeeInfo();
//     }
//   }

//   loadEmployeeInfo() {
//     this.isLoading = true;
//     this.hasError = false;

//     this.http.get(`${API_URL}/api/employee/${this.dsId}`)
//       .toPromise()
//       .then((response: any) => {
//         if (response) {
//           this.employeeInfo = response;
//         } else {
//           this.hasError = true;
//         }
//       })
//       .catch((error) => {
//         console.error('Error loading employee info:', error);
//         this.hasError = true;
//       })
//       .finally(() => {
//         this.isLoading = false;
//       });
//   }

//   retryLoad() {
//     this.loadEmployeeInfo();
//   }

//   async generateQRCode() {
//     if (!this.qrCanvas) return;
//     try {
//       const qrData = JSON.stringify(this.qrPayload);
//       await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
//         width: 300,
//         margin: 1,
//         color: { dark: '#000000', light: '#FFFFFF' },
//         errorCorrectionLevel: 'H'
//       });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     }
//   }

//   printQR() {
//     window.print();
//   }

//   verifyQR() {
//     this.router.navigate(['/verify-qr'], {
//       queryParams: { dsId: this.dsId }
//     });
//   }

//   handleImageError(event: any) {
//     event.target.src = 'https://ui-avatars.com/api/?name=' + (this.employeeInfo?.name || 'User') + '&background=random&color=fff';
//   }
// }


// // v1 qr-generator.component.ts
// import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle } from 'lucide-angular';
// import * as QRCode from 'qrcode';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-qr-generator',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   template: `
//     <div 
//       class="min-h-screen lg:h-screen lg:overflow-hidden text-white p-6 md:p-12 flex flex-col font-inter"
//       [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
//     >
//       <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
//         <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 lg:mb-10 gap-6 mt-4 flex-shrink-0">
//           <div class="flex flex-col items-center md:items-start text-center md:text-left">
//             <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
//               DATASOFT POPULARITY CONTEST
//             </h1>
//             <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
//               <p class="text-[#A1A1A1]">
//                 Vote Ends In
//                 <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
//               </p>
//               <p class="text-[#A1A1A1]">
//                 Date
//                 <span class="ml-1 text-white font-bold">15 January 2026</span>
//               </p>
//             </div>
//           </div>

//           <div class="flex items-center gap-4 mt-2 md:mt-0">
//             <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
//             <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
//           </div>
//         </header>

//         <div class="flex-1 max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-0">
          
//           <div class="text-center mb-6 flex-shrink-0">
//             <h2 class="text-[20px] font-bold text-white mb-2">QR Code Generated</h2>
//             <p class="text-[#A1A1A1]">Print this QR code and give it to the voter</p>
//           </div>

//           <div class="w-full bg-[#00000054] border border-[#3E3D45] rounded-xl p-8 shadow-[0px_4px_4px_0px_#00000040] backdrop-blur-sm">
            
//             <div class="bg-white rounded-xl p-8 mb-8">
//               <div class="flex flex-col items-center">
//                 <div class="mb-4">
//                   <lucide-icon [img]="icons.QrCode" [size]="32" class="text-[#25242D]"></lucide-icon>
//                 </div>
//                 <div class="relative max-w-full">
//                     <canvas #qrCanvas class="mb-4 max-h-[300px] w-auto"></canvas>
//                 </div>
//                 <p class="text-black text-sm font-bold">{{ dsId }}</p>
//               </div>
//             </div>

//             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <button
//                 (click)="printQR()"
//                 class="h-[50px] uppercase font-semibold text-[14px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 outline-none shadow-md transition-all duration-200 hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white flex items-center justify-center gap-2"
//               >
//                 <lucide-icon [img]="icons.Printer" [size]="18"></lucide-icon>
//                 <span>Print QR Code</span>
//               </button>

              
//             </div>

//           </div>

//           <div class="text-center mt-6 flex-shrink-0">
//             <a routerLink="/qr-login" class="text-[#529F2D] hover:text-[#5fb834] text-sm transition font-medium">
//               ← Generate Another QR Code
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     canvas {
//       max-width: 100%;
//       height: auto;
//     }

//     @media print {
//       body * {
//         visibility: hidden;
//       }
//       canvas, canvas * {
//         visibility: visible;
//       }
//       canvas {
//         position: absolute;
//         left: 50%;
//         top: 50%;
//         transform: translate(-50%, -50%);
//       }
//     }
//   `]
// })
// export class QrGeneratorComponent implements OnInit {
//   @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
//   readonly icons = { QrCode, Printer, ScanLine, CheckCircle };
  
//   // Header Vars
//   logoImg = '/dataSoft.svg';
//   timeLeft = "05:45:35";

//   dsId: string = '';
//   // Removed employeeInfo from UI but kept variable to prevent init errors if relied upon, 
//   // though strictly not needed for display anymore.
//   employeeInfo: any = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient
//   ) {}

//   async ngOnInit() {
//     this.dsId = this.route.snapshot.paramMap.get('dsId') || '';

//     // Accept server-provided QR payload from navigation state (preferred)
//     const navState: any = (history && history.state) ? history.state : null;
//     if (navState && navState.qr) {
//       // Use server-supplied canonical timestamp
//       this.qrPayload = navState.qr;
//     } else {
//       // Fallback: create local payload (not recommended)
//       this.qrPayload = {
//         dsId: this.dsId,
//         type: 'VOTER_AUTH',
//         timestamp: new Date().toISOString()
//       };
//     }

//     if (!this.dsId) {
//       this.router.navigate(['/qr-login']);
//       return;
//     }

//     await this.loadEmployeeInfo();
//     await this.generateQRCode();
//   }

//   // Add a class property
//   qrPayload: any = null;

//   async loadEmployeeInfo() {
//     try {
//       const response: any = await this.http.get(
//         `${API_URL}/api/employee/exists/${this.dsId}`
//       ).toPromise();
      
//       if (response.exists) {
//         this.employeeInfo = response;
//       }
//     } catch (error) {
//       console.error('Error loading employee info:', error);
//     }
//   }

//   async generateQRCode() {
//     try {
//       const qrData = JSON.stringify(this.qrPayload);

//       await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
//         width: 300,
//         margin: 2,
//         color: {
//           dark: '#000000',
//           light: '#FFFFFF'
//         }
//       });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     }
//   }

//   printQR() {
//     window.print();
//   }

//   verifyQR() {
//     this.router.navigate(['/verify-qr'], {
//       queryParams: { dsId: this.dsId }
//     });
//   }
// }

// main
// import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, QrCode, Printer, ScanLine, CheckCircle } from 'lucide-angular';
// import * as QRCode from 'qrcode';

// const API_URL = 'http://localhost:3000';

// @Component({
//   selector: 'app-qr-generator',
//   standalone: true,
//   imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
//   template: `
//     <div class="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4">
//       <div class="max-w-2xl w-full">
        
//         <!-- Header -->
//         <div class="text-center mb-8">
//           <h1 class="text-4xl font-bold text-white mb-2">QR Code Generated</h1>
//           <p class="text-gray-400">Print this QR code and give it to the voter</p>
//         </div>

//         <!-- Main Card -->
//         <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          
//           <!-- Employee Info -->
//           <div *ngIf="employeeInfo" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
//             <h3 class="text-lg font-semibold text-white mb-2">Employee Information</h3>
//             <div class="space-y-1 text-sm">
//               <p class="text-gray-300"><span class="text-gray-400">Name:</span> {{ employeeInfo.name }}</p>
//               <p class="text-gray-300"><span class="text-gray-400">DS ID:</span> {{ dsId }}</p>
//               <p class="text-gray-300"><span class="text-gray-400">Designation:</span> {{ employeeInfo.designation }}</p>
//             </div>
//           </div>

//           <!-- QR Code Display -->
//           <div class="bg-white rounded-2xl p-8 mb-6">
//             <div class="flex flex-col items-center">
//               <div class="mb-4">
//                 <lucide-icon [img]="icons.QrCode" [size]="32" class="text-indigo-600"></lucide-icon>
//               </div>
//               <canvas #qrCanvas class="mb-4"></canvas>
//               <p class="text-gray-600 text-sm font-medium">{{ dsId }}</p>
//             </div>
//           </div>

//           <!-- Action Buttons -->
//           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <button
//               (click)="printQR()"
//               class="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
//             >
//               <lucide-icon [img]="icons.Printer" [size]="20"></lucide-icon>
//               <span>Print QR Code</span>
//             </button>

//             <button
//               (click)="verifyQR()"
//               class="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
//             >
//               <lucide-icon [img]="icons.ScanLine" [size]="20"></lucide-icon>
//               <span>Verify QR Code</span>
//             </button>
//           </div>

//           <!-- Instructions -->
//           <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
//             <div class="flex items-start gap-3">
//               <lucide-icon [img]="icons.CheckCircle" [size]="20" class="text-yellow-400 flex-shrink-0 mt-0.5"></lucide-icon>
//               <div class="text-sm text-yellow-200">
//                 <p class="font-semibold mb-1">Next Steps:</p>
//                 <ol class="list-decimal list-inside space-y-1">
//                   <li>Print the QR code using the button above</li>
//                   <li>Give the printed QR code to the voter</li>
//                   <li>Click "Verify QR Code" to scan and authenticate</li>
//                 </ol>
//               </div>
//             </div>
//           </div>
//         </div>

//         <!-- Back Button -->
//         <div class="text-center mt-6">
//           <a routerLink="/qr-login" class="text-indigo-400 hover:text-indigo-300 text-sm transition">
//             ← Generate Another QR Code
//           </a>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     canvas {
//       max-width: 300px;
//       height: auto;
//     }

//     @media print {
//       body * {
//         visibility: hidden;
//       }
//       canvas, canvas * {
//         visibility: visible;
//       }
//       canvas {
//         position: absolute;
//         left: 50%;
//         top: 50%;
//         transform: translate(-50%, -50%);
//       }
//     }
//   `]
// })
// export class QrGeneratorComponent implements OnInit {
//   @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  
//   readonly icons = { QrCode, Printer, ScanLine, CheckCircle };
  
//   dsId: string = '';
//   employeeInfo: any = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private http: HttpClient
//   ) {}

//   async ngOnInit() {
//     this.dsId = this.route.snapshot.paramMap.get('dsId') || '';
    
//     if (!this.dsId) {
//       this.router.navigate(['/qr-login']);
//       return;
//     }

//     await this.loadEmployeeInfo();
//     await this.generateQRCode();
//   }

//   async loadEmployeeInfo() {
//     try {
//       const response: any = await this.http.get(
//         `${API_URL}/api/employee/exists/${this.dsId}`
//       ).toPromise();
      
//       if (response.exists) {
//         this.employeeInfo = response;
//       }
//     } catch (error) {
//       console.error('Error loading employee info:', error);
//     }
//   }

//   async generateQRCode() {
//     try {
//       // Generate QR code with the DS ID
//       // The QR code will contain a JSON string with authentication data
//       const qrData = JSON.stringify({
//         dsId: this.dsId,
//         type: 'VOTER_AUTH',
//         timestamp: new Date().toISOString()
//       });

//       await QRCode.toCanvas(this.qrCanvas.nativeElement, qrData, {
//         width: 300,
//         margin: 2,
//         color: {
//           dark: '#000000',
//           light: '#FFFFFF'
//         }
//       });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//     }
//   }

//   printQR() {
//     window.print();
//   }

//   verifyQR() {
//     this.router.navigate(['/verify-qr'], {
//       queryParams: { dsId: this.dsId }
//     });
//   }
// }