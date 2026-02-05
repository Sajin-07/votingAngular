import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 mt-4 font-inter text-white">
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
        <img src="/dataSoft.svg" alt="DataSoft" class="h-8 md:h-10" />
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  timeLeft = "05:45:35";
  currentDate = ""; // Property to hold the date
  private timerId: any;
  private totalSeconds = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Logic to set the real current date
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('en-GB', dateOptions);

    // Existing Timer Logic
    const [h, m, s] = this.timeLeft.split(":").map(Number);
    this.totalSeconds = (h * 3600) + (m * 60) + s;
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  startTimer() {
    this.timerId = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateTimeLeftString();
        this.cdr.detectChanges();
      } else {
        clearInterval(this.timerId);
      }
    }, 1000);
  }

  private updateTimeLeftString() {
    const h = Math.floor(this.totalSeconds / 3600);
    const m = Math.floor((this.totalSeconds % 3600) / 60);
    const s = this.totalSeconds % 60;
    this.timeLeft = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  private pad(val: number): string {
    return val < 10 ? `0${val}` : `${val}`;
  }
}




// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <header class="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 mt-4 font-inter text-white">
//       <div class="flex flex-col items-center md:items-start text-center md:text-left">
//         <h1 class="uppercase text-2xl md:text-[28px] mb-4 font-bold tracking-tight">
//           DATASOFT POPULARITY CONTEST
//         </h1>

//         <div class="flex flex-col sm:flex-row gap-2 md:gap-8 text-base md:text-[18px]">
//           <p class="text-[#A1A1A1]">
//             Vote Ends In
//             <span class="ml-1 text-white font-inter font-bold">{{ timeLeft }}</span>
//           </p>
//           <p class="text-[#A1A1A1]">
//             Date
//             <span class="ml-1 text-white font-bold">24 December 2025</span>
//           </p>
//         </div>
//       </div>

//       <div class="flex items-center gap-4 mt-2 md:mt-0">
//         <p class="text-base md:text-[18px] text-[#A1A1A1]">Powered by</p>
//         <img src="/dataSoft.svg" alt="DataSoft" class="h-8 md:h-10" />
//       </div>
//     </header>
//   `
// })
// export class HeaderComponent implements OnInit, OnDestroy {
//   timeLeft = "05:45:35";
//   private timerId: any;
//   private totalSeconds = 0;

//   constructor(private cdr: ChangeDetectorRef) {}

//   ngOnInit() {
//     const [h, m, s] = this.timeLeft.split(":").map(Number);
//     this.totalSeconds = (h * 3600) + (m * 60) + s;
//     this.startTimer();
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
// }