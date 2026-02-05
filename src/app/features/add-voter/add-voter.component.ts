import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
}

@Component({
  selector: 'app-add-voter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-voter.component.html',
  styleUrls: ['./add-voter.component.css']
})
export class AddVoterComponent implements OnInit {
  // Mandatory Field
  voterId = '';
  
  // Dynamic Custom Fields
  customFields: CustomField[] = [];
  customFieldValues: { [key: string]: string } = {};
  
  // Photo Upload
  selectedPhoto: File | null = null;
  selectedFileName: string = '';
  photoPreview: string | null = null;
  
  // State
  isLoading = false;
  statusText = 'Processing...';
  isLoadingFields = true;

  // Image Hosting Config
  private IMAGE_HOSTING_KEY = '49c34f91f4f7457f0cb17f358b9e8b40';
  private IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${this.IMAGE_HOSTING_KEY}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCustomFields();
  }

  loadCustomFields() {
    this.isLoadingFields = true;
    this.http.get<any>('http://localhost:3000/api/settings/voter-fields', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.customFields = response.fields || [];
        this.isLoadingFields = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load custom fields:', error);
        this.isLoadingFields = false;
        Swal.fire('Error', 'Failed to load form configuration', 'error');
      }
    });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      this.selectedFileName = file.name;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
        this.cdr.detectChanges(); // Fix: Force UI update
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedPhoto = null;
    this.selectedFileName = '';
    this.photoPreview = null;
  }

  async onSubmit() {
    // Validation
    if (!this.voterId.trim()) {
      Swal.fire('Warning', 'Voter ID is required', 'warning');
      return;
    }

    this.isLoading = true;
    this.statusText = 'Starting registration...';

    try {
      let photoUrl = '';

      // Step 1: Upload Photo (if selected)
      if (this.selectedPhoto) {
        this.statusText = `Uploading ${this.selectedFileName}...`;
        const imageFormData = new FormData();
        imageFormData.append('image', this.selectedPhoto);
        
        const imgResponse: any = await firstValueFrom(
          this.http.post(this.IMAGE_HOSTING_API, imageFormData)
        );
        
        photoUrl = imgResponse?.data?.url;
        if (!photoUrl) throw new Error('Image upload failed');
      }

      // Step 2: Build voter data object
      this.statusText = 'Saving voter data...';
      const voterData: any = {
        voterId: this.voterId.trim()
      };

      if (photoUrl) voterData.photoUrl = photoUrl;

      // Add custom fields
      this.customFields.forEach(field => {
        const value = this.customFieldValues[field.fieldName];
        if (value && value.trim()) {
          voterData[field.fieldName] = value.trim();
        }
      });

      // Step 3: Submit to backend
      await firstValueFrom(
        this.http.post('http://localhost:3000/api/voters/register', voterData, {
          withCredentials: true
        })
      );

      this.isLoading = false;

      // Success Alert
      Swal.fire({
        title: 'Success!',
        text: 'Voter registered successfully.',
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Register Another'
      });

      // Reset form
      this.resetForm();

    } catch (error: any) {
      console.error('Register voter error:', error);
      this.isLoading = false;
      const msg = error.error?.error || error.message || 'Failed to register voter';
      Swal.fire('Error', msg, 'error');
    }
  }

  resetForm() {
    this.voterId = '';
    this.customFieldValues = {};
    this.selectedPhoto = null;
    this.selectedFileName = '';
    this.photoPreview = null;
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate(['/org-dashboard']);
  }
}


// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { firstValueFrom } from 'rxjs';

// interface CustomField {
//   _id: string;
//   fieldName: string;
//   fieldLabel: string;
//   placeholder: string;
// }

// @Component({
//   selector: 'app-add-voter',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './add-voter.component.html',
//   styleUrls: ['./add-voter.component.css']
// })
// export class AddVoterComponent implements OnInit {
//   // Mandatory Field
//   voterId = '';
  
//   // Dynamic Custom Fields
//   customFields: CustomField[] = [];
//   customFieldValues: { [key: string]: string } = {};
  
//   // Photo Upload
//   selectedPhoto: File | null = null;
//   photoPreview: string | null = null;
  
//   // State
//   isLoading = false;
//   isLoadingFields = true;
//   errorMessage = '';
//   successMessage = '';

//   // Image Hosting Config
//   private IMAGE_HOSTING_KEY = '49c34f91f4f7457f0cb17f358b9e8b40';
//   private IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${this.IMAGE_HOSTING_KEY}`;

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.loadCustomFields();
//   }

//   loadCustomFields() {
//     this.isLoadingFields = true;
//     this.http.get<any>('http://localhost:3000/api/settings/voter-fields', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.customFields = response.fields || [];
//         this.isLoadingFields = false;
//         this.cdr.detectChanges(); // Force change detection
//         console.log('✅ Loaded custom fields:', this.customFields);
//       },
//       error: (error) => {
//         console.error('Failed to load custom fields:', error);
//         this.errorMessage = 'Failed to load form configuration';
//         this.isLoadingFields = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   onPhotoSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedPhoto = file;
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         this.photoPreview = e.target.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   async onSubmit() {
//     this.errorMessage = '';
//     this.successMessage = '';

//     // Validation: Voter ID is mandatory
//     if (!this.voterId.trim()) {
//       this.errorMessage = 'Voter ID is required';
//       return;
//     }

//     this.isLoading = true;

//     try {
//       // Step 1: Upload Photo (if selected)
//       let photoUrl = '';
//       if (this.selectedPhoto) {
//         console.log('Uploading photo...');
//         const imageFormData = new FormData();
//         imageFormData.append('image', this.selectedPhoto);
        
//         const imgResponse: any = await firstValueFrom(
//           this.http.post(this.IMAGE_HOSTING_API, imageFormData)
//         );
        
//         photoUrl = imgResponse?.data?.url;
//         if (!photoUrl) throw new Error('Image upload failed');
        
//         console.log('Photo uploaded:', photoUrl);
//       }

//       // Step 2: Build voter data object
//       const voterData: any = {
//         voterId: this.voterId.trim()
//       };

//       // Add photo URL if uploaded
//       if (photoUrl) {
//         voterData.photoUrl = photoUrl;
//       }

//       // Add all custom field values
//       this.customFields.forEach(field => {
//         const value = this.customFieldValues[field.fieldName];
//         if (value && value.trim()) {
//           voterData[field.fieldName] = value.trim();
//         }
//       });

//       console.log('Submitting voter data:', voterData);

//       // Step 3: Submit to backend
//       const response: any = await firstValueFrom(
//         this.http.post('http://localhost:3000/api/voters/register', voterData, {
//           withCredentials: true
//         })
//       );

//       this.successMessage = 'Voter registered successfully!';
//       this.isLoading = false;

//       // Reset form
//       setTimeout(() => {
//         this.resetForm();
//         this.router.navigate(['/org-dashboard']);
//       }, 2000);

//     } catch (error: any) {
//       console.error('Register voter error:', error);
//       this.errorMessage = error.error?.error || error.message || 'Failed to register voter';
//       this.isLoading = false;
//     }
//   }

//   resetForm() {
//     this.voterId = '';
//     this.customFieldValues = {};
//     this.selectedPhoto = null;
//     this.photoPreview = null;
//   }

//   goBack() {
//     this.router.navigate(['/org-dashboard']);
//   }
// }





// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { firstValueFrom } from 'rxjs';

// interface CustomField {
//   _id: string;
//   fieldName: string;
//   fieldLabel: string;
//   placeholder: string;
// }

// @Component({
//   selector: 'app-add-voter',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './add-voter.component.html',
//   styleUrls: ['./add-voter.component.css']
// })
// export class AddVoterComponent implements OnInit {
//   // Mandatory Field
//   voterId = '';
  
//   // Dynamic Custom Fields
//   customFields: CustomField[] = [];
//   customFieldValues: { [key: string]: string } = {};
  
//   // Photo Upload
//   selectedPhoto: File | null = null;
//   photoPreview: string | null = null;
  
//   // State
//   isLoading = false;
//   errorMessage = '';
//   successMessage = '';

//   // Image Hosting Config
//   private IMAGE_HOSTING_KEY = '49c34f91f4f7457f0cb17f358b9e8b40';
//   private IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${this.IMAGE_HOSTING_KEY}`;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadCustomFields();
//   }

//   loadCustomFields() {
//     this.http.get<any>('http://localhost:3000/api/settings/voter-fields', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.customFields = response.fields || [];
//         console.log('Loaded custom fields:', this.customFields);
//       },
//       error: (error) => {
//         console.error('Failed to load custom fields:', error);
//         this.errorMessage = 'Failed to load form configuration';
//       }
//     });
//   }

//   onPhotoSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedPhoto = file;
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e: any) => {
//         this.photoPreview = e.target.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   async onSubmit() {
//     this.errorMessage = '';
//     this.successMessage = '';

//     // Validation: Voter ID is mandatory
//     if (!this.voterId.trim()) {
//       this.errorMessage = 'Voter ID is required';
//       return;
//     }

//     this.isLoading = true;

//     try {
//       // Step 1: Upload Photo (if selected)
//       let photoUrl = '';
//       if (this.selectedPhoto) {
//         console.log('Uploading photo...');
//         const imageFormData = new FormData();
//         imageFormData.append('image', this.selectedPhoto);
        
//         const imgResponse: any = await firstValueFrom(
//           this.http.post(this.IMAGE_HOSTING_API, imageFormData)
//         );
        
//         photoUrl = imgResponse?.data?.url;
//         if (!photoUrl) throw new Error('Image upload failed');
        
//         console.log('Photo uploaded:', photoUrl);
//       }

//       // Step 2: Build voter data object
//       const voterData: any = {
//         voterId: this.voterId.trim()
//       };

//       // Add photo URL if uploaded
//       if (photoUrl) {
//         voterData.photoUrl = photoUrl;
//       }

//       // Add all custom field values
//       this.customFields.forEach(field => {
//         const value = this.customFieldValues[field.fieldName];
//         if (value && value.trim()) {
//           voterData[field.fieldName] = value.trim();
//         }
//       });

//       console.log('Submitting voter data:', voterData);

//       // Step 3: Submit to backend
//       const response: any = await firstValueFrom(
//         this.http.post('http://localhost:3000/api/voters/register', voterData, {
//           withCredentials: true
//         })
//       );

//       this.successMessage = 'Voter registered successfully!';
//       this.isLoading = false;

//       // Reset form
//       setTimeout(() => {
//         this.resetForm();
//         this.router.navigate(['/org-dashboard']);
//       }, 2000);

//     } catch (error: any) {
//       console.error('Register voter error:', error);
//       this.errorMessage = error.error?.error || error.message || 'Failed to register voter';
//       this.isLoading = false;
//     }
//   }

//   resetForm() {
//     this.voterId = '';
//     this.customFieldValues = {};
//     this.selectedPhoto = null;
//     this.photoPreview = null;
//   }

//   goBack() {
//     this.router.navigate(['/org-dashboard']);
//   }
// }