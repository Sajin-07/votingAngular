import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck } from 'lucide-angular';

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
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './register-employee.component.html',
  styleUrls: ['./register-employee.component.css']
})
export class RegisterEmployeeComponent implements OnInit {
  // --- ASSETS & ICONS ---
  readonly icons = { UserPlus, X, CalendarDays, Droplets, BadgeCheck, ArrowRight, ShieldCheck };
  
  // --- STATE ---
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

  ngOnInit() {
    // Set Issue Date to Today
    this.formData.issueDate = new Date().toISOString().split('T')[0];
  }

  // --- HANDLERS ---
  
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.photo = file;

      // Generate Image Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearForm() {
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
    
    // Reset file input manually if needed (DOM manipulation) or just rely on state
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  onSubmit() {
    console.log('Form Submitted Data:', this.formData);
    // Add your API call here
    alert('Employee registered successfully (Check console)');
  }
}