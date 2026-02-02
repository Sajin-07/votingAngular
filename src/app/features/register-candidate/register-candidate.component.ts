import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClientModule } from '@angular/common/http';
import { CandidateService, Candidate } from '../../services/candidate.service';
import { BehaviorSubject, Observable, map, switchMap, timer, of, catchError, startWith, tap } from 'rxjs';
import Swal from 'sweetalert2'; // Import SweetAlert

@Component({
  selector: 'app-register-candidate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register-candidate.component.html',
  styleUrls: ['./register-candidate.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class RegisterCandidateComponent implements OnInit {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'No file chosen';
  
  isSubmitting = false;
  statusMessage = '';
  consensusStep = 0; 
  timeLeft = '04:12:45'; 

  // --- REACTIVE STATE MANAGEMENT (Like TanStack Query) ---
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);
  
  // This Observable automatically refetches whenever refreshTrigger$ emits
  candidates$: Observable<Candidate[]> = this.refreshTrigger$.pipe(
    switchMap(() => this.candidateService.getCandidates()),
    startWith([]), // Initial empty state
    catchError(() => of([])) // Handle errors gracefully
  );

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService
  ) {
    this.candidateForm = this.fb.group({
      candidateId: [
        '', 
        [Validators.required, Validators.pattern(/^C\d+$/)], 
        [this.candidateIdValidator()]
      ],
      name: ['', Validators.required],
      position: ['', Validators.required],
      description: ['', Validators.required],
      photo: [null, Validators.required] 
    });
  }

  ngOnInit(): void {
    // No manual call needed here; candidates$ handles subscription in the template via | async
  }

  // Async Validator
  candidateIdValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return timer(500).pipe(
        switchMap(() => this.candidateService.checkCandidateExists(control.value)),
        map(exists => (exists ? { idExists: true } : null))
      );
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.candidateForm.patchValue({ photo: 'valid' });
    }
  }

  async submitToBlockchain() {
    if (this.candidateForm.invalid || !this.selectedFile) return;

    this.isSubmitting = true;
    this.consensusStep = 1;
    this.statusMessage = 'Uploading securely to ImgBB...';

    try {
      // 1. Upload Image
      const photoUrl = await this.uploadToImgBBPromise(this.selectedFile);
      
      this.consensusStep = 2;
      this.statusMessage = 'Proposing transaction to Peers...';

      // 2. Prepare Data
      const newCandidate: Candidate = {
        candidateId: this.candidateForm.get('candidateId')?.value,
        name: this.candidateForm.get('name')?.value,
        position: this.candidateForm.get('position')?.value,
        description: this.candidateForm.get('description')?.value,
        photoUrl: photoUrl
      };

      // 3. Submit to Blockchain (with slight delay for visual effect)
      await this.candidateService.addCandidate(newCandidate).toPromise();
      
      // Artificial delay to show the "Committing" step clearly
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      this.consensusStep = 3;
      this.statusMessage = 'Transaction committed to Ledger!';

      // 4. Success UI & Refetch
      this.showSuccessAlert();

    } catch (error: any) {
      console.error(error);
      this.statusMessage = 'Error: ' + (error.error?.message || 'Transaction Failed');
      Swal.fire({
        icon: 'error',
        title: 'Transaction Failed',
        text: error.error?.message || 'Could not write to blockchain.',
        background: '#25242D',
        color: '#fff'
      });
      this.isSubmitting = false;
      this.consensusStep = 0;
    }
  }

  showSuccessAlert() {
    Swal.fire({
      title: 'Candidate Registered!',
      text: 'The data has been immutably recorded on the blockchain.',
      icon: 'success',
      confirmButtonText: 'AWESOME',
      confirmButtonColor: '#529F2D',
      background: '#25242D',
      color: '#fff',
      iconColor: '#529F2D',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then(() => {
      // Actions to take AFTER closing the alert (or immediately if you prefer)
      this.resetForm();
      
      // THE "REFETCH" HOOK: Trigger the subject to reload the list
      this.refreshTrigger$.next();
    });
  }

  uploadToImgBBPromise(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.candidateService.uploadImage(file).subscribe({
        next: (url) => resolve(url),
        error: (err) => reject(err)
      });
    });
  }

  resetForm() {
    this.candidateForm.reset();
    this.selectedFile = null;
    this.selectedFileName = 'No file chosen';
    this.isSubmitting = false;
    this.consensusStep = 0;
  }
}


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
// import { trigger, transition, style, animate } from '@angular/animations';
// import { HttpClientModule } from '@angular/common/http';
// import { CandidateService, Candidate } from '../../services/candidate.service'; // Adjust path
// import { map, switchMap, timer, of } from 'rxjs';

// @Component({
//   selector: 'app-register-candidate',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
//   templateUrl: './register-candidate.component.html',
//   styleUrls: ['./register-candidate.component.scss'],
//   animations: [
//     trigger('fadeIn', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateY(10px)' }),
//         animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
//       ])
//     ]),
//     trigger('listAnimation', [
//       transition(':enter', [
//         style({ opacity: 0, transform: 'translateX(-20px)' }),
//         animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
//       ])
//     ])
//   ]
// })
// export class RegisterCandidateComponent implements OnInit {
//   candidateForm: FormGroup;
//   selectedFile: File | null = null;
//   selectedFileName: string = 'No file chosen';
  
//   isSubmitting = false;
//   statusMessage = '';
//   consensusStep = 0; // 0: Idle, 1: Uploading Img, 2: Consensus, 3: Committing
//   timeLeft = '04:12:45'; 

//   existingCandidates: Candidate[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private candidateService: CandidateService
//   ) {
//     this.candidateForm = this.fb.group({
//       candidateId: [
//         '', 
//         [Validators.required, Validators.pattern(/^C\d+$/)], // Sync Validators: Required & Starts with 'C'
//         [this.candidateIdValidator()] // Async Validator: Check DB
//       ],
//       name: ['', Validators.required],
//       position: ['', Validators.required],
//       description: ['', Validators.required],
//       photo: [null, Validators.required] // Used for validation only
//     });
//   }

//   ngOnInit(): void {
//     this.loadCandidates();
//   }

//   loadCandidates() {
//     this.candidateService.getCandidates().subscribe(data => {
//       this.existingCandidates = data;
//     });
//   }

//   // Custom Async Validator to check if ID exists
//   candidateIdValidator(): AsyncValidatorFn {
//     return (control: AbstractControl) => {
//       if (!control.value) return of(null);
//       // Debounce slightly to avoid spamming API
//       return timer(500).pipe(
//         switchMap(() => this.candidateService.checkCandidateExists(control.value)),
//         map(exists => (exists ? { idExists: true } : null))
//       );
//     };
//   }

//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedFile = file;
//       this.selectedFileName = file.name;
//       this.candidateForm.patchValue({ photo: 'valid' }); // Manually set form control to valid
//     }
//   }

//   async submitToBlockchain() {
//     if (this.candidateForm.invalid || !this.selectedFile) return;

//     this.isSubmitting = true;
//     this.consensusStep = 1; // Step 1: Uploading Image
//     this.statusMessage = 'Uploading securely to ImgBB...';

//     try {
//       // 1. Upload Image First
//       const photoUrl = await this.uploadToImgBBPromise(this.selectedFile);
      
//       this.consensusStep = 2; // Step 2: Proposing
//       this.statusMessage = 'Proposing transaction to Peers...';

//       // 2. Prepare Payload
//       const newCandidate: Candidate = {
//         candidateId: this.candidateForm.get('candidateId')?.value,
//         name: this.candidateForm.get('name')?.value,
//         position: this.candidateForm.get('position')?.value,
//         description: this.candidateForm.get('description')?.value,
//         photoUrl: photoUrl
//       };

//       // 3. Submit to Blockchain (Artificial delay added for animation visualization if API is too fast)
//       const apiCall = this.candidateService.addCandidate(newCandidate).toPromise();
//       const minimumAnimationDelay = new Promise(resolve => setTimeout(resolve, 2000));
      
//       await Promise.all([apiCall, minimumAnimationDelay]);

//       this.consensusStep = 3; // Step 3: Committed
//       this.statusMessage = 'Transaction committed to Ledger!';

//       // 4. Finalize
//       setTimeout(() => {
//         this.loadCandidates(); // Refresh list from server
//         this.resetForm();
//       }, 1000);

//     } catch (error: any) {
//       console.error(error);
//       this.statusMessage = 'Error: ' + (error.error?.message || 'Transaction Failed');
//       setTimeout(() => {
//         this.isSubmitting = false;
//         this.consensusStep = 0;
//       }, 3000);
//     }
//   }

//   // Wrapper to convert Observable to Promise for async/await flow
//   uploadToImgBBPromise(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//       this.candidateService.uploadImage(file).subscribe({
//         next: (url) => resolve(url),
//         error: (err) => reject(err)
//       });
//     });
//   }

//   resetForm() {
//     this.candidateForm.reset();
//     this.selectedFile = null;
//     this.selectedFileName = 'No file chosen';
//     this.isSubmitting = false;
//     this.consensusStep = 0;
//   }
// }

