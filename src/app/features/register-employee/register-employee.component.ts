//last worked
import { Component, OnInit, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2, Fingerprint, Clock } from 'lucide-angular';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3000';
const IMAGE_HOSTING_KEY = "49c34f91f4f7457f0cb17f358b9e8b40"; // Use your actual key
const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

// Security: Fingerprint data expires after 2 minutes
const FINGERPRINT_TTL = 120000; 

interface EmployeeRegistrationFormData {
  photo: File | null;
  name: string;
  designation: string;
  employeeId: string;
  bloodGroup: string;
  dateOfJoining: string;
  issueDate: string;
}

@Component({
  selector: 'app-register-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HttpClientModule],
  templateUrl: './register-employee.component.html',
  styleUrls: ['./register-employee.component.css']
})
export class RegisterEmployeeComponent implements OnInit, OnDestroy {
  
  readonly icons = { UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2, Fingerprint, Clock };
  
  formData: EmployeeRegistrationFormData = {
    photo: null,
    name: '',
    designation: '',
    employeeId: '',
    bloodGroup: '',
    dateOfJoining: '',
    issueDate: '',
  };

  previewUrl: string | null = null;
  bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  // Date Constraints
  maxDate: string = '';

  // UI State
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;
  isImageLoading: boolean = false;
  
  // ID Validation State
  isCheckingId: boolean = false;
  idExistsError: boolean = false;
  private idCheckSubject = new Subject<string>();
  private idCheckSubscription: Subscription | undefined;

  // Fingerprint State
  fingerprintTemplate: string | null = null;
  fingerprintQuality: number = 0;
  isFingerprintCaptured: boolean = false;
  captureTimestamp: number = 0; 

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. Set Max Date to Today (prevent future joining dates)
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    
    // Default Issue Date to today
    this.formData.issueDate = this.maxDate;
    
    // 2. Setup ID Check Listener
    this.idCheckSubscription = this.idCheckSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(id => {
        if (!this.isValidFormat(id)) return [null];
        this.ngZone.run(() => { this.isCheckingId = true; });
        return this.http.get<{ exists: boolean }>(`${API_URL}/api/auth/check/${id}`,
          { withCredentials: true });
      })
    ).subscribe({
      next: (response: any) => {
        this.ngZone.run(() => {
          this.isCheckingId = false;
          // If response is null (invalid format) or exists is true
          if (response && response.exists) {
            this.idExistsError = true;
          } else {
            this.idExistsError = false;
          }
        });
      },
      error: () => {
        this.ngZone.run(() => { this.isCheckingId = false; });
      }
    });
  }

  ngOnDestroy() {
    if (this.idCheckSubscription) {
      this.idCheckSubscription.unsubscribe();
    }
  }

  // --- IMAGE HANDLING ---
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isImageLoading = true;
      this.formData.photo = file;
      
      const reader = new FileReader();
      reader.onload = () => { 
        this.ngZone.run(() => {
          this.previewUrl = reader.result as string;
          this.isImageLoading = false;
          this.cdr.detectChanges();
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // --- ID VALIDATION ---
  isValidFormat(id: string): boolean {
    const regex = /^(DS|INT)\d{5}$/;
    return regex.test(id.toUpperCase());
  }

  onIdInput(value: string) {
    this.formData.employeeId = value.toUpperCase();
    this.idExistsError = false;
    
    if (this.isValidFormat(this.formData.employeeId)) {
      this.idCheckSubject.next(this.formData.employeeId);
    }
  }

  // --- FINGERPRINT CAPTURE ---
  async captureFingerprint() {
    this.updateState("⏳ Please place your finger on the scanner...", false, true);
    
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${API_URL}/api/fingerprint/capture`, {})
      );

      if (response.success && response.template) {
        this.ngZone.run(() => {
          this.fingerprintTemplate = response.template;
          this.fingerprintQuality = response.quality || 0;
          this.isFingerprintCaptured = true;
          this.captureTimestamp = Date.now();
          this.isLoading = false;
          this.message = '';
          
          Swal.fire({
            title: 'Fingerprint Captured!',
            text: `Quality Score: ${this.fingerprintQuality}`,
            icon: 'success',
            background: '#25242D',
            color: '#ffffff',
            confirmButtonColor: '#529F2D',
            timer: 2000,
            showConfirmButton: false
          });
          
          this.cdr.detectChanges();
        });
      } else {
        throw new Error('Failed to capture fingerprint');
      }

    } catch (error: any) {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.isError = true;
        const errorMsg = error.error?.error || error.message || 'Capture failed';
        this.message = errorMsg;
        Swal.fire({ title: 'Capture Failed', text: errorMsg, icon: 'error', background: '#25242D', color: '#fff', confirmButtonColor: '#d33' });
        this.cdr.detectChanges();
      });
    }
  }

  // Helper to reset JUST biometric data (used when duplicate is found)
  resetFingerprint() {
    this.ngZone.run(() => {
        this.fingerprintTemplate = null;
        this.fingerprintQuality = 0;
        this.isFingerprintCaptured = false;
        this.captureTimestamp = 0;
        this.cdr.detectChanges();
    });
  }

  // --- FORM SUBMISSION ---
  get isFormValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.designation &&
      this.formData.employeeId &&
      this.isValidFormat(this.formData.employeeId) && 
      !this.idExistsError &&
      !this.isCheckingId &&
      this.formData.bloodGroup &&
      this.formData.dateOfJoining &&
      this.formData.photo &&
      this.isFingerprintCaptured
    );
  }

  private updateState(msg: string, error: boolean = false, loading: boolean = true) {
    this.ngZone.run(() => {
      this.message = msg;
      this.isError = error;
      this.isLoading = loading;
      this.cdr.detectChanges();
    });
  }

  clearForm() {
    this.ngZone.run(() => {
      this.formData = {
        photo: null,
        name: '',
        designation: '',
        employeeId: '',
        bloodGroup: '',
        dateOfJoining: '',
        issueDate: new Date().toISOString().split('T')[0],
      };
      this.previewUrl = null;
      this.resetFingerprint();
      this.message = '';
      this.isLoading = false;
      this.isError = false;
      this.idExistsError = false;
      this.isCheckingId = false;

      const fileInput = document.getElementById('photoInput') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
      
      this.cdr.detectChanges();
    });
  }

  async onSubmit() {
    if (!this.isFormValid) return;

    // Check Fingerprint Expiry
    if (this.isFingerprintCaptured && (Date.now() - this.captureTimestamp > FINGERPRINT_TTL)) {
       Swal.fire({ title: 'Session Expired', text: 'Fingerprint buffer expired. Scan again.', icon: 'warning', background: '#25242D', color: '#fff', confirmButtonColor: '#d33' });
       this.resetFingerprint();
       return;
    }

    this.updateState("⏳ Verifying Biometrics...", false, true);

    try {
        // --- STEP 1: Check Duplicate Fingerprint ---
        // We verify BEFORE uploading image to save bandwidth/time
        await firstValueFrom(
            this.http.post(`${API_URL}/api/fingerprint/check-duplicate`, {
                fingerprintTemplate: this.fingerprintTemplate
            })
        );

        // --- STEP 2: Upload Image (Only if Step 1 succeeds) ---
        let uploadedPhotoUrl = '';
        if (this.formData.photo) {
            this.updateState("Uploading Profile Photo...", false, true);
            const imageFormData = new FormData();
            imageFormData.append('image', this.formData.photo);
            
            const imgResponse: any = await firstValueFrom(
                this.http.post(IMAGE_HOSTING_API, imageFormData)
            );
            uploadedPhotoUrl = imgResponse?.data?.url;
            if (!uploadedPhotoUrl) throw new Error("Image upload failed");
        }

        // --- STEP 3: Save to Blockchain ---
        this.updateState("Saving to Blockchain...", false, true);
        const formattedId = this.formData.employeeId.toUpperCase();
        
        const finalEmployeeData = { 
            ...this.formData, 
            dsId: formattedId, 
            photoUrl: uploadedPhotoUrl 
        };

        await firstValueFrom(
            this.http.post(`${API_URL}/auth/register/confirm`, {
                dsId: formattedId,
                employeeData: finalEmployeeData,
                fingerprintTemplate: this.fingerprintTemplate 
            },
            {
              withCredentials: true
            }
          )
        );

        // --- SUCCESS ---
        this.ngZone.run(() => {
            this.isLoading = false;
            Swal.fire({
                title: 'Registration Successful!',
                html: `<p>${this.formData.name} has been registered securely.</p>`,
                icon: 'success',
                background: '#25242D', color: '#fff', confirmButtonColor: '#529F2D'
            });
            this.clearForm();
        });

    } catch (err: any) {
        this.ngZone.run(() => {
            this.isLoading = false;
            this.isError = true;
            
            // Handle Duplicate Fingerprint Specific Error
            if (err.status === 409) {
                const msg = err.error?.message || "Duplicate Fingerprint Detected";
                Swal.fire({
                    title: 'Biometric Conflict',
                    text: msg,
                    icon: 'error',
                    background: '#25242D', color: '#fff', confirmButtonColor: '#d33'
                });
                // RESET FINGERPRINT ONLY - Allow retry
                this.resetFingerprint();
                this.message = "Fingerprint matched another user. Please scan a different finger.";
            } else {
                // General Errors
                const msg = err.error?.error || err.message || "Unknown error";
                this.message = msg;
                Swal.fire({ title: 'Registration Failed', text: msg, icon: 'error', background: '#25242D', color: '#fff', confirmButtonColor: '#d33' });
            }
        });
    }
  }
}





//
// import { Component, OnInit, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2, Fingerprint, Clock } from 'lucide-angular';
// import { firstValueFrom, Subject, Subscription } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// import Swal from 'sweetalert2';

// const API_URL = 'http://localhost:3000';
// const IMAGE_HOSTING_KEY = "49c34f91f4f7457f0cb17f358b9e8b40";
// const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

// // Security: Fingerprint data expires after 2 minutes (120,000 ms)
// const FINGERPRINT_TTL = 120000; 

// interface EmployeeRegistrationFormData {
//   photo: File | null;
//   name: string;
//   designation: string;
//   employeeId: string;
//   bloodGroup: string;
//   dateOfJoining: string;
//   issueDate: string;
// }

// @Component({
//   selector: 'app-register-employee',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './register-employee.component.html',
//   styleUrls: ['./register-employee.component.css']
// })
// export class RegisterEmployeeComponent implements OnInit, OnDestroy {
  
//   readonly icons = { UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2, Fingerprint, Clock };
  
//   formData: EmployeeRegistrationFormData = {
//     photo: null,
//     name: '',
//     designation: '',
//     employeeId: '',
//     bloodGroup: '',
//     dateOfJoining: '',
//     issueDate: '',
//   };

//   previewUrl: string | null = null;
//   bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
//   // UI State
//   message: string = '';
//   isError: boolean = false;
//   isLoading: boolean = false;
//   isImageLoading: boolean = false;
  
//   // ID Validation State
//   isCheckingId: boolean = false;
//   idExistsError: boolean = false;
//   private idCheckSubject = new Subject<string>();
//   private idCheckSubscription: Subscription | undefined;

//   // Fingerprint State
//   fingerprintTemplate: string | null = null;
//   fingerprintQuality: number = 0;
//   isFingerprintCaptured: boolean = false;
//   captureTimestamp: number = 0; // Tracks when the finger was scanned

//   constructor(
//     private http: HttpClient,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.formData.issueDate = new Date().toISOString().split('T')[0];
    
//     // Setup ID debounce listener
//     this.idCheckSubscription = this.idCheckSubject.pipe(
//       debounceTime(500),
//       distinctUntilChanged(),
//       switchMap(id => {
//         if (!this.isValidFormat(id)) return [null];
//         this.ngZone.run(() => { this.isCheckingId = true; });
//         return this.http.get<{ exists: boolean }>(`${API_URL}/api/auth/check/${id}`);
//       })
//     ).subscribe({
//       next: (response: any) => {
//         this.ngZone.run(() => {
//           this.isCheckingId = false;
//           if (response && response.exists) {
//             this.idExistsError = true;
//           } else {
//             this.idExistsError = false;
//           }
//         });
//       },
//       error: () => {
//         this.ngZone.run(() => { this.isCheckingId = false; });
//       }
//     });
//   }

//   ngOnDestroy() {
//     if (this.idCheckSubscription) {
//       this.idCheckSubscription.unsubscribe();
//     }
//   }

//   // --- IMAGE HANDLING ---
//   onFileChange(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.isImageLoading = true;
//       this.formData.photo = file;
      
//       const reader = new FileReader();
//       reader.onload = () => { 
//         this.ngZone.run(() => {
//           this.previewUrl = reader.result as string;
//           this.isImageLoading = false;
//           this.cdr.detectChanges();
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   // --- ID VALIDATION ---
//   isValidFormat(id: string): boolean {
//     const regex = /^(DS|INT)\d{5}$/;
//     return regex.test(id.toUpperCase());
//   }

//   onIdInput(value: string) {
//     this.formData.employeeId = value.toUpperCase();
//     this.idExistsError = false;
    
//     if (this.isValidFormat(this.formData.employeeId)) {
//       this.idCheckSubject.next(this.formData.employeeId);
//     }
//   }

//   // --- FINGERPRINT CAPTURE ---
//   async captureFingerprint() {
//     this.updateState("⏳ Please place your finger on the scanner...", false, true);
    
//     try {
//       const response: any = await firstValueFrom(
//         this.http.post(`${API_URL}/api/fingerprint/capture`, {})
//       );

//       if (response.success && response.template) {
//         this.ngZone.run(() => {
//           this.fingerprintTemplate = response.template;
//           this.fingerprintQuality = response.quality || 0;
//           this.isFingerprintCaptured = true;
//           this.captureTimestamp = Date.now(); // Set timestamp on success
//           this.isLoading = false;
//           this.message = '';
          
//           Swal.fire({
//             title: 'Fingerprint Captured!',
//             text: `Quality Score: ${this.fingerprintQuality}`,
//             icon: 'success',
//             background: '#25242D',
//             color: '#ffffff',
//             confirmButtonColor: '#529F2D',
//             timer: 2000,
//             showConfirmButton: false
//           });
          
//           this.cdr.detectChanges();
//         });
//       } else {
//         throw new Error('Failed to capture fingerprint');
//       }

//     } catch (error: any) {
//       this.ngZone.run(() => {
//         this.isLoading = false;
//         this.isError = true;
        
//         const errorMsg = error.error?.error || error.message || 'Fingerprint capture failed';
//         this.message = errorMsg;
        
//         Swal.fire({
//           title: 'Capture Failed',
//           text: errorMsg,
//           icon: 'error',
//           background: '#25242D',
//           color: '#ffffff',
//           confirmButtonColor: '#d33'
//         });
        
//         this.cdr.detectChanges();
//       });
//     }
//   }

//   // --- FORM VALIDITY ---
//   get isFormValid(): boolean {
//     return !!(
//       this.formData.name &&
//       this.formData.designation &&
//       this.formData.employeeId &&
//       this.isValidFormat(this.formData.employeeId) && 
//       !this.idExistsError &&
//       !this.isCheckingId &&
//       this.formData.bloodGroup &&
//       this.formData.dateOfJoining &&
//       this.formData.photo &&
//       this.isFingerprintCaptured // NEW: Must have fingerprint
//     );
//   }

//   private updateState(msg: string, error: boolean = false, loading: boolean = true) {
//     this.ngZone.run(() => {
//       this.message = msg;
//       this.isError = error;
//       this.isLoading = loading;
//       this.cdr.detectChanges();
//     });
//   }

//   clearForm() {
//     this.ngZone.run(() => {
//       this.formData = {
//         photo: null,
//         name: '',
//         designation: '',
//         employeeId: '',
//         bloodGroup: '',
//         dateOfJoining: '',
//         issueDate: new Date().toISOString().split('T')[0],
//       };
//       this.previewUrl = null;
//       this.message = '';
//       this.isLoading = false;
//       this.isError = false;
//       this.idExistsError = false;
//       this.isCheckingId = false;
//       this.fingerprintTemplate = null;
//       this.fingerprintQuality = 0;
//       this.isFingerprintCaptured = false;
//       this.captureTimestamp = 0; // Reset timestamp

//       const fileInput = document.getElementById('photoInput') as HTMLInputElement;
//       if(fileInput) fileInput.value = '';
      
//       this.cdr.detectChanges();
//     });
//   }

//   async onSubmit() {
//     if (!this.isFormValid) return;

//     // ... (Expired check logic remains the same) ...
//     if (this.isFingerprintCaptured && (Date.now() - this.captureTimestamp > FINGERPRINT_TTL)) {
//        // ... (Timeout logic) ...
//        return;
//     }

//     this.updateState("⏳ Processing Registration...", false, true);
//     let uploadedPhotoUrl = '';

//     try {
//       // 1. Upload Image (Same as before)
//       if (this.formData.photo) {
//         this.updateState("Uploading Profile Photo...", false, true);
//         const imageFormData = new FormData();
//         imageFormData.append('image', this.formData.photo);
//         const imgResponse: any = await firstValueFrom(this.http.post(IMAGE_HOSTING_API, imageFormData));
//         uploadedPhotoUrl = imgResponse?.data?.url;
//         if (!uploadedPhotoUrl) throw new Error("Image upload failed");
//       }

//       const formattedId = this.formData.employeeId.toUpperCase();
//       const finalEmployeeData = { 
//         ...this.formData, 
//         dsId: formattedId, 
//         photoUrl: uploadedPhotoUrl 
//       };

//       // 2. Save to Blockchain
//       this.updateState("Saving to Blockchain...", false, true);
      
//       // FIX: Send raw fingerprintTemplate. Do not JSON.stringify([]) here.
//       // The backend will handle the comparison logic.
//       await firstValueFrom(
//         this.http.post(`${API_URL}/auth/register/verify`, {
//           dsId: formattedId,
//           employeeData: finalEmployeeData,
//           fingerprintTemplate: this.fingerprintTemplate 
//         })
//       );

//       // 3. SUCCESS
//       this.ngZone.run(() => {
//         this.isLoading = false;
//         this.message = ''; 
//         Swal.fire({
//             title: 'Registration Successful!',
//             html: `<p>${this.formData.name} has been registered securely.</p>`,
//             icon: 'success',
//             background: '#25242D',
//             color: '#ffffff',
//             confirmButtonColor: '#529F2D'
//         });
//         this.clearForm();
//       });

//     } catch (err: any) {
//        // ... (Error handling remains same) ...
//        this.ngZone.run(() => {
//         this.isLoading = false;
//         this.isError = true;
//         const msg = err.error?.error || err.message || "Unknown error";
//         this.message = msg;
//         Swal.fire({
//             title: 'Registration Failed',
//             text: msg,
//             icon: 'error',
//             background: '#25242D',
//             color: '#ffffff',
//             confirmButtonColor: '#d33'
//         });
//       });
//     }
//   }
// }



//last worked
// import { Component, OnInit, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2 } from 'lucide-angular';
// import { firstValueFrom, Subject, Subscription } from 'rxjs';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// import { startRegistration } from '@simplewebauthn/browser';
// import Swal from 'sweetalert2'; // <--- Import SweetAlert

// const API_URL = 'http://localhost:3000';
// const IMAGE_HOSTING_KEY = "49c34f91f4f7457f0cb17f358b9e8b40";
// const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

// interface EmployeeRegistrationFormData {
//   photo: File | null;
//   name: string;
//   designation: string;
//   employeeId: string;
//   bloodGroup: string;
//   dateOfJoining: string;
//   issueDate: string;
// }

// @Component({
//   selector: 'app-register-employee',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './register-employee.component.html',
//   styleUrls: ['./register-employee.component.css']
// })
// export class RegisterEmployeeComponent implements OnInit, OnDestroy {
  
//   readonly icons = { UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2 };
  
//   formData: EmployeeRegistrationFormData = {
//     photo: null,
//     name: '',
//     designation: '',
//     employeeId: '',
//     bloodGroup: '',
//     dateOfJoining: '',
//     issueDate: '',
//   };

//   previewUrl: string | null = null;
//   bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
//   // UI State
//   message: string = '';
//   isError: boolean = false;
//   isLoading: boolean = false;
//   isImageLoading: boolean = false;
  
//   // --- NEW: ID Validation State ---
//   isCheckingId: boolean = false;
//   idExistsError: boolean = false;
//   private idCheckSubject = new Subject<string>();
//   private idCheckSubscription: Subscription | undefined;

//   constructor(
//     private http: HttpClient,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.formData.issueDate = new Date().toISOString().split('T')[0];
    
//     // --- 1. SETUP ID DEBOUNCE LISTENER ---
//     this.idCheckSubscription = this.idCheckSubject.pipe(
//       debounceTime(500), // Wait 500ms after typing stops
//       distinctUntilChanged(),
//       switchMap(id => {
//         // Only check valid formats to save API calls
//         if (!this.isValidFormat(id)) return [null];
//         this.ngZone.run(() => { this.isCheckingId = true; });
//         return this.http.get<{ exists: boolean }>(`${API_URL}/auth/check/${id}`);
//       })
//     ).subscribe({
//       next: (response: any) => {
//         this.ngZone.run(() => {
//           this.isCheckingId = false;
//           if (response && response.exists) {
//             this.idExistsError = true; // ID Taken
//           } else {
//             this.idExistsError = false; // ID Available
//           }
//         });
//       },
//       error: () => {
//         this.ngZone.run(() => { this.isCheckingId = false; });
//       }
//     });
//   }

//   ngOnDestroy() {
//     if (this.idCheckSubscription) {
//       this.idCheckSubscription.unsubscribe();
//     }
//   }

//   // --- 2. IMAGE HANDLING ---
//   onFileChange(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.isImageLoading = true;
//       this.formData.photo = file;
      
//       const reader = new FileReader();
//       reader.onload = () => { 
//         this.ngZone.run(() => {
//           this.previewUrl = reader.result as string;
//           this.isImageLoading = false;
//           this.cdr.detectChanges();
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   // --- 3. ID VALIDATION ---
  
//   // Regex check only
//   isValidFormat(id: string): boolean {
//     const regex = /^(DS|INT)\d{5}$/;
//     return regex.test(id.toUpperCase());
//   }

//   // Triggered on input change
//   onIdInput(value: string) {
//     this.formData.employeeId = value.toUpperCase(); // Force Uppercase
//     this.idExistsError = false; // Reset error while typing
    
//     if (this.isValidFormat(this.formData.employeeId)) {
//       this.idCheckSubject.next(this.formData.employeeId);
//     }
//   }

//   // Global form validity
//   get isFormValid(): boolean {
//     return !!(
//       this.formData.name &&
//       this.formData.designation &&
//       this.formData.employeeId &&
//       this.isValidFormat(this.formData.employeeId) && 
//       !this.idExistsError &&      // Ensure ID is not duplicate
//       !this.isCheckingId &&       // Ensure check is done
//       this.formData.bloodGroup &&
//       this.formData.dateOfJoining &&
//       this.formData.photo
//     );
//   }

//   private updateState(msg: string, error: boolean = false, loading: boolean = true) {
//     this.ngZone.run(() => {
//       this.message = msg;
//       this.isError = error;
//       this.isLoading = loading;
//       this.cdr.detectChanges();
//     });
//   }

//   clearForm() {
//     this.ngZone.run(() => {
//       this.formData = {
//         photo: null,
//         name: '',
//         designation: '',
//         employeeId: '',
//         bloodGroup: '',
//         dateOfJoining: '',
//         issueDate: new Date().toISOString().split('T')[0],
//       };
//       this.previewUrl = null;
//       this.message = '';
//       this.isLoading = false;
//       this.isError = false;
//       this.idExistsError = false;
//       this.isCheckingId = false;

//       const fileInput = document.getElementById('photoInput') as HTMLInputElement;
//       if(fileInput) fileInput.value = '';
      
//       this.cdr.detectChanges();
//     });
//   }

//   async onSubmit() {
//     if (!this.isFormValid) return;

//     this.updateState("⏳ Processing Registration...", false, true);
//     let uploadedPhotoUrl = '';

//     try {
//       // 1. Upload Image
//       if (this.formData.photo) {
//         this.updateState("Uploading Profile Photo...", false, true);
//         const imageFormData = new FormData();
//         imageFormData.append('image', this.formData.photo);
//         const imgResponse: any = await firstValueFrom(this.http.post(IMAGE_HOSTING_API, imageFormData));
//         uploadedPhotoUrl = imgResponse?.data?.url;
//         if (!uploadedPhotoUrl) throw new Error("Image upload failed");
//       }

//       const formattedId = this.formData.employeeId.toUpperCase();
//       const finalEmployeeData = { ...this.formData, dsId: formattedId, photoUrl: uploadedPhotoUrl };

//       // 2. Biometric Setup
//       this.updateState("Initializing Biometrics...", false, true);
//       const optsResponse: any = await firstValueFrom(
//         this.http.post(`${API_URL}/auth/register/options`, { dsId: formattedId })
//       );

//       // 3. WebAuthn
//       this.updateState("Please complete biometric scan...", false, true);
//       let attResp;
//       try {
//         attResp = await startRegistration({ optionsJSON: optsResponse });
//       } catch (error) {
//         throw new Error("Biometric cancelled or failed.");
//       }

//       // 4. Verify & Save
//       this.updateState("Saving to Blockchain...", false, true);
//       await firstValueFrom(
//         this.http.post(`${API_URL}/auth/register/verify`, {
//           dsId: formattedId,
//           body: attResp,
//           employeeData: finalEmployeeData
//         })
//       );

//       // 5. SUCCESS SWEET ALERT
//       this.ngZone.run(() => {
//         this.isLoading = false;
//         this.message = ''; 
        
//         Swal.fire({
//             title: 'Registration Successful!',
//             text: `${this.formData.name} has been added to the blockchain securely.`,
//             icon: 'success',
//             background: '#25242D',
//             color: '#ffffff',
//             confirmButtonColor: '#529F2D',
//             confirmButtonText: 'Great!'
//         });

//         this.clearForm();
//       });

//     } catch (err: any) {
//       this.ngZone.run(() => {
//         this.isLoading = false;
//         this.isError = true;
//         const msg = err.error?.error || err.message || "Unknown error";
//         this.message = msg.includes("already registered") ? "⚠️ ID already registered!" : msg;
        
//         Swal.fire({
//             title: 'Registration Failed',
//             text: this.message,
//             icon: 'error',
//             background: '#25242D',
//             color: '#ffffff',
//             confirmButtonColor: '#d33'
//         });
//       });
//     }
//   }
// }






// import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { LucideAngularModule, UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2 } from 'lucide-angular';
// import { firstValueFrom } from 'rxjs';
// import { startRegistration } from '@simplewebauthn/browser';

// const API_URL = 'http://localhost:3000';
// const IMAGE_HOSTING_KEY = "49c34f91f4f7457f0cb17f358b9e8b40";
// const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

// interface EmployeeRegistrationFormData {
//   photo: File | null;
//   name: string;
//   designation: string;
//   employeeId: string;
//   bloodGroup: string;
//   dateOfJoining: string;
//   issueDate: string;
// }

// @Component({
//   selector: 'app-register-employee',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule, HttpClientModule],
//   templateUrl: './register-employee.component.html',
//   styleUrls: ['./register-employee.component.css']
// })
// export class RegisterEmployeeComponent implements OnInit {
  
//   // Added Loader2 icon
//   readonly icons = { UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck, Loader2 };
  
//   formData: EmployeeRegistrationFormData = {
//     photo: null,
//     name: '',
//     designation: '',
//     employeeId: '',
//     bloodGroup: '',
//     dateOfJoining: '',
//     issueDate: '',
//   };

//   previewUrl: string | null = null;
//   bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
//   // UI State
//   message: string = '';
//   isError: boolean = false;
//   isLoading: boolean = false;
//   isImageLoading: boolean = false; // New: Image loading state

//   constructor(
//     private http: HttpClient,
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.formData.issueDate = new Date().toISOString().split('T')[0];
//   }

//   // --- 1. IMAGE HANDLING WITH PROGRESS ---
//   onFileChange(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.isImageLoading = true; // Start loading
//       this.formData.photo = file;
      
//       const reader = new FileReader();
//       reader.onload = () => { 
//         this.ngZone.run(() => {
//           this.previewUrl = reader.result as string;
//           this.isImageLoading = false; // Stop loading
//           this.cdr.detectChanges();
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   // --- 2 & 4. VALIDATION LOGIC ---
  
//   // Checks strict ID format: Starts with DS or INT (case insensitive), followed by exactly 5 digits.
//   get isIdValid(): boolean {
//     const id = this.formData.employeeId.toUpperCase();
//     const regex = /^(DS|INT)\d{5}$/;
//     return regex.test(id);
//   }

//   // Checks if the entire form is ready to submit
//   get isFormValid(): boolean {
//     return !!(
//       this.formData.name &&
//       this.formData.designation &&
//       this.formData.employeeId &&
//       this.isIdValid &&           // strict ID check
//       this.formData.bloodGroup &&
//       this.formData.dateOfJoining &&
//       this.formData.photo         // image required
//     );
//   }

//   private updateState(msg: string, error: boolean = false, loading: boolean = true) {
//     this.ngZone.run(() => {
//       this.message = msg;
//       this.isError = error;
//       this.isLoading = loading;
//       this.cdr.detectChanges();
//     });
//   }

//   clearForm() {
//     this.ngZone.run(() => {
//       this.formData = {
//         photo: null,
//         name: '',
//         designation: '',
//         employeeId: '',
//         bloodGroup: '',
//         dateOfJoining: '',
//         issueDate: new Date().toISOString().split('T')[0],
//       };
//       this.previewUrl = null;
//       this.message = '';
//       this.isLoading = false;
//       this.isError = false;

//       const fileInput = document.getElementById('photoInput') as HTMLInputElement;
//       if(fileInput) fileInput.value = '';
      
//       this.cdr.detectChanges();
//     });
//   }

//   async onSubmit() {
//     if (!this.isFormValid) {
//         this.updateState("❌ Please fill all fields correctly.", true, false);
//         return;
//     }

//     this.updateState("⏳ Processing Registration...", false, true);
//     let uploadedPhotoUrl = '';

//     try {
//       // --- STEP 1: UPLOAD IMAGE ---
//       if (this.formData.photo) {
//         this.updateState("📸 Uploading Profile Photo to ImgBB...", false, true);
        
//         const imageFormData = new FormData();
//         imageFormData.append('image', this.formData.photo);

//         const imgResponse: any = await firstValueFrom(
//           this.http.post(IMAGE_HOSTING_API, imageFormData)
//         );

//         if (imgResponse?.data?.url) {
//           uploadedPhotoUrl = imgResponse.data.url;
//         } else {
//           throw new Error("Failed to get image URL from ImgBB");
//         }
//       }

//       // Ensure ID is uppercase for consistency
//       const formattedId = this.formData.employeeId.toUpperCase();
      
//       const finalEmployeeData = { 
//         ...this.formData, 
//         dsId: formattedId, 
//         photoUrl: uploadedPhotoUrl 
//       };

//       // --- STEP 2: GET OPTIONS ---
//       this.updateState("🔐 Initializing Biometric Setup...", false, true);
      
//       const optsResponse: any = await firstValueFrom(
//         this.http.post(`${API_URL}/auth/register/options`, { 
//           dsId: formattedId 
//         })
//       );

//       // --- STEP 3: BROWSER WEBAUTHN ---
//       this.updateState("👆 Please complete biometric authentication...", false, true);
      
//       let attResp;
//       try {
//         attResp = await startRegistration({ optionsJSON: optsResponse });
//       } catch (error) {
//         throw new Error("Biometric cancelled or failed.");
//       }

//       // --- STEP 4: VERIFY ON SERVER ---
//       await this.ngZone.run(async () => {
//         this.message = "✅ Verifying and Saving to Blockchain...";
//         this.cdr.detectChanges();

//         await firstValueFrom(
//           this.http.post(`${API_URL}/auth/register/verify`, {
//             dsId: formattedId,
//             body: attResp,
//             employeeData: finalEmployeeData
//           })
//         );
//       });

//       // --- STEP 5: SUCCESS ---
//       this.ngZone.run(() => {
//         this.message = "🎉 Registration Complete & Saved to Blockchain!";
//         this.isError = false;
//         this.isLoading = false;
//         this.cdr.detectChanges();

//         setTimeout(() => {
//           this.clearForm();
//         }, 2500);
//       });

//     } catch (err: any) {
//       this.ngZone.run(() => {
//         this.isLoading = false;
//         this.isError = true;
        
//         // --- 3. BETTER ERROR MESSAGE PARSING ---
//         let errorMsg = "Unknown error occurred";
        
//         if (err.error && err.error.error) {
//             errorMsg = err.error.error; // Backend explicit message
//         } else if (err.message) {
//             errorMsg = err.message;
//         }

//         // Custom formatting for common errors
//         if (errorMsg.includes("already registered") || errorMsg.includes("duplicate")) {
//              errorMsg = "⚠️ This Employee ID is already registered!";
//         }

//         this.message = errorMsg;
//         this.cdr.detectChanges();
//         console.error("Registration Error:", err);
//       });
//     }
//   }
// }