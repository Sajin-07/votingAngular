import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="mb-6 hidden md:block w-full max-w-6xl mx-auto px-4 font-inter">
      <div class="relative">
        <div class="absolute top-[52px] left-24 right-24 h-[4px] bg-white/60"></div>

        <div
          class="absolute top-[52px] left-24 h-[4px] bg-[#529F2D] transition-all duration-500"
          [style.width]="progressWidth"
        ></div>

        <div class="flex justify-between relative z-10">
          <div *ngFor="let step of steps" class="flex flex-col items-center gap-3 min-w-[140px]">
            <span
              class="text-[16px]"
              [class]="step.id <= currentStep ? 'text-[#529F2D]' : 'text-[#707070]'"
            >
              Step {{ step.id }}
            </span>

            <div
              class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300"
              [ngClass]="{
                'bg-[#529F2D] border-[#529F2D]': step.id < currentStep,      
                'bg-white border-white': step.id === currentStep,            
                'bg-[#A1A1A1] border-[#A1A1A1]': step.id > currentStep       
              }"
            >
              <lucide-icon
                *ngIf="step.id < currentStep"
                [img]="checkIcon"
                class="w-6 h-6 text-white"
              ></lucide-icon>
              
              </div>

            <span
              class="text-[14px] font-semibold"
              [class]="step.id <= currentStep ? 'text-white' : 'text-[#707070]'"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StepperComponent {
  @Input() currentStep: number = 1;

  readonly checkIcon = Check;

  readonly steps = [
    { id: 1, label: "Scan QR Code" },
    { id: 2, label: "Your Information" },
    { id: 3, label: "Select & Vote" },
    { id: 4, label: "Success Message" },
  ];

  get progressWidth(): string {
    const percentage = ((this.currentStep - 1) / (this.steps.length - 1)) * 85;
    return `${percentage}%`;
  }
}
// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { LucideAngularModule, Check } from 'lucide-angular';

// @Component({
//   selector: 'app-stepper',
//   standalone: true,
//   imports: [CommonModule, LucideAngularModule],
//   template: `
//     <div class="mb-6 hidden md:block w-full max-w-6xl mx-auto px-4 font-inter">
//       <div class="relative">
//         <div class="absolute top-[52px] left-24 right-24 h-[4px] bg-white/60"></div>

//         <div
//           class="absolute top-[52px] left-24 h-[4px] bg-[#529F2D] transition-all duration-500"
//           [style.width]="progressWidth"
//         ></div>

//         <div class="flex justify-between relative z-10">
//           <div *ngFor="let step of steps" class="flex flex-col items-center gap-3 min-w-[140px]">
//             <span
//               class="text-[16px]"
//               [class]="step.id <= currentStep ? 'text-[#529F2D]' : 'text-[#707070]'"
//             >
//               Step {{ step.id }}
//             </span>

//             <div
//               class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300"
//               [ngClass]="{
//                 'bg-[#529F2D] border-[#529F2D]': step.id <= currentStep,
//                 'bg-[#A1A1A1] border-[#A1A1A1]': step.id > currentStep
//               }"
//             >
//               <lucide-icon
//                 *ngIf="step.id < currentStep"
//                 [img]="checkIcon"
//                 class="w-6 h-6 text-white"
//               ></lucide-icon>
              
//               <span *ngIf="step.id >= currentStep" class="font-bold text-sm text-white">
//                 {{ step.id }}
//               </span>
//             </div>

//             <span
//               class="text-[14px] font-semibold"
//               [class]="step.id <= currentStep ? 'text-white' : 'text-[#707070]'"
//             >
//               {{ step.label }}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   `
// })
// export class StepperComponent {
//   @Input() currentStep: number = 1;

//   readonly checkIcon = Check;

//   readonly steps = [
//     { id: 1, label: "Scan QR Code" },
//     { id: 2, label: "Your Information" },
//     { id: 3, label: "Candidate Choice" },
//     { id: 4, label: "Success Message" },
//     // { id: 5, label: "Success Message" },
//   ];

//   get progressWidth(): string {
//     // 0 index logic: currentStep - 1
//     // 85% is the visual width cap from your original css
//     const percentage = ((this.currentStep - 1) / (this.steps.length - 1)) * 85;
//     return `${percentage}%`;
//   }
// }