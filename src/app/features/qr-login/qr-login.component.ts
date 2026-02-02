// qr-login.component.ts
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, QrCode, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Lock, User, Mail, Phone, MapPin, Printer, RefreshCw } from 'lucide-angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const API_URL = 'http://localhost:3000';

interface VoterInfo {
  voterId: string;
  tenantId: string;
  profileJson: string;
  hasVoted: boolean;
  parsedProfile?: any;
}

interface QRResponse {
  success: boolean;
  voter: VoterInfo;
  qrCodeData: string;
  expiresAt: string;
  message?: string;
}

@Component({
  selector: 'app-qr-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, HttpClientModule],
  template: `
    <div
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #36343b 0%, #1e1d24 100%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <!-- Header -->
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
            <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
          </div>
        </header>

        <!-- Main Content -->
        <div class="w-full flex-1">
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Left Side - Input & Voter Info -->
            <div class="space-y-6">
              
              <h2 class="text-[#EC9D37] text-xl font-bold">Generate Voter QR Code</h2>

              <!-- Input Form -->
              <div class="w-full">
                <label class="block text-white text-base mb-2">
                  Enter Voter ID
                </label>

                <form (ngSubmit)="generateQR()" class="flex flex-col gap-4 w-full">
                  
                  <div class="w-full flex flex-col">
                    
                    <div class="relative w-full">
                      <input
                        type="text"
                        [(ngModel)]="voterId"
                        name="voterId"
                        placeholder="Enter Voter ID"
                        class="w-full h-[56px] px-4 bg-[#EAF0F6] border border-transparent rounded-md text-[#1a1a1a] placeholder-[#707070] focus:outline-none focus:border-[#EC9D37] focus:ring-2 focus:ring-[#EC9D37]/50 transition-all font-inter text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        [disabled]="isLoading"
                        (input)="clearErrors()"
                        required
                      />
                    </div>

                    <!-- Error Messages -->
                    <div class="mt-3 min-h-[24px]">
                      <div *ngIf="errorMessage" class="flex items-center gap-2 text-[#ff6b6b] animate-fade-in">
                        <lucide-icon [img]="icons.AlertCircle" [size]="18"></lucide-icon>
                        <span class="text-sm font-medium">{{ errorMessage }}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    [disabled]="isLoading || !voterId"
                    class="h-[56px] w-full px-8 bg-[#E77E22] hover:bg-[#d9721a] active:bg-[#c56616] text-white text-lg font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap shadow-lg"
                  >
                    <span *ngIf="!isLoading">Generate QR Code</span>
                    <span *ngIf="isLoading" class="text-base">Processing...</span>
                  </button>

                </form>
              </div>

              <!-- Voter Information Card -->
              <div *ngIf="voterInfo" class="bg-[#2a2833] border border-[#3d3a47] rounded-lg p-6 space-y-4 animate-fade-in">
                <div class="flex items-center gap-3 mb-4">
                  <lucide-icon [img]="icons.User" [size]="24" class="text-[#EC9D37]"></lucide-icon>
                  <h3 class="text-xl font-bold text-white">Voter Information</h3>
                </div>

                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <lucide-icon [img]="icons.ShieldCheck" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Voter ID</p>
                      <p class="text-white font-medium">{{ voterInfo.voterId }}</p>
                    </div>
                  </div>

                  <div *ngIf="voterInfo.parsedProfile?.name" class="flex items-start gap-3">
                    <lucide-icon [img]="icons.User" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Name</p>
                      <p class="text-white font-medium">{{ voterInfo.parsedProfile.name }}</p>
                    </div>
                  </div>

                  <div *ngIf="voterInfo.parsedProfile?.email" class="flex items-start gap-3">
                    <lucide-icon [img]="icons.Mail" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Email</p>
                      <p class="text-white font-medium">{{ voterInfo.parsedProfile.email }}</p>
                    </div>
                  </div>

                  <div *ngIf="voterInfo.parsedProfile?.phone" class="flex items-start gap-3">
                    <lucide-icon [img]="icons.Phone" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Phone</p>
                      <p class="text-white font-medium">{{ voterInfo.parsedProfile.phone }}</p>
                    </div>
                  </div>

                  <div *ngIf="voterInfo.parsedProfile?.department" class="flex items-start gap-3">
                    <lucide-icon [img]="icons.MapPin" [size]="18" class="text-[#A1A1A1] mt-1"></lucide-icon>
                    <div>
                      <p class="text-[#A1A1A1] text-sm">Department</p>
                      <p class="text-white font-medium">{{ voterInfo.parsedProfile.department }}</p>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-[#3d3a47]">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" [class]="voterInfo.hasVoted ? 'bg-green-500' : 'bg-yellow-500'"></div>
                      <p class="text-sm" [class]="voterInfo.hasVoted ? 'text-green-400' : 'text-yellow-400'">
                        {{ voterInfo.hasVoted ? 'Already Voted' : 'Not Voted Yet' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Side - QR Code Display -->
            <div class="space-y-6">
              
              <div *ngIf="qrCodeData" class="bg-[#2a2833] border border-[#3d3a47] rounded-lg p-8 space-y-6 animate-fade-in">
                
                <div class="flex items-center gap-3 mb-4">
                  <lucide-icon [img]="icons.QrCode" [size]="24" class="text-[#EC9D37]"></lucide-icon>
                  <h3 class="text-xl font-bold text-white">QR Code</h3>
                </div>

                <!-- QR Code Image -->
                <div class="flex justify-center items-center bg-white p-8 rounded-lg">
                  <img 
                    [src]="qrCodeData" 
                    alt="Voter QR Code"
                    class="w-full max-w-[300px] h-auto"
                  />
                </div>

                <!-- QR Info -->
                <div class="space-y-2 text-center">
                  <p class="text-[#A1A1A1] text-sm">
                    QR Code for: <span class="text-white font-medium">{{ voterInfo?.voterId }}</span>
                  </p>
                  <p class="text-[#A1A1A1] text-xs">
                    Expires: {{ expiresAt }}
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 gap-4">
                  <button
                    (click)="printQR()"
                    class="h-[48px] px-6 bg-[#4a4755] hover:bg-[#5a5565] text-white text-base font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <lucide-icon [img]="icons.Printer" [size]="18"></lucide-icon>
                    Print
                  </button>

                  <button
                    (click)="resetForm()"
                    class="h-[48px] px-6 bg-[#E77E22] hover:bg-[#d9721a] text-white text-base font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <lucide-icon [img]="icons.RefreshCw" [size]="18"></lucide-icon>
                    Generate Another
                  </button>
                </div>

                <!-- Security Notice -->
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

              <!-- Placeholder when no QR -->
              <div *ngIf="!qrCodeData" class="bg-[#2a2833] border border-[#3d3a47] border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                <lucide-icon [img]="icons.QrCode" [size]="64" class="text-[#4a4755]"></lucide-icon>
                <p class="text-[#A1A1A1] text-base">
                  Enter a Voter ID and generate QR code to see it here
                </p>
              </div>

            </div>

          </div>

          <!-- Back Button -->
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
    
    @media print {
      body * {
        visibility: hidden;
      }
      .print-area, .print-area * {
        visibility: visible;
      }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  `]
})
export class QrLoginComponent implements OnInit, OnDestroy {
  readonly icons = { 
    QrCode, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Lock, 
    User, Mail, Phone, MapPin, Printer, RefreshCw 
  };
  
  logoImg = '/dataSoft.svg';
  
  voterId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  currentDate: string = '';
  
  voterInfo: VoterInfo | null = null;
  qrCodeData: string = '';
  expiresAt: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);
  }

  ngOnDestroy() {
    // Clean up any resources if needed
  }

  clearErrors() {
    this.errorMessage = '';
    this.cdr.detectChanges(); 
  }

  async generateQR() {
    if (!this.voterId.trim()) {
      this.errorMessage = 'Please enter a valid Voter ID';
      return;
    }

    this.isLoading = true;
    this.clearErrors();

    try {
      const response: QRResponse = await this.http.post<QRResponse>(
        `${API_URL}/generate`,
        { voterId: this.voterId.trim() },
        { withCredentials: true }
      ).toPromise() as QRResponse;

      if (response?.success && response.voter && response.qrCodeData) {
        this.voterInfo = response.voter;
        
        // Parse the profileJson if it exists
        if (this.voterInfo.profileJson) {
          try {
            this.voterInfo.parsedProfile = JSON.parse(this.voterInfo.profileJson);
          } catch (e) {
            console.warn('Could not parse voter profile JSON');
          }
        }
        
        this.qrCodeData = response.qrCodeData;
        this.expiresAt = new Date(response.expiresAt).toLocaleString();
        
        console.log('✅ QR Code generated successfully');
      } else {
        this.errorMessage = response?.message || 'Failed to generate QR code';
      }
    } catch (error: any) {
      console.error('❌ QR Generation Error:', error);
      
      const status = error.status;
      const backendMessage = error.error?.message || error.error?.error;

      if (status === 401 || status === 403) {
        this.errorMessage = 'Unauthorized. Please login again.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      } 
      else if (status === 404) {
        this.errorMessage = backendMessage || `Voter ID '${this.voterId}' not found in your organization.`;
      } 
      else if (status === 400) {
        this.errorMessage = backendMessage || 'Invalid request.';
      }
      else if (status === 500) {
        this.errorMessage = 'Server error. Please try again later.';
      }
      else if (status === 0) {
        this.errorMessage = 'Network error. Cannot reach server.';
      }
      else {
        this.errorMessage = backendMessage || 'An unexpected error occurred.';
      }

      this.cdr.detectChanges();

    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); 
    }
  }

  printQR() {
    if (!this.qrCodeData) {
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the QR code');
      return;
    }

    const voterName = this.voterInfo?.parsedProfile?.name || this.voterInfo?.voterId || 'Voter';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${this.voterInfo?.voterId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .qr-container {
            text-align: center;
            border: 2px solid #333;
            padding: 30px;
            border-radius: 10px;
          }
          .qr-container img {
            max-width: 400px;
            height: auto;
          }
          h2 {
            margin: 0 0 10px 0;
            color: #333;
          }
          p {
            margin: 5px 0;
            color: #666;
          }
          .voter-id {
            font-size: 24px;
            font-weight: bold;
            color: #E77E22;
            margin: 15px 0;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h2>Voter QR Code</h2>
          <p class="voter-id">${this.voterInfo?.voterId}</p>
          <p><strong>${voterName}</strong></p>
          <img src="${this.qrCodeData}" alt="Voter QR Code" />
          <p style="margin-top: 20px; font-size: 12px;">Generated: ${new Date().toLocaleString()}</p>
          <p style="font-size: 12px;">Expires: ${this.expiresAt}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  resetForm() {
    this.voterId = '';
    this.voterInfo = null;
    this.qrCodeData = '';
    this.expiresAt = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }
}