
//main
import { Component, ViewChild,ChangeDetectorRef,NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-verify-qr',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule], 
  template: `
    <div class="scan-container">
      <h2>Scan Your Voter QR</h2>
      
      <div *ngIf="!cameraEnabled" class="start-section">
        <p>Please enable your camera to scan your access code.</p>
        <button (click)="enableCamera()" class="btn-start">Start Camera</button>
      </div>

      <div *ngIf="cameraEnabled" class="camera-wrapper">
        <zxing-scanner
          #scanner
          class="mirror-scan" 
          [formats]="allowedFormats"
          [tryHarder]="true"
          (scanSuccess)="onCodeResult($event)"
          (permissionResponse)="onHasPermission($event)"
          [enable]="cameraEnabled">
        </zxing-scanner>
        
        <div class="overlay">
          <div class="scan-box"></div>
          <p class="instruction">Point camera at QR Code</p>
        </div>

        <button (click)="disableCamera()" class="btn-cancel">Stop Camera</button>
      </div>

      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Verifying Code...</p>
      </div>
      
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .scan-container { text-align: center; max-width: 600px; margin: 0 auto; padding: 20px; }
    
    /* MIRROR EFFECT: This flips the camera horizontally */
    ::ng-deep zxing-scanner video {
        transform: scaleX(-1); 
        object-fit: cover;
    }

    .camera-wrapper { 
        position: relative; 
        background: #000; 
        border-radius: 8px; 
        overflow: hidden;
        min-height: 300px;
    }

    /* VISUAL GUIDE BOX */
    .overlay {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
    }
    .scan-box {
        width: 200px; height: 200px;
        border: 4px solid rgba(0, 255, 0, 0.6);
        border-radius: 10px;
        box-shadow: 0 0 0 1000px rgba(0,0,0,0.5); /* Dim the outside area */
    }
    .instruction { color: white; margin-top: 10px; font-weight: bold; text-shadow: 0 1px 2px black; }

    .btn-start { background: #007bff; color: white; padding: 15px 30px; font-size: 1.2rem; border: none; border-radius: 5px; cursor: pointer; }
    .btn-cancel { position: relative; z-index: 10; margin: 10px; background: #dc3545; color: white; padding: 8px 16px; border: none; cursor: pointer;}
    
    .error { color: red; font-weight: bold; margin-top: 15px; background: #ffe6e6; padding: 10px; border-radius: 4px; }
    
    .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 10px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class VerifyQrComponent {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;
  
  cameraEnabled = false;
  // ONLY scan QR codes (Scanning ALL formats slows it down drastically)
  allowedFormats = [ BarcodeFormat.QR_CODE ]; 
  errorMessage = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router,private ngZone: NgZone) {}

  enableCamera() {
    this.cameraEnabled = true;
    this.errorMessage = '';
    this.isLoading = false;
  }

  disableCamera() {
    this.cameraEnabled = false;
  }

  onHasPermission(has: boolean) {
    if (!has) {
      this.errorMessage = 'Camera permission denied.';
      this.cameraEnabled = false;
    }
  }

  onCodeResult(resultString: string) {
    if (this.isLoading || !resultString) return;

    this.ngZone.run(() => {
        this.isLoading = true;
        this.cameraEnabled = false; 

        console.log("📸 Scanned:", resultString);

        const payload = { scannedData: resultString };

        this.http.post<any>('http://localhost:3000/api/auth/qr-login', payload, { 
          withCredentials: true 
        })
        .subscribe({
          next: (res) => {
            console.log("Login Success");
            this.router.navigate(['/step2']); 
          },
          error: (err) => {
            this.isLoading = false;
            
            // TASK 5: Better Error Handling
            if (err.status === 410) {
                 this.errorMessage = "❌ This QR Code has EXPIRED (30m limit).";
            } else if (err.status === 403) {
                 this.errorMessage = "❌ Invalid QR Type (Security Alert).";
            } else {
                 this.errorMessage = err.error?.error || '❌ Invalid QR. Please try again.';
            }
          }
        });
    });
  }
}


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