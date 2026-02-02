import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface CustomField {
  _id?: string;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
  displayOrder?: number;
}

@Component({
  selector: 'app-org-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './org-settings.component.html',
  styleUrls: ['./org-settings.component.css']
})
export class OrgSettingsComponent implements OnInit {
  // State
  candidateFields: CustomField[] = [];
  voterFields: CustomField[] = [];
  
  // New Field Forms
  newCandidateField: CustomField = { fieldName: '', fieldLabel: '', placeholder: '' };
  newVoterField: CustomField = { fieldName: '', fieldLabel: '', placeholder: '' };
  
  // Edit Mode
  editingCandidateField: CustomField | null = null;
  editingVoterField: CustomField | null = null;
  
  // Messages
  candidateMessage = '';
  voterMessage = '';
  candidateError = '';
  voterError = '';
  
  isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCandidateFields();
    this.loadVoterFields();
  }

  // ========== CANDIDATE FIELDS ==========

  loadCandidateFields() {
    this.http.get<any>('http://localhost:3000/api/settings/candidate-fields', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.candidateFields = response.fields || [];
        this.cdr.detectChanges(); // Force UI update
        console.log('✅ Loaded candidate fields:', this.candidateFields.length);
      },
      error: (error) => {
        console.error('Failed to load candidate fields:', error);
        this.candidateError = 'Failed to load candidate fields';
        this.cdr.detectChanges();
      }
    });
  }

  addCandidateField() {
    this.candidateError = '';
    this.candidateMessage = '';

    // Validation
    if (!this.newCandidateField.fieldName || !this.newCandidateField.fieldLabel) {
      this.candidateError = 'Field name and label are required';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:3000/api/settings/candidate-fields', this.newCandidateField, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.candidateMessage = 'Field added successfully!';
        this.newCandidateField = { fieldName: '', fieldLabel: '', placeholder: '' };
        this.isLoading = false;
        
        // Immediately reload fields and force UI update
        this.loadCandidateFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.candidateMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.candidateError = error.error?.error || 'Failed to add field';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEditCandidateField(field: CustomField) {
    this.editingCandidateField = { ...field };
    this.cdr.detectChanges();
  }

  cancelEditCandidateField() {
    this.editingCandidateField = null;
    this.cdr.detectChanges();
  }

  saveEditCandidateField() {
    if (!this.editingCandidateField) return;

    this.candidateError = '';
    this.candidateMessage = '';

    this.http.put<any>(
      `http://localhost:3000/api/settings/candidate-fields/${this.editingCandidateField._id}`,
      {
        fieldLabel: this.editingCandidateField.fieldLabel,
        placeholder: this.editingCandidateField.placeholder
      },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.candidateMessage = 'Field updated successfully!';
        this.editingCandidateField = null;
        
        // Reload and force update
        this.loadCandidateFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.candidateMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.candidateError = error.error?.error || 'Failed to update field';
        this.cdr.detectChanges();
      }
    });
  }

  deleteCandidateField(fieldId: string) {
    if (!confirm('Are you sure you want to delete this field?')) return;

    this.http.delete<any>(
      `http://localhost:3000/api/settings/candidate-fields/${fieldId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.candidateMessage = 'Field deleted successfully!';
        
        // Reload and force update
        this.loadCandidateFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.candidateMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.candidateError = error.error?.error || 'Failed to delete field';
        this.cdr.detectChanges();
      }
    });
  }

  // ========== VOTER FIELDS ==========

  loadVoterFields() {
    this.http.get<any>('http://localhost:3000/api/settings/voter-fields', {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.voterFields = response.fields || [];
        this.cdr.detectChanges(); // Force UI update
        console.log('✅ Loaded voter fields:', this.voterFields.length);
      },
      error: (error) => {
        console.error('Failed to load voter fields:', error);
        this.voterError = 'Failed to load voter fields';
        this.cdr.detectChanges();
      }
    });
  }

  addVoterField() {
    this.voterError = '';
    this.voterMessage = '';

    if (!this.newVoterField.fieldName || !this.newVoterField.fieldLabel) {
      this.voterError = 'Field name and label are required';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:3000/api/settings/voter-fields', this.newVoterField, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        this.voterMessage = 'Field added successfully!';
        this.newVoterField = { fieldName: '', fieldLabel: '', placeholder: '' };
        this.isLoading = false;
        
        // Immediately reload and force update
        this.loadVoterFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.voterMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.voterError = error.error?.error || 'Failed to add field';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEditVoterField(field: CustomField) {
    this.editingVoterField = { ...field };
    this.cdr.detectChanges();
  }

  cancelEditVoterField() {
    this.editingVoterField = null;
    this.cdr.detectChanges();
  }

  saveEditVoterField() {
    if (!this.editingVoterField) return;

    this.voterError = '';
    this.voterMessage = '';

    this.http.put<any>(
      `http://localhost:3000/api/settings/voter-fields/${this.editingVoterField._id}`,
      {
        fieldLabel: this.editingVoterField.fieldLabel,
        placeholder: this.editingVoterField.placeholder
      },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.voterMessage = 'Field updated successfully!';
        this.editingVoterField = null;
        
        // Reload and force update
        this.loadVoterFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.voterMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.voterError = error.error?.error || 'Failed to update field';
        this.cdr.detectChanges();
      }
    });
  }

  deleteVoterField(fieldId: string) {
    if (!confirm('Are you sure you want to delete this field?')) return;

    this.http.delete<any>(
      `http://localhost:3000/api/settings/voter-fields/${fieldId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.voterMessage = 'Field deleted successfully!';
        
        // Reload and force update
        this.loadVoterFields();
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.voterMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        this.voterError = error.error?.error || 'Failed to delete field';
        this.cdr.detectChanges();
      }
    });
  }

  // Navigation
  goBack() {
    this.router.navigate(['/org-dashboard']);
  }
}

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// interface CustomField {
//   _id?: string;
//   fieldName: string;
//   fieldLabel: string;
//   placeholder: string;
//   displayOrder?: number;
// }

// @Component({
//   selector: 'app-org-settings',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './org-settings.component.html',
//   styleUrls: ['./org-settings.component.css']
// })
// export class OrgSettingsComponent implements OnInit {
//   // State
//   candidateFields: CustomField[] = [];
//   voterFields: CustomField[] = [];
  
//   // New Field Forms
//   newCandidateField: CustomField = { fieldName: '', fieldLabel: '', placeholder: '' };
//   newVoterField: CustomField = { fieldName: '', fieldLabel: '', placeholder: '' };
  
//   // Edit Mode
//   editingCandidateField: CustomField | null = null;
//   editingVoterField: CustomField | null = null;
  
//   // Messages
//   candidateMessage = '';
//   voterMessage = '';
//   candidateError = '';
//   voterError = '';
  
//   isLoading = false;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadCandidateFields();
//     this.loadVoterFields();
//   }

//   // ========== CANDIDATE FIELDS ==========

//   loadCandidateFields() {
//     this.http.get<any>('http://localhost:3000/api/settings/candidate-fields', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.candidateFields = response.fields || [];
//       },
//       error: (error) => {
//         console.error('Failed to load candidate fields:', error);
//         this.candidateError = 'Failed to load candidate fields';
//       }
//     });
//   }

//   addCandidateField() {
//     this.candidateError = '';
//     this.candidateMessage = '';

//     // Validation
//     if (!this.newCandidateField.fieldName || !this.newCandidateField.fieldLabel) {
//       this.candidateError = 'Field name and label are required';
//       return;
//     }

//     this.isLoading = true;

//     this.http.post<any>('http://localhost:3000/api/settings/candidate-fields', this.newCandidateField, {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.candidateMessage = 'Field added successfully!';
//         this.newCandidateField = { fieldName: '', fieldLabel: '', placeholder: '' };
//         this.loadCandidateFields();
//         this.isLoading = false;
        
//         setTimeout(() => this.candidateMessage = '', 3000);
//       },
//       error: (error) => {
//         this.candidateError = error.error?.error || 'Failed to add field';
//         this.isLoading = false;
//       }
//     });
//   }

//   startEditCandidateField(field: CustomField) {
//     this.editingCandidateField = { ...field };
//   }

//   cancelEditCandidateField() {
//     this.editingCandidateField = null;
//   }

//   saveEditCandidateField() {
//     if (!this.editingCandidateField) return;

//     this.candidateError = '';
//     this.candidateMessage = '';

//     this.http.put<any>(
//       `http://localhost:3000/api/settings/candidate-fields/${this.editingCandidateField._id}`,
//       {
//         fieldLabel: this.editingCandidateField.fieldLabel,
//         placeholder: this.editingCandidateField.placeholder
//       },
//       { withCredentials: true }
//     ).subscribe({
//       next: (response) => {
//         this.candidateMessage = 'Field updated successfully!';
//         this.editingCandidateField = null;
//         this.loadCandidateFields();
        
//         setTimeout(() => this.candidateMessage = '', 3000);
//       },
//       error: (error) => {
//         this.candidateError = error.error?.error || 'Failed to update field';
//       }
//     });
//   }

//   deleteCandidateField(fieldId: string) {
//     if (!confirm('Are you sure you want to delete this field?')) return;

//     this.http.delete<any>(
//       `http://localhost:3000/api/settings/candidate-fields/${fieldId}`,
//       { withCredentials: true }
//     ).subscribe({
//       next: (response) => {
//         this.candidateMessage = 'Field deleted successfully!';
//         this.loadCandidateFields();
        
//         setTimeout(() => this.candidateMessage = '', 3000);
//       },
//       error: (error) => {
//         this.candidateError = error.error?.error || 'Failed to delete field';
//       }
//     });
//   }

//   // ========== VOTER FIELDS ==========

//   loadVoterFields() {
//     this.http.get<any>('http://localhost:3000/api/settings/voter-fields', {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.voterFields = response.fields || [];
//       },
//       error: (error) => {
//         console.error('Failed to load voter fields:', error);
//         this.voterError = 'Failed to load voter fields';
//       }
//     });
//   }

//   addVoterField() {
//     this.voterError = '';
//     this.voterMessage = '';

//     if (!this.newVoterField.fieldName || !this.newVoterField.fieldLabel) {
//       this.voterError = 'Field name and label are required';
//       return;
//     }

//     this.isLoading = true;

//     this.http.post<any>('http://localhost:3000/api/settings/voter-fields', this.newVoterField, {
//       withCredentials: true
//     }).subscribe({
//       next: (response) => {
//         this.voterMessage = 'Field added successfully!';
//         this.newVoterField = { fieldName: '', fieldLabel: '', placeholder: '' };
//         this.loadVoterFields();
//         this.isLoading = false;
        
//         setTimeout(() => this.voterMessage = '', 3000);
//       },
//       error: (error) => {
//         this.voterError = error.error?.error || 'Failed to add field';
//         this.isLoading = false;
//       }
//     });
//   }

//   startEditVoterField(field: CustomField) {
//     this.editingVoterField = { ...field };
//   }

//   cancelEditVoterField() {
//     this.editingVoterField = null;
//   }

//   saveEditVoterField() {
//     if (!this.editingVoterField) return;

//     this.voterError = '';
//     this.voterMessage = '';

//     this.http.put<any>(
//       `http://localhost:3000/api/settings/voter-fields/${this.editingVoterField._id}`,
//       {
//         fieldLabel: this.editingVoterField.fieldLabel,
//         placeholder: this.editingVoterField.placeholder
//       },
//       { withCredentials: true }
//     ).subscribe({
//       next: (response) => {
//         this.voterMessage = 'Field updated successfully!';
//         this.editingVoterField = null;
//         this.loadVoterFields();
        
//         setTimeout(() => this.voterMessage = '', 3000);
//       },
//       error: (error) => {
//         this.voterError = error.error?.error || 'Failed to update field';
//       }
//     });
//   }

//   deleteVoterField(fieldId: string) {
//     if (!confirm('Are you sure you want to delete this field?')) return;

//     this.http.delete<any>(
//       `http://localhost:3000/api/settings/voter-fields/${fieldId}`,
//       { withCredentials: true }
//     ).subscribe({
//       next: (response) => {
//         this.voterMessage = 'Field deleted successfully!';
//         this.loadVoterFields();
        
//         setTimeout(() => this.voterMessage = '', 3000);
//       },
//       error: (error) => {
//         this.voterError = error.error?.error || 'Failed to delete field';
//       }
//     });
//   }

//   // Navigation
//   goBack() {
//     this.router.navigate(['/org-dashboard']);
//   }
// }