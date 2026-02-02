import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
}

@Component({
  selector: 'app-add-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-candidate.component.html',
  styleUrls: ['./add-candidate.component.css']
})
export class AddCandidateComponent implements OnInit {
  // Mandatory Field
  candidateId = '';
  
  // Dynamic Custom Fields
  customFields: CustomField[] = [];
  customFieldValues: { [key: string]: string } = {};
  
  // Photo Upload
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  
  // State
  isLoading = false;
  isLoadingFields = true;
  errorMessage = '';
  successMessage = '';

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
    this.http.get<any>('http://localhost:3000/api/settings/candidate-fields', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.customFields = response.fields || [];
        this.isLoadingFields = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('✅ Loaded custom fields:', this.customFields);
      },
      error: (error) => {
        console.error('Failed to load custom fields:', error);
        this.errorMessage = 'Failed to load form configuration';
        this.isLoadingFields = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation: Candidate ID is mandatory
    if (!this.candidateId.trim()) {
      this.errorMessage = 'Candidate ID is required';
      return;
    }

    this.isLoading = true;

    try {
      // Step 1: Upload Photo (if selected)
      let photoUrl = '';
      if (this.selectedPhoto) {
        console.log('Uploading photo...');
        const imageFormData = new FormData();
        imageFormData.append('image', this.selectedPhoto);
        
        const imgResponse: any = await firstValueFrom(
          this.http.post(this.IMAGE_HOSTING_API, imageFormData)
        );
        
        photoUrl = imgResponse?.data?.url;
        if (!photoUrl) throw new Error('Image upload failed');
        
        console.log('Photo uploaded:', photoUrl);
      }

      // Step 2: Build candidate data object
      const candidateData: any = {
        candidateId: this.candidateId.trim()
      };

      // Add photo URL if uploaded
      if (photoUrl) {
        candidateData.photoUrl = photoUrl;
      }

      // Add all custom field values
      this.customFields.forEach(field => {
        const value = this.customFieldValues[field.fieldName];
        if (value && value.trim()) {
          candidateData[field.fieldName] = value.trim();
        }
      });

      console.log('Submitting candidate data:', candidateData);

      // Step 3: Submit to backend
      const response: any = await firstValueFrom(
        this.http.post('http://localhost:3000/api/candidates/add', candidateData, {
          withCredentials: true
        })
      );

      this.successMessage = 'Candidate added successfully!';
      this.isLoading = false;

      // Reset form
      setTimeout(() => {
        this.resetForm();
        this.router.navigate(['/org-dashboard']);
      }, 2000);

    } catch (error: any) {
      console.error('Add candidate error:', error);
      this.errorMessage = error.error?.error || error.message || 'Failed to add candidate';
      this.isLoading = false;
    }
  }

  resetForm() {
    this.candidateId = '';
    this.customFieldValues = {};
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  goBack() {
    this.router.navigate(['/org-dashboard']);
  }
}


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
//   selector: 'app-add-candidate',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './add-candidate.component.html',
//   styleUrls: ['./add-candidate.component.css']
// })
// export class AddCandidateComponent implements OnInit {
//   // Mandatory Field
//   candidateId = '';
  
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
//     this.http.get<any>('http://localhost:3000/api/settings/candidate-fields', {
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

//     // Validation: Candidate ID is mandatory
//     if (!this.candidateId.trim()) {
//       this.errorMessage = 'Candidate ID is required';
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

//       // Step 2: Build candidate data object
//       const candidateData: any = {
//         candidateId: this.candidateId.trim()
//       };

//       // Add photo URL if uploaded
//       if (photoUrl) {
//         candidateData.photoUrl = photoUrl;
//       }

//       // Add all custom field values
//       this.customFields.forEach(field => {
//         const value = this.customFieldValues[field.fieldName];
//         if (value && value.trim()) {
//           candidateData[field.fieldName] = value.trim();
//         }
//       });

//       console.log('Submitting candidate data:', candidateData);

//       // Step 3: Submit to backend
//       const response: any = await firstValueFrom(
//         this.http.post('http://localhost:3000/api/candidates/add', candidateData, {
//           withCredentials: true
//         })
//       );

//       this.successMessage = 'Candidate added successfully!';
//       this.isLoading = false;

//       // Reset form
//       setTimeout(() => {
//         this.resetForm();
//         this.router.navigate(['/org-dashboard']);
//       }, 2000);

//     } catch (error: any) {
//       console.error('Add candidate error:', error);
//       this.errorMessage = error.error?.error || error.message || 'Failed to add candidate';
//       this.isLoading = false;
//     }
//   }

//   resetForm() {
//     this.candidateId = '';
//     this.customFieldValues = {};
//     this.selectedPhoto = null;
//     this.photoPreview = null;
//   }

//   goBack() {
//     this.router.navigate(['/org-dashboard']);
//   }
// }