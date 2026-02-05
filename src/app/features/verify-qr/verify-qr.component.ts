import { Component, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { LucideAngularModule, Camera, Loader2, AlertCircle, X, CheckCircle } from 'lucide-angular';

// --- Shared Components ---
import { HeaderComponent } from '../../shared/components/header/header.component'; 
import { StepperComponent } from '../../shared/components/stepper/stepper.component';

@Component({
  selector: 'app-verify-qr',
  standalone: true,
  imports: [
    CommonModule, 
    ZXingScannerModule, 
    LucideAngularModule,
    HttpClientModule,
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
        <app-stepper [currentStep]="1"></app-stepper>

        <div class="flex-1 max-w-6xl mx-auto w-full mt-10 mb-10 font-inter flex items-center">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            <div class="h-[360px] bg-[#00000054] border border-[#3E3D45] rounded-xl flex flex-col items-center justify-center p-8 shadow-[0px_4px_4px_0px_#00000040]">
              
              <p *ngIf="!errorMessage && !successMessage" class="text-white text-[20px] text-center leading-relaxed max-w-[80%]">
                Please click the camera icon on the right to scan the QR Code provided to you.
              </p>
              
              <div *ngIf="errorMessage && !isLoading" class="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2">
                 <lucide-icon [img]="icons.AlertCircle" class="text-red-400 mt-1 flex-shrink-0" [size]="20"></lucide-icon>
                 <div class="flex flex-col gap-1">
                   <span class="text-red-100 text-sm font-semibold">{{ errorMessage }}</span>
                   <button 
                     (click)="clearError()" 
                     class="text-xs text-red-300 hover:text-red-100 underline text-left mt-2"
                   >
                     Try Again
                   </button>
                 </div>
              </div>

              <div *ngIf="successMessage" class="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2">
                 <lucide-icon [img]="icons.CheckCircle" class="text-green-400 flex-shrink-0" [size]="20"></lucide-icon>
                 <span class="text-green-100 text-sm font-semibold">{{ successMessage }}</span>
              </div>
            </div>

            <div class="h-[360px] bg-[#00000054] border border-[#3E3D45] rounded-xl overflow-hidden relative shadow-[0px_4px_4px_0px_#00000040] flex flex-col">
              
              <button 
                *ngIf="!cameraEnabled && !isLoading"
                (click)="enableCamera()"
                class="w-full h-full flex flex-col items-center justify-center p-8 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div class="mb-6 relative">
                   <div class="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                   <lucide-icon 
                     [img]="icons.Camera" 
                     class="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" 
                     [strokeWidth]="2">
                   </lucide-icon>
                </div>
                <p class="text-white text-[18px] text-center">
                  Tap to Scan QR Code
                </p>
              </button>

              <div *ngIf="isLoading" class="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/60 z-20">
                 <lucide-icon [img]="icons.Loader2" class="w-12 h-12 text-[#529F2D] animate-spin"></lucide-icon>
                 <p class="text-[#529F2D] font-bold tracking-wider animate-pulse">VERIFYING...</p>
              </div>

              <div *ngIf="cameraEnabled && !isLoading" class="relative w-full h-full bg-black">
                <zxing-scanner
                  #scanner
                  class="w-full h-full object-cover mirror-scan"
                  [formats]="allowedFormats"
                  [tryHarder]="true"
                  (scanSuccess)="onCodeResult($event)"
                  (permissionResponse)="onHasPermission($event)"
                  [enable]="cameraEnabled"
                ></zxing-scanner>

                <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                   <div class="w-48 h-48 border-2 border-[#529F2D] rounded-lg relative shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
                      <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#529F2D] -mt-1 -ml-1"></div>
                      <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#529F2D] -mt-1 -mr-1"></div>
                      <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#529F2D] -mb-1 -ml-1"></div>
                      <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#529F2D] -mb-1 -mr-1"></div>
                   </div>
                   <p class="mt-4 text-white font-bold text-shadow-sm z-10">Point camera at QR Code</p>
                </div>

                <button 
                  (click)="disableCamera()" 
                  class="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-20"
                  aria-label="Close camera"
                >
                  <lucide-icon [img]="icons.X" class="w-6 h-6"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto">
          <button
            (click)="onCancel()"
            class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
          >
            CANCEL
          </button>
          <div class="hidden md:block w-[200px]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep zxing-scanner video {
        object-fit: cover !important;
        width: 100% !important;
        height: 100% !important;
        transform: scaleX(-1); 
    }
  `]
})
export class VerifyQrComponent {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;
  
  readonly icons = { Camera, Loader2, AlertCircle, X, CheckCircle };

  cameraEnabled = false;
  allowedFormats = [ BarcodeFormat.QR_CODE ]; 
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  private isProcessing = false;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef // 1. INJECTED HERE
  ) {}

  enableCamera() {
    this.cameraEnabled = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
    this.isProcessing = false;
  }

  disableCamera() {
    this.cameraEnabled = false;
    this.isProcessing = false;
  }

  clearError() {
    this.errorMessage = '';
    this.enableCamera();
  }

  onCancel() {
    if (this.cameraEnabled) {
      this.disableCamera();
    } else {
      this.router.navigate(['/']);
    }
  }

  onHasPermission(has: boolean) {
    if (!has) {
      this.ngZone.run(() => {
        this.errorMessage = 'Camera permission denied. Please enable camera access.';
        this.cameraEnabled = false;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force update if permission denied
      });
    }
  }

  onCodeResult(resultString: string) {
    if (this.isProcessing || this.isLoading || !resultString) return;

    this.ngZone.run(() => {
        this.isProcessing = true;
        this.isLoading = true;
        this.cameraEnabled = false; 
        this.errorMessage = '';
        this.successMessage = '';
        
        // Force update to show loading state immediately
        this.cdr.detectChanges();

        console.log("📸 Scanned QR Code:", resultString);

        const payload = { scannedData: resultString };

        this.http.post<any>('http://localhost:3000/api/auth/qr-login', payload, { 
          withCredentials: true 
        })
        .subscribe({
          next: (res) => {
            console.log("✅ Login Success:", res);
            this.isLoading = false;
            this.successMessage = 'QR Code verified successfully!';
            this.cdr.detectChanges(); // Force update
            
            setTimeout(() => {
              this.router.navigate(['/step2']);
            }, 1000);
          },
          error: (err) => {
            console.error("❌ QR Login Error:", err);
            
            // 2. CRITICAL FIX: Ensure loading is off and View is updated
            this.isLoading = false;
            this.isProcessing = false;

            // Prioritize backend error message (for "Newer QR Code" logic)
            if (err.status === 410) {
                this.errorMessage = "QR Code has expired. Please request a new one.";
            } else if (err.status === 403) {
                this.errorMessage = "Invalid QR Code type.";
            } else if (err.status === 401) {
                // Shows the specific "newer QR code" message from backend
                this.errorMessage = err.error?.details || err.error?.error || "Invalid QR Code.";
            } else if (err.status === 0) {
                this.errorMessage = "Connection failed. Check your internet.";
            } else {
                this.errorMessage = err.error?.details || "Verification failed. Please try again.";
            }

            // 3. FORCE ANGULAR TO UPDATE UI
            this.cdr.detectChanges();
          }
        });
    });
  }
}





// import { Component, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
// import { BarcodeFormat } from '@zxing/library';
// import { LucideAngularModule, Camera, Loader2, AlertCircle, X, CheckCircle } from 'lucide-angular';

// // --- Shared Components ---
// import { HeaderComponent } from '../../shared/components/header/header.component'; 
// import { StepperComponent } from '../../shared/components/stepper/stepper.component';

// @Component({
//   selector: 'app-verify-qr',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     ZXingScannerModule, 
//     LucideAngularModule,
//     HttpClientModule,
//     HeaderComponent, 
//     StepperComponent
//   ], 
//   template: `
//     <div
//       class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
//       [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
//     >
//       <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
//         <app-header></app-header>

//         <app-stepper [currentStep]="1"></app-stepper>

//         <div class="flex-1 max-w-6xl mx-auto w-full mt-10 mb-10 font-inter flex items-center">
          
//           <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
//             <!-- Left Panel: Instructions & Error Display -->
//             <div class="h-[360px] bg-[#00000054] border border-[#3E3D45] rounded-xl flex flex-col items-center justify-center p-8 shadow-[0px_4px_4px_0px_#00000040]">
//               <p class="text-white text-[20px] text-center leading-relaxed max-w-[80%]">
//                 Please click the camera icon on the right to scan the QR Code provided to you.
//               </p>
              
//               <!-- Error Message Display -->
//               <div *ngIf="errorMessage && !isLoading" class="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 max-w-[90%]">
//                  <lucide-icon [img]="icons.AlertCircle" class="text-red-400 mt-1 flex-shrink-0" [size]="20"></lucide-icon>
//                  <div class="flex flex-col gap-1">
//                    <span class="text-red-100 text-sm font-semibold">{{ errorMessage }}</span>
//                    <button 
//                      (click)="clearError()" 
//                      class="text-xs text-red-300 hover:text-red-100 underline text-left mt-2"
//                    >
//                      Try Again
//                    </button>
//                  </div>
//               </div>

//               <!-- Success Message Display -->
//               <div *ngIf="successMessage" class="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 max-w-[90%]">
//                  <lucide-icon [img]="icons.CheckCircle" class="text-green-400 flex-shrink-0" [size]="20"></lucide-icon>
//                  <span class="text-green-100 text-sm font-semibold">{{ successMessage }}</span>
//               </div>
//             </div>

//             <!-- Right Panel: Camera Scanner -->
//             <div class="h-[360px] bg-[#00000054] border border-[#3E3D45] rounded-xl overflow-hidden relative shadow-[0px_4px_4px_0px_#00000040] flex flex-col">
              
//               <!-- Initial Camera Button -->
//               <button 
//                 *ngIf="!cameraEnabled && !isLoading"
//                 (click)="enableCamera()"
//                 class="w-full h-full flex flex-col items-center justify-center p-8 hover:bg-white/5 transition-colors cursor-pointer group"
//               >
//                 <div class="mb-6 relative">
//                    <div class="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
//                    <lucide-icon 
//                      [img]="icons.Camera" 
//                      class="w-20 h-20 text-white group-hover:scale-110 transition-transform duration-300" 
//                      [strokeWidth]="2">
//                    </lucide-icon>
//                 </div>
//                 <p class="text-white text-[18px] text-center">
//                   Tap to Scan QR Code
//                 </p>
//               </button>

//               <!-- Loading State -->
//               <div *ngIf="isLoading" class="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/60 z-20">
//                  <lucide-icon [img]="icons.Loader2" class="w-12 h-12 text-[#529F2D] animate-spin"></lucide-icon>
//                  <p class="text-[#529F2D] font-bold tracking-wider animate-pulse">VERIFYING...</p>
//               </div>

//               <!-- Camera Scanner View -->
//               <div *ngIf="cameraEnabled && !isLoading" class="relative w-full h-full bg-black">
                
//                 <zxing-scanner
//                   #scanner
//                   class="w-full h-full object-cover mirror-scan"
//                   [formats]="allowedFormats"
//                   [tryHarder]="true"
//                   (scanSuccess)="onCodeResult($event)"
//                   (permissionResponse)="onHasPermission($event)"
//                   [enable]="cameraEnabled"
//                 ></zxing-scanner>

//                 <!-- Scanning Overlay -->
//                 <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
//                    <div class="w-48 h-48 border-2 border-[#529F2D] rounded-lg relative shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
//                       <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#529F2D] -mt-1 -ml-1"></div>
//                       <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#529F2D] -mt-1 -mr-1"></div>
//                       <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#529F2D] -mb-1 -ml-1"></div>
//                       <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#529F2D] -mb-1 -mr-1"></div>
//                    </div>
//                    <p class="mt-4 text-white font-bold text-shadow-sm z-10">Point camera at QR Code</p>
//                 </div>

//                 <!-- Close Camera Button -->
//                 <button 
//                   (click)="disableCamera()" 
//                   class="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-20"
//                   aria-label="Close camera"
//                 >
//                   <lucide-icon [img]="icons.X" class="w-6 h-6"></lucide-icon>
//                 </button>

//               </div>
              
//             </div>

//           </div>

//         </div>

//         <!-- Bottom Navigation -->
//         <div class="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto w-full px-4 gap-4 mt-auto">
          
//           <button
//             (click)="onCancel()"
//             class="h-[60px] w-full md:w-[200px] uppercase font-semibold text-[18px] bg-gradient-to-r from-[#444249] to-[#222126] border-0 ring-0 outline-none shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#4f4c55] hover:to-[#2a2830] active:scale-95 cursor-pointer rounded-lg text-white"
//           >
//             CANCEL
//           </button>

//           <div class="hidden md:block w-[200px]"></div>

//         </div>

//       </div>
//     </div>
//   `,
//   styles: [`
//     /* Ensure scanner video fills container properly */
//     ::ng-deep zxing-scanner video {
//         object-fit: cover !important;
//         width: 100% !important;
//         height: 100% !important;
//         /* Mirror effect enabled */
//         transform: scaleX(-1); 
//     }
//   `]
// })
// export class VerifyQrComponent {
//   @ViewChild('scanner') scanner!: ZXingScannerComponent;
  
//   readonly icons = { Camera, Loader2, AlertCircle, X, CheckCircle };

//   cameraEnabled = false;
//   // ONLY scan QR codes
//   allowedFormats = [ BarcodeFormat.QR_CODE ]; 
//   errorMessage = '';
//   successMessage = '';
//   isLoading = false;
//   private isProcessing = false; // Prevent duplicate scans

//   constructor(
//     private http: HttpClient, 
//     private router: Router,
//     private ngZone: NgZone
//   ) {}

//   enableCamera() {
//     this.cameraEnabled = true;
//     this.errorMessage = '';
//     this.successMessage = '';
//     this.isLoading = false;
//     this.isProcessing = false;
//   }

//   disableCamera() {
//     this.cameraEnabled = false;
//     this.isProcessing = false;
//   }

//   clearError() {
//     this.errorMessage = '';
//     this.enableCamera();
//   }

//   onCancel() {
//     if (this.cameraEnabled) {
//       this.disableCamera();
//     } else {
//       this.router.navigate(['/']);
//     }
//   }

//   onHasPermission(has: boolean) {
//     if (!has) {
//       this.ngZone.run(() => {
//         this.errorMessage = 'Camera permission denied. Please enable camera access in your browser settings.';
//         this.cameraEnabled = false;
//         this.isLoading = false;
//       });
//     }
//   }

//   onCodeResult(resultString: string) {
//     // Prevent duplicate processing
//     if (this.isProcessing || this.isLoading || !resultString) return;

//     this.ngZone.run(() => {
//         this.isProcessing = true;
//         this.isLoading = true;
//         this.cameraEnabled = false; // Stop camera immediately on scan
//         this.errorMessage = '';
//         this.successMessage = '';

//         console.log("📸 Scanned QR Code:", resultString);

//         const payload = { scannedData: resultString };

//         this.http.post<any>('http://localhost:3000/api/auth/qr-login', payload, { 
//           withCredentials: true 
//         })
//         .subscribe({
//           next: (res) => {
//             console.log("✅ Login Success:", res);
//             this.isLoading = false;
//             this.successMessage = 'QR Code verified successfully! Redirecting...';
            
//             // Navigate after a brief delay to show success message
//             setTimeout(() => {
//               this.router.navigate(['/step2']);
//             }, 1000);
//           },
//           error: (err) => {
//             console.error("❌ QR Login Error:", err);
//             this.isLoading = false;
//             this.isProcessing = false;
            
//             // Detailed Error Handling based on HTTP status codes
//             if (err.status === 410) {
//                 // Token expired
//                 this.errorMessage = "QR Code has expired. Please request a new QR Code from the administrator.";
//             } else if (err.status === 403) {
//                 // Invalid QR type (security alert)
//                 this.errorMessage = "Invalid QR Code type detected. This QR Code is not authorized for voter login.";
//             } else if (err.status === 401) {
//                 // Invalid or corrupt token
//                 this.errorMessage = err.error?.details || err.error?.error || "Invalid or corrupted QR Code. Please ensure you're scanning a valid voter QR Code.";
//             } else if (err.status === 400) {
//                 // Bad request / malformed data
//                 this.errorMessage = err.error?.error || "Unable to read QR Code. Please try scanning again.";
//             } else if (err.status === 0) {
//                 // Network error / server unreachable
//                 this.errorMessage = "Unable to connect to server. Please check your internet connection.";
//             } else {
//                 // Generic error with fallback
//                 this.errorMessage = err.error?.error || err.error?.details || "Verification failed. Please try again or contact support.";
//             }
//           }
//         });
//     });
//   }
// }








// //main feb5
// import { Component, ViewChild,ChangeDetectorRef,NgZone } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
// import { BarcodeFormat } from '@zxing/library';

// @Component({
//   selector: 'app-verify-qr',
//   standalone: true,
//   imports: [CommonModule, ZXingScannerModule], 
//   template: `
//     <div class="scan-container">
//       <h2>Scan Your Voter QR</h2>
      
//       <div *ngIf="!cameraEnabled" class="start-section">
//         <p>Please enable your camera to scan your access code.</p>
//         <button (click)="enableCamera()" class="btn-start">Start Camera</button>
//       </div>

//       <div *ngIf="cameraEnabled" class="camera-wrapper">
//         <zxing-scanner
//           #scanner
//           class="mirror-scan" 
//           [formats]="allowedFormats"
//           [tryHarder]="true"
//           (scanSuccess)="onCodeResult($event)"
//           (permissionResponse)="onHasPermission($event)"
//           [enable]="cameraEnabled">
//         </zxing-scanner>
        
//         <div class="overlay">
//           <div class="scan-box"></div>
//           <p class="instruction">Point camera at QR Code</p>
//         </div>

//         <button (click)="disableCamera()" class="btn-cancel">Stop Camera</button>
//       </div>

//       <div *ngIf="isLoading" class="loading-overlay">
//         <div class="spinner"></div>
//         <p>Verifying Code...</p>
//       </div>
      
//       <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
//     </div>
//   `,
//   styles: [`
//     .scan-container { text-align: center; max-width: 600px; margin: 0 auto; padding: 20px; }
    
//     /* MIRROR EFFECT: This flips the camera horizontally */
//     ::ng-deep zxing-scanner video {
//         transform: scaleX(-1); 
//         object-fit: cover;
//     }

//     .camera-wrapper { 
//         position: relative; 
//         background: #000; 
//         border-radius: 8px; 
//         overflow: hidden;
//         min-height: 300px;
//     }

//     /* VISUAL GUIDE BOX */
//     .overlay {
//         position: absolute; top: 0; left: 0; width: 100%; height: 100%;
//         pointer-events: none;
//         display: flex; flex-direction: column; justify-content: center; align-items: center;
//     }
//     .scan-box {
//         width: 200px; height: 200px;
//         border: 4px solid rgba(0, 255, 0, 0.6);
//         border-radius: 10px;
//         box-shadow: 0 0 0 1000px rgba(0,0,0,0.5); /* Dim the outside area */
//     }
//     .instruction { color: white; margin-top: 10px; font-weight: bold; text-shadow: 0 1px 2px black; }

//     .btn-start { background: #007bff; color: white; padding: 15px 30px; font-size: 1.2rem; border: none; border-radius: 5px; cursor: pointer; }
//     .btn-cancel { position: relative; z-index: 10; margin: 10px; background: #dc3545; color: white; padding: 8px 16px; border: none; cursor: pointer;}
    
//     .error { color: red; font-weight: bold; margin-top: 15px; background: #ffe6e6; padding: 10px; border-radius: 4px; }
    
//     .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; }
//     .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
//     @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//   `]
// })
// export class VerifyQrComponent {
//   @ViewChild('scanner') scanner!: ZXingScannerComponent;
  
//   cameraEnabled = false;
//   // ONLY scan QR codes (Scanning ALL formats slows it down drastically)
//   allowedFormats = [ BarcodeFormat.QR_CODE ]; 
//   errorMessage = '';
//   isLoading = false;

//   constructor(private http: HttpClient, private router: Router,private ngZone: NgZone) {}

//   enableCamera() {
//     this.cameraEnabled = true;
//     this.errorMessage = '';
//     this.isLoading = false;
//   }

//   disableCamera() {
//     this.cameraEnabled = false;
//   }

//   onHasPermission(has: boolean) {
//     if (!has) {
//       this.errorMessage = 'Camera permission denied.';
//       this.cameraEnabled = false;
//     }
//   }

//   onCodeResult(resultString: string) {
//     if (this.isLoading || !resultString) return;

//     this.ngZone.run(() => {
//         this.isLoading = true;
//         this.cameraEnabled = false; 

//         console.log("📸 Scanned:", resultString);

//         const payload = { scannedData: resultString };

//         this.http.post<any>('http://localhost:3000/api/auth/qr-login', payload, { 
//           withCredentials: true 
//         })
//         .subscribe({
//           next: (res) => {
//             console.log("Login Success");
//             this.router.navigate(['/step2']); 
//           },
//           error: (err) => {
//             this.isLoading = false;
            
//             // TASK 5: Better Error Handling
//             if (err.status === 410) {
//                  this.errorMessage = "❌ This QR Code has EXPIRED (30m limit).";
//             } else if (err.status === 403) {
//                  this.errorMessage = "❌ Invalid QR Type (Security Alert).";
//             } else {
//                  this.errorMessage = err.error?.error || '❌ Invalid QR. Please try again.';
//             }
//           }
//         });
//     });
//   }
// }






// //main
// import { Component, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
// import { BarcodeFormat } from '@zxing/library';

// @Component({
//   selector: 'app-verify-qr',
//   standalone: true,
//   imports: [CommonModule, ZXingScannerModule], 
//   template: `
//     <div class="scan-container">
//       <h2>Scan Your Voter QR</h2>
      
//       <div *ngIf="!cameraEnabled" class="start-section">
//         <p>Please enable your camera to scan your access code.</p>
//         <button (click)="enableCamera()" class="btn-start">Start Camera</button>
//       </div>

//       <div *ngIf="cameraEnabled" class="camera-wrapper">
//         <zxing-scanner
//           #scanner
//           class="mirror-scan" 
//           [formats]="allowedFormats"
//           [tryHarder]="true"
//           (scanSuccess)="onCodeResult($event)"
//           (permissionResponse)="onHasPermission($event)"
//           [enable]="cameraEnabled">
//         </zxing-scanner>
        
//         <div class="overlay">
//           <div class="scan-box"></div>
//           <p class="instruction">Point camera at QR Code</p>
//         </div>

//         <button (click)="disableCamera()" class="btn-cancel">Stop Camera</button>
//       </div>

//       <div *ngIf="isLoading" class="loading-overlay">
//         <div class="spinner"></div>
//         <p>Verifying Code...</p>
//       </div>
      
//       <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
//     </div>
//   `,
//   styles: [`
//     .scan-container { text-align: center; max-width: 600px; margin: 0 auto; padding: 20px; }
    
//     /* MIRROR EFFECT: This flips the camera horizontally */
//     ::ng-deep zxing-scanner video {
//         transform: scaleX(-1); 
//         object-fit: cover;
//     }

//     .camera-wrapper { 
//         position: relative; 
//         background: #000; 
//         border-radius: 8px; 
//         overflow: hidden;
//         min-height: 300px;
//     }

//     /* VISUAL GUIDE BOX */
//     .overlay {
//         position: absolute; top: 0; left: 0; width: 100%; height: 100%;
//         pointer-events: none;
//         display: flex; flex-direction: column; justify-content: center; align-items: center;
//     }
//     .scan-box {
//         width: 200px; height: 200px;
//         border: 4px solid rgba(0, 255, 0, 0.6);
//         border-radius: 10px;
//         box-shadow: 0 0 0 1000px rgba(0,0,0,0.5); /* Dim the outside area */
//     }
//     .instruction { color: white; margin-top: 10px; font-weight: bold; text-shadow: 0 1px 2px black; }

//     .btn-start { background: #007bff; color: white; padding: 15px 30px; font-size: 1.2rem; border: none; border-radius: 5px; cursor: pointer; }
//     .btn-cancel { position: relative; z-index: 10; margin: 10px; background: #dc3545; color: white; padding: 8px 16px; border: none; cursor: pointer;}
    
//     .error { color: red; font-weight: bold; margin-top: 15px; background: #ffe6e6; padding: 10px; border-radius: 4px; }
    
//     .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; }
//     .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
//     @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//   `]
// })
// export class VerifyQrComponent {
//   @ViewChild('scanner') scanner!: ZXingScannerComponent;
  
//   cameraEnabled = false;
//   // ONLY scan QR codes (Scanning ALL formats slows it down drastically)
//   allowedFormats = [ BarcodeFormat.QR_CODE ]; 
//   errorMessage = '';
//   isLoading = false;

//   constructor(private http: HttpClient, private router: Router) {}

//   enableCamera() {
//     this.cameraEnabled = true;
//     this.errorMessage = '';
//     this.isLoading = false;
//   }

//   disableCamera() {
//     this.cameraEnabled = false;
//   }

//   onHasPermission(has: boolean) {
//     if (!has) {
//       this.errorMessage = 'Camera permission denied.';
//       this.cameraEnabled = false;
//     }
//   }

//   onCodeResult(resultString: string) {
//     // Prevent multiple triggers
//     if (this.isLoading || !resultString) return;

//     this.isLoading = true;
//     this.cameraEnabled = false; // Stop camera immediately on success

//     console.log("📸 Scanned:", resultString);

//     const payload = { scannedData: resultString };

//     this.http.post<any>('http://localhost:3000/api/auth/qr-login', payload, { 
//       withCredentials: true 
//     })
//     .subscribe({
//       next: (res) => {
//         console.log("Login Success");
//         this.router.navigate(['/step2']); 
//       },
//       error: (err) => {
//         this.isLoading = false;
//         // Don't restart camera automatically, let user read error first
//         this.errorMessage = err.error?.error || 'Invalid QR. Please try again.';
//       }
//     });
//   }
// }