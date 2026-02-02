// qr-verify-landing.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ScanLine, ArrowRight, Vote } from 'lucide-angular';

@Component({
  selector: 'app-qr-verify-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div 
      class="min-h-screen text-white p-6 md:p-12 flex flex-col font-inter"
      [style.background]="'radial-gradient(circle at center, #535056 0%, #25242D 70%)'"
    >
      <div class="max-w-7xl mx-auto w-full flex flex-col h-full">
        
        <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 mt-4">
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
                <span class="ml-1 text-white font-bold">15 January 2026</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-2 md:mt-0">
            <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
            <img [src]="logoImg" alt="DataSoft" class="h-8 md:h-10" />
          </div>
        </header>

        <div class="flex-1 flex items-center justify-center w-full">
          
          <div class="w-full max-w-[500px] bg-[#00000054] border border-[#3E3D45] rounded-xl shadow-[0px_4px_4px_0px_#00000040] p-8 relative overflow-hidden text-center">
            
            <div class="absolute top-0 right-0 w-32 h-32 bg-[#529F2D]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10">
              <div class="inline-flex items-center justify-center w-24 h-24 bg-[#2A2931] border border-[#3E3D45] rounded-full mb-6 relative group">
                 <div class="absolute inset-0 rounded-full border border-[#529F2D]/30 animate-pulse"></div>
                <lucide-icon [img]="icons.ScanLine" [size]="40" class="text-[#529F2D]"></lucide-icon>
              </div>

              <h2 class="text-[28px] font-bold text-white mb-3">Ready to Vote?</h2>
              <p class="text-[#A1A1A1] text-lg mb-8">
                Please have your personal QR code ready. Scan it to verify your identity and cast your vote.
              </p>

              <button 
                (click)="onScanClick()" 
                class="h-[64px] w-full uppercase font-bold text-[18px] bg-gradient-to-r from-[#529F2D] to-[#1D3910] border-0 outline-none shadow-md transition-all duration-200 hover:shadow-[0_8px_24px_rgba(82,159,45,0.45)] hover:from-[#5fb834] hover:to-[#234715] active:scale-95 rounded-lg text-white flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Scan QR Code to Vote</span>
                <lucide-icon [img]="icons.ArrowRight" [size]="24"></lucide-icon>
              </button>

              <div class="mt-8">
                <p class="text-sm text-[#707070]">Don't have a QR code? Contact HR.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class QrVerifyLandingComponent {
  readonly icons = { ScanLine, ArrowRight, Vote };
  logoImg = '/dataSoft.svg';
  timeLeft = "05:45:35";

  // Inject Router
  constructor(private router: Router) {}

  // Handle click event
  onScanClick() {
    this.router.navigate(['/verify-qr']);
  }
}