// verify-qr.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Camera, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-angular';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Result } from '@zxing/library';

const API_URL = 'http://localhost:3000';

@Component({
  selector: 'app-verify-qr',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HttpClientModule],
  template: `
    <div 
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 lg:mb-10 gap-6 mt-4 flex-shrink-0">
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
              DATASOFT POPULARITY CONTEST
            </h1>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
              <p class="text-[#A1A1A1]">
                Status:
                <span class="ml-1 text-[#86EFAC] font-inter font-bold">
                  Voting Booth Ready
                </span>
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

        <!-- Main Content -->
        <div class="flex-1 max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-0">
          
          <!-- Title Section -->
          <div class="text-center mb-6 flex-shrink-0">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-[#529F2D] rounded-full mb-4 shadow-lg shadow-[#529F2D]/20">
              <lucide-icon [img]="icons.Camera" [size]="32" class="text-white"></lucide-icon>
            </div>
            <h2 class="text-[20px] font-bold text-white mb-2">Scan Voter QR Code</h2>
            <p class="text-[#A1A1A1]">Position the QR code in front of the camera</p>
          </div>

          <!-- Scanner Card -->
          <div class="w-full bg-[#00000054] border border-[#3E3D45] rounded-xl p-8 shadow-[0px_4px_4px_0px_#00000040] backdrop-blur-sm">
            
            <!-- Status Message -->
            <div *ngIf="statusMessage" class="mb-6">
              <div 
                [class]="getStatusClass()"
                class="p-4 border rounded-lg flex items-start gap-3"
              >
                <lucide-icon 
                  [img]="getStatusIcon()" 
                  [size]="20" 
                  [class]="getStatusIconClass()"
                  class="flex-shrink-0 mt-0.5"
                ></lucide-icon>
                <div class="flex-1">
                  <p [class]="getStatusTextClass()" class="text-sm">
                    {{ statusMessage }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Start Button (When Not Scanning) -->
            <div *ngIf="!isScanning" class="text-center py-12 bg-[#25242D]/50 rounded-lg border border-[#3E3D45] border-dashed">
              <button
                (click)="startScanning()"
                [disabled]="isProcessing"
                class="h-[60px] px-8 bg-gradient-to-r from-[#529F2D] to-[#1D3910] hover:from-[#5fb834] hover:to-[#234715] disabled:from-[#444249] disabled:to-[#222126] disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase font-bold text-[16px] rounded-lg transition shadow-md flex items-center justify-center gap-3 mx-auto"
              >
                <lucide-icon [img]="icons.Camera" [size]="20"></lucide-icon>
                <span>Start Camera Scanner</span>
              </button>
              <p class="text-[#A1A1A1] text-sm mt-4">
                Click to activate your camera
              </p>
            </div>

            <!-- Camera View (When Scanning) -->
            <div *ngIf="isScanning" class="space-y-4">
              <div class="relative bg-black rounded-lg overflow-hidden border border-[#3E3D45] max-h-[40vh] md:max-h-[400px]" style="aspect-ratio: 4/3; margin: 0 auto;">
                <video #videoElement class="w-full h-full object-cover" playsinline autoplay></video>
                
                <!-- Scanner Overlay -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-48 h-48 md:w-56 md:h-56 border-2 border-[#529F2D]/50 rounded-lg relative bg-[#529F2D]/5">
                    <!-- Corner Markers -->
                    <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#529F2D]"></div>
                    <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#529F2D]"></div>
                    <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#529F2D]"></div>
                    <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#529F2D]"></div>
                    <!-- Scanning Line -->
                    <div class="absolute top-0 left-0 w-full h-1 bg-[#529F2D]/80 shadow-[0_0_10px_#529F2D] animate-scan"></div>
                  </div>
                </div>
              </div>

              <!-- Stop Button -->
              <button
                (click)="stopScanning()"
                class="w-full h-[50px] bg-gradient-to-r from-[#444249] to-[#222126] hover:from-[#4f4c55] hover:to-[#2a2830] text-white uppercase font-semibold text-[14px] rounded-lg transition shadow-md"
              >
                Stop Scanning
              </button>
            </div>

          </div>

          <!-- Back Link -->
          <div class="text-center mt-6 flex-shrink-0">
            <a routerLink="/" class="text-[#529F2D] hover:text-[#5fb834] text-sm transition font-medium">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    video { 
      transform: scaleX(-1); 
    }
    
    .animate-spin { 
      animation: spin 1s linear infinite; 
    }
    
    .animate-scan { 
      animation: scan 2s linear infinite; 
    }
    
    @keyframes spin { 
      from { transform: rotate(0deg); } 
      to { transform: rotate(360deg); } 
    }
    
    @keyframes scan { 
      0% { top: 0%; opacity: 0; } 
      10% { opacity: 1; } 
      90% { opacity: 1; } 
      100% { top: 100%; opacity: 0; } 
    }
  `]
})
export class VerifyQrComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  readonly icons = { Camera, CheckCircle, XCircle, Loader2, AlertTriangle };
  logoImg = '/dataSoft.svg';
  
  currentDate: string = '';
  
  isScanning: boolean = false;
  isProcessing: boolean = false;
  statusMessage: string = '';
  statusType: 'success' | 'error' | 'info' | 'expired' = 'info';
  
  private codeReader: BrowserQRCodeReader;
  private selectedDeviceId: string | undefined;
  private scanningControls: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.codeReader = new BrowserQRCodeReader();
  }

  async ngOnInit() {
    // Set current date
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // Load available cameras
    try {
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length > 0) {
        this.selectedDeviceId = videoInputDevices[0].deviceId;
        console.log('✅ Camera devices found:', videoInputDevices.length);
      } else {
        console.warn('⚠️ No camera devices found');
        this.statusMessage = 'No camera detected. Please connect a camera and refresh the page.';
        this.statusType = 'error';
      }
    } catch (error) {
      console.error('❌ Error getting video devices:', error);
      this.statusMessage = 'Failed to access camera devices. Please check permissions.';
      this.statusType = 'error';
    }
  }

  ngOnDestroy() {
    this.stopScanning();
  }

  async startScanning() {
    this.statusMessage = '';
    
    try {
      this.isScanning = true;
      this.statusMessage = 'Initializing camera...';
      this.statusType = 'info';
      this.cdr.detectChanges();

      // Small delay to ensure UI updates
      setTimeout(async () => {
        try {
          this.statusMessage = 'Camera ready. Position QR code in the frame.';
          this.statusType = 'info';
          await this.scanContinuously();
        } catch (error) {
          console.error('❌ Camera error:', error);
          this.statusMessage = 'Failed to access camera. Please check permissions.';
          this.statusType = 'error';
          this.isScanning = false;
        }
        this.cdr.detectChanges();
      }, 100);

    } catch (error) {
      console.error('❌ Scanner initialization error:', error);
      this.statusMessage = 'Failed to initialize scanner';
      this.statusType = 'error';
      this.isScanning = false;
    }
  }

  private async scanContinuously() {
    if (!this.isScanning) return;

    try {
      this.scanningControls = await this.codeReader.decodeFromVideoDevice(
        this.selectedDeviceId,
        this.videoElement.nativeElement,
        (result: Result | undefined, error: any) => {
          if (result) {
            const qrData = result.getText();
            console.log('📱 QR Code detected:', qrData.substring(0, 50) + '...');
            this.handleQRCodeDetected(qrData);
          }
          // Silently ignore decode errors (happens during normal scanning)
        }
      );
    } catch (error) {
      console.error('❌ Scanning error:', error);
      if (this.isScanning) {
        this.statusMessage = 'Camera error. Please try again.';
        this.statusType = 'error';
        this.stopScanning();
      }
    }
  }

  async handleQRCodeDetected(qrData: string) {
    // Prevent multiple simultaneous validations
    if (this.isProcessing) {
      console.log('⏸️ Already processing a QR code, ignoring...');
      return;
    }

    this.isProcessing = true;
    this.statusMessage = 'QR Code detected! Verifying...';
    this.statusType = 'info';
    this.cdr.detectChanges();

    try {
      console.log('🔐 Parsing QR data...');
      const data = JSON.parse(qrData);
      
      // Validate QR data structure
      if (data.type !== 'VOTER_AUTH' || !data.token) {
        console.error('❌ Invalid QR format:', data);
        throw new Error('Invalid QR code format. Please use a QR code generated by the system.');
      }

      console.log('✅ QR format valid');
      console.log('📤 Sending validation request to server...');

      // Send validation request to server
      const response: any = await this.http.post(
        `${API_URL}/api/voter/qr-validate`,
        { 
          token: data.token,
          voterId: data.voterId,
          tenantId: data.tenantId
        },
        { withCredentials: true }
      ).toPromise();

      console.log('📥 Server response:', response);

      if (response.success && response.voter) {
        // Stop scanning immediately
        this.stopScanning();
        
        this.statusMessage = `✓ Authentication successful! Welcome ${response.voter.voterId}`;
        this.statusType = 'success';
        this.cdr.detectChanges();
        
        console.log('✅ Validation successful, navigating to step2...');
        
        // Navigate to step2 after short delay
        setTimeout(() => {
          this.router.navigate(['/step2']);
        }, 1500);
      } else {
        throw new Error(response.message || 'Authentication failed');
      }

    } catch (error: any) {
      console.error('❌ QR verification error:', error);
      
      // Stop scanning on error
      this.stopScanning();
      this.isProcessing = false;

      // Handle different error types
      const status = error.status;
      const errorMessage = error.error?.error || error.error?.message;

      if (status === 400) {
        if (errorMessage?.includes('expired')) {
          this.statusMessage = 'QR code has expired. Please generate a new one from the moderator.';
          this.statusType = 'expired';
        } else if (errorMessage?.includes('invalidated')) {
          this.statusMessage = 'This QR code has been invalidated. Please generate a new one.';
          this.statusType = 'expired';
        } else {
          this.statusMessage = errorMessage || 'Invalid QR code.';
          this.statusType = 'error';
        }
      } else if (status === 404) {
        this.statusMessage = 'Voter not found in the system.';
        this.statusType = 'error';
      } else if (status === 403) {
        this.statusMessage = 'Access denied. Your organization may be suspended.';
        this.statusType = 'error';
      } else if (status === 0) {
        this.statusMessage = 'Network error. Cannot reach server.';
        this.statusType = 'error';
      } else {
        this.statusMessage = error.message || errorMessage || 'Invalid QR code. Please try again.';
        this.statusType = 'error';
      }
      
      this.cdr.detectChanges();
      
      // Allow retry after 3 seconds
      setTimeout(() => {
        this.statusMessage = 'Ready to scan. Click "Start Camera Scanner" to try again.';
        this.statusType = 'info';
        this.cdr.detectChanges();
      }, 3000);
    }
  }

  stopScanning() {
    this.isScanning = false;
    this.isProcessing = false;
    
    try {
      if (this.scanningControls) {
        this.scanningControls.stop();
        this.scanningControls = null;
      }
    } catch (e) {
      console.warn('⚠️ Error stopping scanner controls:', e);
    }
    
    this.cdr.detectChanges();
  }

  // Helper methods for dynamic styling
  getStatusClass(): string {
    switch (this.statusType) {
      case 'success': return 'bg-[#529F2D]/20 border-[#529F2D]/50';
      case 'error': return 'bg-red-500/20 border-red-500/50';
      case 'expired': return 'bg-yellow-500/20 border-yellow-500/50';
      default: return 'bg-[#444249] border-[#707070]';
    }
  }

  getStatusIcon(): any {
    switch (this.statusType) {
      case 'success': return this.icons.CheckCircle;
      case 'error': return this.icons.XCircle;
      case 'expired': return this.icons.AlertTriangle;
      default: return this.icons.Loader2;
    }
  }

  getStatusIconClass(): string {
    switch (this.statusType) {
      case 'success': return 'text-[#529F2D]';
      case 'error': return 'text-red-400';
      case 'expired': return 'text-yellow-400';
      default: return 'text-white animate-spin';
    }
  }

  getStatusTextClass(): string {
    switch (this.statusType) {
      case 'success': return 'text-white';
      case 'error': return 'text-red-200';
      case 'expired': return 'text-yellow-200';
      default: return 'text-[#A1A1A1]';
    }
  }
}