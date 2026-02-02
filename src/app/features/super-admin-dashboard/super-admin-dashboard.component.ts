import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; 
import { SuperAdminService, RegistrationRequest, Tenant } from '../../core/services/super-admin.service';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  LogOut, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Server, 
  CreditCard, 
  Search, 
  Plus, 
  Ban, 
  Activity,
  User,
  MoreHorizontal
} from 'lucide-angular';

@Component({
  selector: 'app-super-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div 
      class="min-h-screen text-white font-sans selection:bg-[#529F2D]/30 selection:text-[#529F2D] relative overflow-x-hidden"
      [style.background]="'radial-gradient(circle at 24.1% 68.8%, rgb(50, 50, 50) 0%, rgb(0, 0, 0) 99.4%)'"
    >
      
      <div class="absolute inset-0 pointer-events-none opacity-30 fixed">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      <header class="sticky top-0 z-30 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <img [src]="logoImg" alt="DataSoft" class="h-8 w-auto" />
            <div class="h-6 w-px bg-white/10"></div>
            <span class="text-sm font-medium text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
              <lucide-icon [img]="icons.Shield" class="w-4 h-4 text-[#529F2D]"></lucide-icon>
              Super Admin
            </span>
          </div>
          
          <button (click)="logout()" 
            class="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#A1A1A1] hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 rounded-full transition-all duration-300">
            <span>Logout</span>
            <lucide-icon [img]="icons.LogOut" class="w-4 h-4 transition-transform group-hover:translate-x-1"></lucide-icon>
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        <section class="bg-[#00000054] rounded-2xl border border-[#3E3D45] shadow-[0px_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-[#3E3D45] flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-3">
                <lucide-icon [img]="icons.User" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
                Pending Requests
                <span *ngIf="pendingRequests.length > 0" class="flex h-2 w-2 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#529F2D] opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[#529F2D]"></span>
                </span>
              </h2>
              <p class="text-xs text-[#707070] mt-1 ml-8">Validate organizations before blockchain deployment</p>
            </div>
            
            <button (click)="loadData()" 
              class="p-2 text-[#A1A1A1] hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Refresh">
              <lucide-icon [img]="icons.RefreshCw" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 text-[#707070] text-[10px] uppercase tracking-widest font-bold">
                  <th class="px-6 py-4">Organization</th>
                  <th class="px-6 py-4">Plan Details</th>
                  <th class="px-6 py-4">Payment Status</th>
                  <th class="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3E3D45]">
                <tr *ngFor="let req of pendingRequests" class="hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-white font-medium text-sm">{{ req.orgName }}</span>
                      <span class="text-xs text-[#A1A1A1] font-mono mt-0.5">{{ req.adminEmail }}</span>
                      <span class="mt-2 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3E3D45] text-[#A1A1A1]">
                        {{ req.orgType }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="icons.Server" class="w-4 h-4 text-[#529F2D]"></lucide-icon>
                      <span class="text-sm text-gray-300">{{ req.selectedPlan?.name || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'text-[#529F2D] bg-[#529F2D]/10 border-[#529F2D]/20': req.paymentStatus === 'PAID',
                      'text-amber-400 bg-amber-500/10 border-amber-500/20': req.paymentStatus !== 'PAID'
                    }" class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border inline-flex items-center gap-2">
                      <lucide-icon 
                        [img]="req.paymentStatus === 'PAID' ? icons.CheckCircle : icons.AlertCircle" 
                        class="w-3 h-3">
                      </lucide-icon>
                      {{ req.paymentStatus }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button *ngIf="req.paymentStatus === 'PAID'" 
                            (click)="initiateApproval(req)" 
                            class="relative overflow-hidden group/btn bg-gradient-to-r from-[#529F2D] to-[#264d14] hover:from-[#62bf36] hover:to-[#2e5e18] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg shadow-[#529F2D]/20 transition-all active:scale-95">
                      <span class="relative z-10 flex items-center gap-2">
                        Approve <lucide-icon [img]="icons.CheckCircle" class="w-3.5 h-3.5"></lucide-icon>
                      </span>
                    </button>
                    <span *ngIf="req.paymentStatus !== 'PAID'" class="text-xs text-[#707070] italic flex items-center justify-end gap-1">
                      <lucide-icon [img]="icons.CreditCard" class="w-3 h-3"></lucide-icon> Awaiting Payment
                    </span>
                  </td>
                </tr>
                <tr *ngIf="pendingRequests.length === 0">
                  <td colspan="4" class="px-6 py-16 text-center text-[#707070] flex flex-col items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <lucide-icon [img]="icons.Search" class="w-8 h-8 opacity-50"></lucide-icon>
                    </div>
                    No pending requests found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-[#00000054] rounded-2xl border border-[#3E3D45] shadow-[0px_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-[#3E3D45]">
            <h2 class="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-3">
              <lucide-icon [img]="icons.Activity" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
              Active Blockchain Nodes
            </h2>
            <p class="text-xs text-[#707070] mt-1 ml-8">Live tenants currently writing to the ledger</p>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-white/5 text-[#707070] text-[10px] uppercase tracking-widest font-bold">
                  <th class="px-6 py-4">Tenant Identity</th>
                  <th class="px-6 py-4">Node Status</th>
                  <th class="px-6 py-4">Capacity (Admins)</th>
                  <th class="px-6 py-4 text-right">Governance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3E3D45]">
                <tr *ngFor="let t of tenants" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <span class="font-mono text-[#529F2D] text-xs bg-[#529F2D]/10 px-2 py-1 rounded border border-[#529F2D]/30">
                      {{ t.tenantId }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'text-[#529F2D]': t.status === 'ACTIVE',
                      'text-red-400': t.status === 'BANNED',
                      'text-amber-400': t.status === 'SUSPENDED'
                    }" class="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span class="relative flex h-2 w-2">
                        <span *ngIf="t.status === 'ACTIVE'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#529F2D] opacity-75"></span>
                        <span [ngClass]="{
                          'bg-[#529F2D]': t.status === 'ACTIVE',
                          'bg-red-500': t.status === 'BANNED',
                          'bg-amber-400': t.status === 'SUSPENDED'
                        }" class="relative inline-flex rounded-full h-2 w-2"></span>
                      </span>
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-[#A1A1A1]">
                    <div class="flex items-center gap-3">
                      <div class="w-24 bg-[#1D1C23] rounded-full h-1.5 overflow-hidden border border-[#3E3D45]">
                        <div class="bg-[#529F2D] h-1.5 rounded-full transition-all duration-500" 
                             [style.width.%]="(t.currentAdmins / t.maxAdmins) * 100"></div>
                      </div>
                      <span class="text-[10px] font-mono">{{ t.currentAdmins }}/{{ t.maxAdmins }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button *ngIf="t.status !== 'BANNED'" (click)="updateStatus(t.tenantId, 'BANNED')" 
                      class="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1.5 rounded border border-red-900/50 hover:border-red-800 transition-colors flex items-center gap-1 inline-flex">
                      <lucide-icon [img]="icons.Ban" class="w-3 h-3"></lucide-icon> Ban Access
                    </button>
                    <button *ngIf="t.status === 'BANNED'" (click)="updateStatus(t.tenantId, 'ACTIVE')" 
                      class="text-[10px] font-bold uppercase tracking-wider text-[#529F2D] hover:text-[#62bf36] hover:bg-[#529F2D]/10 px-3 py-1.5 rounded border border-[#529F2D]/30 hover:border-[#529F2D]/50 transition-colors flex items-center gap-1 inline-flex">
                      <lucide-icon [img]="icons.CheckCircle" class="w-3 h-3"></lucide-icon> Reactivate
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <div *ngIf="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" (click)="closeModal()"></div>
        
        <div class="relative bg-[#1a1a1a] rounded-2xl border border-[#3E3D45] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
          
          <div class="px-6 py-6 border-b border-[#3E3D45] bg-[#141414]">
            <h3 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <lucide-icon [img]="icons.Plus" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
              Provision Organization
            </h3>
            <p class="text-xs text-[#707070] uppercase tracking-wide">Initialize a new tenant ID on the blockchain ledger.</p>
          </div>
          
          <div class="px-6 py-6">
            <div class="bg-[#00000033] rounded-xl p-4 border border-[#3E3D45] mb-6 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-[#707070]">Organization Name</span>
                <span class="text-white font-medium">{{ selectedRequest?.orgName }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-[#707070]">Administrator</span>
                <span class="text-[#529F2D] font-mono text-xs">{{ selectedRequest?.adminEmail }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
                <lucide-icon [img]="icons.Shield" class="w-3 h-3"></lucide-icon> Assign Tenant ID
              </label>
              
              <div class="relative">
                <input type="text" 
                  [(ngModel)]="manualTenantId" 
                  (ngModelChange)="validateTenantId()" 
                  placeholder="e.g. UAP_CSE_2026" 
                  [disabled]="isProcessing"
                  (keyup.enter)="!isIdTaken && confirmApproval()"
                  [ngClass]="{
                    'border-red-500 text-red-400 focus:border-red-500 focus:ring-red-500/30': isIdTaken,
                    'border-[#3E3D45] focus:border-[#529F2D] focus:ring-[#529F2D]/30': !isIdTaken
                  }"
                  class="w-full bg-[#00000033] text-white placeholder-[#707070] border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 font-mono transition-all disabled:opacity-50">
                  
                <div *ngIf="isIdTaken" class="absolute right-3 top-3.5 text-red-500 animate-in fade-in">
                  <lucide-icon [img]="icons.XCircle" class="w-5 h-5"></lucide-icon>
                </div>
              </div>

              <p *ngIf="!isIdTaken" class="text-[10px] text-[#707070] mt-1">Must be unique and adhere to blockchain naming conventions.</p>
              <p *ngIf="isIdTaken" class="text-[10px] text-red-400 mt-1 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <lucide-icon [img]="icons.AlertCircle" class="w-3 h-3"></lucide-icon>
                This Tenant ID is already in use by another organization.
              </p>
            </div>

            <div *ngIf="errorMsg" class="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <lucide-icon [img]="icons.AlertCircle" class="w-4 h-4"></lucide-icon>
              {{ errorMsg }}
            </div>
          </div>

          <div class="px-6 py-4 bg-[#141414] flex justify-end gap-3 border-t border-[#3E3D45]">
            <button (click)="closeModal()" 
              [disabled]="isProcessing"
              class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#707070] hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button (click)="confirmApproval()" 
              [disabled]="isProcessing || !manualTenantId || isIdTaken" 
              class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#529F2D] to-[#264d14] hover:from-[#62bf36] hover:to-[#2e5e18] disabled:from-[#3E3D45] disabled:to-[#3E3D45] disabled:text-[#707070] disabled:cursor-not-allowed rounded-lg shadow-lg transition-all flex items-center gap-2">
              <lucide-icon *ngIf="isProcessing" [img]="icons.RefreshCw" class="w-4 h-4 animate-spin"></lucide-icon>
              {{ isProcessing ? 'Provisioning...' : 'Deploy Tenant' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [] // Tailwind handles all styling
})

export class SuperDashboardComponent implements OnInit {
  logoImg = '/dataSoft.svg';
  
  // Icon Registry
  readonly icons = {
    LayoutDashboard, LogOut, RefreshCw, Shield, CheckCircle, 
    XCircle, AlertCircle, Server, CreditCard, Search, Plus, 
    Ban, Activity, User, MoreHorizontal
  };

  pendingRequests: RegistrationRequest[] = [];
  tenants: Tenant[] = [];
  
  // Modal State
  showApprovalModal = false;
  selectedRequest: RegistrationRequest | null = null;
  manualTenantId = '';
  isProcessing = false;
  errorMsg = '';
  
  // Validation State
  isIdTaken = false; // New flag to track if ID exists

  constructor(private api: SuperAdminService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getPendingRequests().subscribe({
      next: (data) => this.pendingRequests = data,
      error: (err) => this.showToast('Failed to load pending requests', 'error')
    });

    this.api.getAllTenants().subscribe({
      next: (data) => this.tenants = data,
      error: (err) => this.showToast('Failed to load active tenants', 'error')
    });
  }

  // --- APPROVAL LOGIC ---

  initiateApproval(req: RegistrationRequest) {
    this.selectedRequest = req;
    this.manualTenantId = ''; 
    this.errorMsg = '';
    this.isIdTaken = false; // Reset validation state
    this.showApprovalModal = true;
  }

  // New Validation Method
  validateTenantId() {
    if (!this.manualTenantId) {
      this.isIdTaken = false;
      return;
    }

    // Normalize input (trim & lowercase) for accurate comparison
    const normalizedInput = this.manualTenantId.trim().toLowerCase();

    // Check if any existing tenant has this ID (Client-side check)
    this.isIdTaken = this.tenants.some(t => 
      t.tenantId.toLowerCase() === normalizedInput
    );
  }

  closeModal() {
    if (this.isProcessing) return; 
    this.showApprovalModal = false;
    this.selectedRequest = null;
    this.isIdTaken = false;
  }

  // confirmApproval() {
  //   // Prevent submission if ID is taken
  //   if (this.isIdTaken) return;
  //   if (!this.selectedRequest || !this.manualTenantId) return;

  //   this.isProcessing = true;
  //   this.errorMsg = '';

  //   this.api.approveRequest(this.selectedRequest._id, this.manualTenantId).subscribe({
  //     next: (res) => {
  //       this.isProcessing = false;
  //       this.showApprovalModal = false; 
  //       this.selectedRequest = null;
  //       this.loadData(); 

  //       // Update SweetAlert to match Dark Theme
  //       Swal.fire({
  //         title: 'Deployment Successful!',
  //         html: `<span class="text-gray-300">Tenant <b>${this.manualTenantId}</b> is now live on the blockchain.</span>`,
  //         icon: 'success',
  //         background: '#1a1a1a', 
  //         color: '#ffffff',
  //         confirmButtonColor: '#529F2D', 
  //         confirmButtonText: 'Excellent',
  //         customClass: {
  //           popup: 'border border-[#3E3D45] rounded-xl shadow-2xl'
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       this.isProcessing = false;
  //       this.errorMsg = err.error?.error || 'Provisioning sequence failed.';
  //     }
  //   });
  // }

  // --- STATUS LOGIC ---
 
  confirmApproval() {
    // Prevent submission if ID is taken
    if (this.isIdTaken) return;
    if (!this.selectedRequest || !this.manualTenantId) return;

    this.isProcessing = true;
    this.errorMsg = '';

    this.api.approveRequest(this.selectedRequest._id, this.manualTenantId).subscribe({
      next: (res) => {
        // 1. Update State
        this.isProcessing = false;
        this.showApprovalModal = false; // This should close the modal
        this.selectedRequest = null;
        this.loadData(); 

        // 2. FORCE VIEW UPDATE (Critical Fix)
        // This ensures the modal is physically removed from the DOM 
        // *before* the SweetAlert pops up or user interacts with it.
        this.cdr.detectChanges(); 

        // 3. Show Success Alert
        Swal.fire({
          title: 'Deployment Successful!',
          html: `<span class="text-gray-300">Tenant <b>${this.manualTenantId}</b> is now live on the blockchain.</span>`,
          icon: 'success',
          background: '#1a1a1a', 
          color: '#ffffff',
          confirmButtonColor: '#529F2D', 
          confirmButtonText: 'Excellent',
          customClass: {
            popup: 'border border-[#3E3D45] rounded-xl shadow-2xl'
          }
        });
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMsg = err.error?.error || 'Provisioning sequence failed.';
        this.cdr.detectChanges(); // Force update for errors too
      }
    });
  }
  updateStatus(tenantId: string, newStatus: string) {
    const isBan = newStatus === 'BANNED';
    
    Swal.fire({
      title: isBan ? 'Revoke Access?' : 'Restore Access?',
      text: isBan 
        ? `This will immediately block all transactions for ${tenantId}.` 
        : `This will allow ${tenantId} to write to the ledger again.`,
      icon: isBan ? 'warning' : 'info',
      showCancelButton: true,
      background: '#1a1a1a',
      color: '#ffffff',
      confirmButtonColor: isBan ? '#e11d48' : '#529F2D',
      cancelButtonColor: '#3E3D45',
      confirmButtonText: isBan ? 'Yes, Ban Tenant' : 'Yes, Activate',
      customClass: {
        popup: 'border border-[#3E3D45] rounded-xl shadow-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.setTenantStatus(tenantId, newStatus).subscribe({
          next: () => {
            this.loadData();
            this.showToast(`Tenant status updated to ${newStatus}`, 'success');
          },
          error: () => this.showToast('Failed to update status', 'error')
        });
      }
    });
  }

  showToast(title: string, icon: 'success' | 'error' | 'warning') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#1a1a1a', 
      color: '#ffffff',
      customClass: {
        popup: 'rounded-xl border border-[#3E3D45] shadow-xl',
        timerProgressBar: 'bg-[#529F2D]'
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({ icon, title });
  }

  logout() {
    Swal.fire({
      title: 'Logging out...',
      timer: 800,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#ffffff',
      willClose: () => {
        window.location.href = '/super-login';
      }
    });
  }
}



// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2'; 
// import { SuperAdminService, RegistrationRequest, Tenant } from '../../core/services/super-admin.service';
// import { 
//   LucideAngularModule, 
//   LayoutDashboard, 
//   LogOut, 
//   RefreshCw, 
//   Shield, 
//   CheckCircle, 
//   XCircle, 
//   AlertCircle, 
//   Server, 
//   CreditCard, 
//   Search, 
//   Plus, 
//   Ban, 
//   Activity,
//   User,
//   MoreHorizontal
// } from 'lucide-angular';

// @Component({
//   selector: 'app-super-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule, LucideAngularModule],
//   template: `
//     <div 
//       class="min-h-screen text-white font-sans selection:bg-[#529F2D]/30 selection:text-[#529F2D] relative overflow-x-hidden"
//       [style.background]="'radial-gradient(circle at 24.1% 68.8%, rgb(50, 50, 50) 0%, rgb(0, 0, 0) 99.4%)'"
//     >
      
//       <div class="absolute inset-0 pointer-events-none opacity-30 fixed">
//         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <filter id="glow">
//               <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
//               <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
//             </filter>
//           </defs>
//         </svg>
//       </div>

//       <header class="sticky top-0 z-30 border-b border-white/5 bg-black/20 backdrop-blur-xl">
//         <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div class="flex items-center gap-4">
//             <img [src]="logoImg" alt="DataSoft" class="h-8 w-auto" />
//             <div class="h-6 w-px bg-white/10"></div>
//             <span class="text-sm font-medium text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
//               <lucide-icon [img]="icons.Shield" class="w-4 h-4 text-[#529F2D]"></lucide-icon>
//               Super Admin
//             </span>
//           </div>
          
//           <button (click)="logout()" 
//             class="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#A1A1A1] hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 rounded-full transition-all duration-300">
//             <span>Logout</span>
//             <lucide-icon [img]="icons.LogOut" class="w-4 h-4 transition-transform group-hover:translate-x-1"></lucide-icon>
//           </button>
//         </div>
//       </header>

//       <main class="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
//         <section class="bg-[#00000054] rounded-2xl border border-[#3E3D45] shadow-[0px_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden">
//           <div class="px-6 py-5 border-b border-[#3E3D45] flex justify-between items-center">
//             <div>
//               <h2 class="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-3">
//                 <lucide-icon [img]="icons.User" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
//                 Pending Requests
//                 <span *ngIf="pendingRequests.length > 0" class="flex h-2 w-2 relative">
//                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#529F2D] opacity-75"></span>
//                   <span class="relative inline-flex rounded-full h-2 w-2 bg-[#529F2D]"></span>
//                 </span>
//               </h2>
//               <p class="text-xs text-[#707070] mt-1 ml-8">Validate organizations before blockchain deployment</p>
//             </div>
            
//             <button (click)="loadData()" 
//               class="p-2 text-[#A1A1A1] hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Refresh">
//               <lucide-icon [img]="icons.RefreshCw" class="w-5 h-5"></lucide-icon>
//             </button>
//           </div>

//           <div class="overflow-x-auto">
//             <table class="w-full text-left border-collapse">
//               <thead>
//                 <tr class="bg-white/5 text-[#707070] text-[10px] uppercase tracking-widest font-bold">
//                   <th class="px-6 py-4">Organization</th>
//                   <th class="px-6 py-4">Plan Details</th>
//                   <th class="px-6 py-4">Payment Status</th>
//                   <th class="px-6 py-4 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody class="divide-y divide-[#3E3D45]">
//                 <tr *ngFor="let req of pendingRequests" class="hover:bg-white/5 transition-colors group">
//                   <td class="px-6 py-4">
//                     <div class="flex flex-col">
//                       <span class="text-white font-medium text-sm">{{ req.orgName }}</span>
//                       <span class="text-xs text-[#A1A1A1] font-mono mt-0.5">{{ req.adminEmail }}</span>
//                       <span class="mt-2 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3E3D45] text-[#A1A1A1]">
//                         {{ req.orgType }}
//                       </span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4">
//                     <div class="flex items-center gap-2">
//                       <lucide-icon [img]="icons.Server" class="w-4 h-4 text-[#529F2D]"></lucide-icon>
//                       <span class="text-sm text-gray-300">{{ req.selectedPlan?.name || 'N/A' }}</span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4">
//                     <span [ngClass]="{
//                       'text-[#529F2D] bg-[#529F2D]/10 border-[#529F2D]/20': req.paymentStatus === 'PAID',
//                       'text-amber-400 bg-amber-500/10 border-amber-500/20': req.paymentStatus !== 'PAID'
//                     }" class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border inline-flex items-center gap-2">
//                       <lucide-icon 
//                         [img]="req.paymentStatus === 'PAID' ? icons.CheckCircle : icons.AlertCircle" 
//                         class="w-3 h-3">
//                       </lucide-icon>
//                       {{ req.paymentStatus }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4 text-right">
//                     <button *ngIf="req.paymentStatus === 'PAID'" 
//                             (click)="initiateApproval(req)" 
//                             class="relative overflow-hidden group/btn bg-gradient-to-r from-[#529F2D] to-[#264d14] hover:from-[#62bf36] hover:to-[#2e5e18] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg shadow-[#529F2D]/20 transition-all active:scale-95">
//                       <span class="relative z-10 flex items-center gap-2">
//                         Approve <lucide-icon [img]="icons.CheckCircle" class="w-3.5 h-3.5"></lucide-icon>
//                       </span>
//                     </button>
//                     <span *ngIf="req.paymentStatus !== 'PAID'" class="text-xs text-[#707070] italic flex items-center justify-end gap-1">
//                       <lucide-icon [img]="icons.CreditCard" class="w-3 h-3"></lucide-icon> Awaiting Payment
//                     </span>
//                   </td>
//                 </tr>
//                 <tr *ngIf="pendingRequests.length === 0">
//                   <td colspan="4" class="px-6 py-16 text-center text-[#707070] flex flex-col items-center justify-center">
//                     <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
//                       <lucide-icon [img]="icons.Search" class="w-8 h-8 opacity-50"></lucide-icon>
//                     </div>
//                     No pending requests found.
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </section>

//         <section class="bg-[#00000054] rounded-2xl border border-[#3E3D45] shadow-[0px_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden">
//           <div class="px-6 py-5 border-b border-[#3E3D45]">
//             <h2 class="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-3">
//               <lucide-icon [img]="icons.Activity" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
//               Active Blockchain Nodes
//             </h2>
//             <p class="text-xs text-[#707070] mt-1 ml-8">Live tenants currently writing to the ledger</p>
//           </div>
          
//           <div class="overflow-x-auto">
//             <table class="w-full text-left">
//               <thead>
//                 <tr class="bg-white/5 text-[#707070] text-[10px] uppercase tracking-widest font-bold">
//                   <th class="px-6 py-4">Tenant Identity</th>
//                   <th class="px-6 py-4">Node Status</th>
//                   <th class="px-6 py-4">Capacity (Admins)</th>
//                   <th class="px-6 py-4 text-right">Governance</th>
//                 </tr>
//               </thead>
//               <tbody class="divide-y divide-[#3E3D45]">
//                 <tr *ngFor="let t of tenants" class="hover:bg-white/5 transition-colors">
//                   <td class="px-6 py-4">
//                     <span class="font-mono text-[#529F2D] text-xs bg-[#529F2D]/10 px-2 py-1 rounded border border-[#529F2D]/30">
//                       {{ t.tenantId }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4">
//                     <span [ngClass]="{
//                       'text-[#529F2D]': t.status === 'ACTIVE',
//                       'text-red-400': t.status === 'BANNED',
//                       'text-amber-400': t.status === 'SUSPENDED'
//                     }" class="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
//                       <span class="relative flex h-2 w-2">
//                         <span *ngIf="t.status === 'ACTIVE'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#529F2D] opacity-75"></span>
//                         <span [ngClass]="{
//                           'bg-[#529F2D]': t.status === 'ACTIVE',
//                           'bg-red-500': t.status === 'BANNED',
//                           'bg-amber-400': t.status === 'SUSPENDED'
//                         }" class="relative inline-flex rounded-full h-2 w-2"></span>
//                       </span>
//                       {{ t.status }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4 text-sm text-[#A1A1A1]">
//                     <div class="flex items-center gap-3">
//                       <div class="w-24 bg-[#1D1C23] rounded-full h-1.5 overflow-hidden border border-[#3E3D45]">
//                         <div class="bg-[#529F2D] h-1.5 rounded-full transition-all duration-500" 
//                              [style.width.%]="(t.currentAdmins / t.maxAdmins) * 100"></div>
//                       </div>
//                       <span class="text-[10px] font-mono">{{ t.currentAdmins }}/{{ t.maxAdmins }}</span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4 text-right space-x-2">
//                     <button *ngIf="t.status !== 'BANNED'" (click)="updateStatus(t.tenantId, 'BANNED')" 
//                       class="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1.5 rounded border border-red-900/50 hover:border-red-800 transition-colors flex items-center gap-1 inline-flex">
//                       <lucide-icon [img]="icons.Ban" class="w-3 h-3"></lucide-icon> Ban Access
//                     </button>
//                     <button *ngIf="t.status === 'BANNED'" (click)="updateStatus(t.tenantId, 'ACTIVE')" 
//                       class="text-[10px] font-bold uppercase tracking-wider text-[#529F2D] hover:text-[#62bf36] hover:bg-[#529F2D]/10 px-3 py-1.5 rounded border border-[#529F2D]/30 hover:border-[#529F2D]/50 transition-colors flex items-center gap-1 inline-flex">
//                       <lucide-icon [img]="icons.CheckCircle" class="w-3 h-3"></lucide-icon> Reactivate
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </section>

//       </main>

//       <div *ngIf="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" (click)="closeModal()"></div>
        
//         <div class="relative bg-[#1a1a1a] rounded-2xl border border-[#3E3D45] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
          
//           <div class="px-6 py-6 border-b border-[#3E3D45] bg-[#141414]">
//             <h3 class="text-xl font-bold text-white mb-1 flex items-center gap-2">
//               <lucide-icon [img]="icons.Plus" class="w-5 h-5 text-[#529F2D]"></lucide-icon>
//               Provision Organization
//             </h3>
//             <p class="text-xs text-[#707070] uppercase tracking-wide">Initialize a new tenant ID on the blockchain ledger.</p>
//           </div>
          
//           <div class="px-6 py-6">
//             <div class="bg-[#00000033] rounded-xl p-4 border border-[#3E3D45] mb-6 space-y-2">
//               <div class="flex justify-between text-sm">
//                 <span class="text-[#707070]">Organization Name</span>
//                 <span class="text-white font-medium">{{ selectedRequest?.orgName }}</span>
//               </div>
//               <div class="flex justify-between text-sm">
//                 <span class="text-[#707070]">Administrator</span>
//                 <span class="text-[#529F2D] font-mono text-xs">{{ selectedRequest?.adminEmail }}</span>
//               </div>
//             </div>

//             <div class="space-y-2">
//               <label class="block text-xs font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
//                 <lucide-icon [img]="icons.Shield" class="w-3 h-3"></lucide-icon> Assign Tenant ID
//               </label>
//               <div class="relative">
//                 <input type="text" [(ngModel)]="manualTenantId" 
//                   placeholder="e.g. UAP_CSE_2026" 
//                   [disabled]="isProcessing"
//                   (keyup.enter)="confirmApproval()"
//                   class="w-full bg-[#00000033] text-white placeholder-[#707070] border border-[#3E3D45] rounded-xl px-4 py-3 focus:outline-none focus:border-[#529F2D] focus:ring-1 focus:ring-[#529F2D]/30 font-mono transition-all disabled:opacity-50">
//               </div>
//               <p class="text-[10px] text-[#707070] mt-1">Must be unique and adhere to blockchain naming conventions.</p>
//             </div>

//             <div *ngIf="errorMsg" class="mt-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
//               <lucide-icon [img]="icons.AlertCircle" class="w-4 h-4"></lucide-icon>
//               {{ errorMsg }}
//             </div>
//           </div>

//           <div class="px-6 py-4 bg-[#141414] flex justify-end gap-3 border-t border-[#3E3D45]">
//             <button (click)="closeModal()" 
//               [disabled]="isProcessing"
//               class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#707070] hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
//               Cancel
//             </button>
//             <button (click)="confirmApproval()" 
//               [disabled]="isProcessing || !manualTenantId" 
//               class="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#529F2D] to-[#264d14] hover:from-[#62bf36] hover:to-[#2e5e18] disabled:from-[#3E3D45] disabled:to-[#3E3D45] disabled:text-[#707070] rounded-lg shadow-lg transition-all flex items-center gap-2">
//               <lucide-icon *ngIf="isProcessing" [img]="icons.RefreshCw" class="w-4 h-4 animate-spin"></lucide-icon>
//               {{ isProcessing ? 'Provisioning...' : 'Deploy Tenant' }}
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   `,
//   styles: [] // Tailwind handles all styling
// })
// export class SuperDashboardComponent implements OnInit {
//   logoImg = '/dataSoft.svg';
  
//   // Icon Registry
//   readonly icons = {
//     LayoutDashboard, LogOut, RefreshCw, Shield, CheckCircle, 
//     XCircle, AlertCircle, Server, CreditCard, Search, Plus, 
//     Ban, Activity, User, MoreHorizontal
//   };

//   pendingRequests: RegistrationRequest[] = [];
//   tenants: Tenant[] = [];
  
//   // Modal State
//   showApprovalModal = false;
//   selectedRequest: RegistrationRequest | null = null;
//   manualTenantId = '';
//   isProcessing = false;
//   errorMsg = '';

//   constructor(private api: SuperAdminService) {}

//   ngOnInit() {
//     this.loadData();
//   }

//   loadData() {
//     this.api.getPendingRequests().subscribe({
//       next: (data) => this.pendingRequests = data,
//       error: (err) => this.showToast('Failed to load pending requests', 'error')
//     });

//     this.api.getAllTenants().subscribe({
//       next: (data) => this.tenants = data,
//       error: (err) => this.showToast('Failed to load active tenants', 'error')
//     });
//   }

//   // --- APPROVAL LOGIC ---

//   initiateApproval(req: RegistrationRequest) {
//     this.selectedRequest = req;
//     this.manualTenantId = ''; 
//     this.errorMsg = '';
//     this.showApprovalModal = true;
//   }

//   closeModal() {
//     if (this.isProcessing) return; 
//     this.showApprovalModal = false;
//     this.selectedRequest = null;
//   }

//   confirmApproval() {
//     if (!this.selectedRequest || !this.manualTenantId) return;

//     this.isProcessing = true;
//     this.errorMsg = '';

//     this.api.approveRequest(this.selectedRequest._id, this.manualTenantId).subscribe({
//       next: (res) => {
//         this.isProcessing = false;
//         this.showApprovalModal = false; 
//         this.selectedRequest = null;
//         this.loadData(); 

//         // Update SweetAlert to match Dark Theme
//         Swal.fire({
//           title: 'Deployment Successful!',
//           html: `<span class="text-gray-300">Tenant <b>${this.manualTenantId}</b> is now live on the blockchain.</span>`,
//           icon: 'success',
//           background: '#1a1a1a', // Dark Gray
//           color: '#ffffff',
//           confirmButtonColor: '#529F2D', // Brand Green
//           confirmButtonText: 'Excellent',
//           customClass: {
//             popup: 'border border-[#3E3D45] rounded-xl shadow-2xl'
//           }
//         });
//       },
//       error: (err) => {
//         this.isProcessing = false;
//         this.errorMsg = err.error?.error || 'Provisioning sequence failed.';
//       }
//     });
//   }

//   // --- STATUS LOGIC ---

//   updateStatus(tenantId: string, newStatus: string) {
//     const isBan = newStatus === 'BANNED';
    
//     Swal.fire({
//       title: isBan ? 'Revoke Access?' : 'Restore Access?',
//       text: isBan 
//         ? `This will immediately block all transactions for ${tenantId}.` 
//         : `This will allow ${tenantId} to write to the ledger again.`,
//       icon: isBan ? 'warning' : 'info',
//       showCancelButton: true,
//       background: '#1a1a1a',
//       color: '#ffffff',
//       confirmButtonColor: isBan ? '#e11d48' : '#529F2D',
//       cancelButtonColor: '#3E3D45',
//       confirmButtonText: isBan ? 'Yes, Ban Tenant' : 'Yes, Activate',
//       customClass: {
//         popup: 'border border-[#3E3D45] rounded-xl shadow-2xl'
//       }
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.api.setTenantStatus(tenantId, newStatus).subscribe({
//           next: () => {
//             this.loadData();
//             this.showToast(`Tenant status updated to ${newStatus}`, 'success');
//           },
//           error: () => this.showToast('Failed to update status', 'error')
//         });
//       }
//     });
//   }

//   showToast(title: string, icon: 'success' | 'error' | 'warning') {
//     const Toast = Swal.mixin({
//       toast: true,
//       position: 'top-end',
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       background: '#1a1a1a', 
//       color: '#ffffff',
//       customClass: {
//         popup: 'rounded-xl border border-[#3E3D45] shadow-xl',
//         timerProgressBar: 'bg-[#529F2D]'
//       },
//       didOpen: (toast) => {
//         toast.addEventListener('mouseenter', Swal.stopTimer);
//         toast.addEventListener('mouseleave', Swal.resumeTimer);
//       }
//     });

//     Toast.fire({ icon, title });
//   }

//   logout() {
//     Swal.fire({
//       title: 'Logging out...',
//       timer: 800,
//       showConfirmButton: false,
//       background: '#1a1a1a',
//       color: '#ffffff',
//       willClose: () => {
//         window.location.href = '/super-login';
//       }
//     });
//   }
// }





// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2'; 
// import { SuperAdminService, RegistrationRequest, Tenant } from '../../core/services/super-admin.service';

// @Component({
//   selector: 'app-super-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="min-h-screen bg-slate-900 text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
//       <header class="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-30">
//         <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div class="flex items-center gap-3">
//             <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
//               <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//               </svg>
//             </div>
//             <h1 class="text-xl font-bold tracking-tight text-white">
//               DataSoft<span class="text-cyan-400">SUPER ADMIN</span>
//             </h1>
//           </div>
//           <button (click)="logout()" 
//             class="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
//             <span>Logout</span>
//             <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//           </button>
//         </div>
//       </header>

//       <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
//         <section class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
//           <div class="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-800">
//             <div>
//               <h2 class="text-lg font-semibold text-white flex items-center gap-2">
//                 Pending Requests
//                 <span *ngIf="pendingRequests.length > 0" class="flex h-2 w-2 relative">
//                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
//                   <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
//                 </span>
//               </h2>
//               <p class="text-xs text-slate-400 mt-1">Validate organizations before blockchain deployment</p>
//             </div>
//             <button (click)="loadData()" 
//               class="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-lg transition-all" title="Refresh">
//               <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//             </button>
//           </div>

//           <div class="overflow-x-auto">
//             <table class="w-full text-left border-collapse">
//               <thead>
//                 <tr class="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
//                   <th class="px-6 py-4">Organization</th>
//                   <th class="px-6 py-4">Plan Details</th>
//                   <th class="px-6 py-4">Payment Status</th>
//                   <th class="px-6 py-4 text-right">Action</th>
//                 </tr>
//               </thead>
//               <tbody class="divide-y divide-slate-700">
//                 <tr *ngFor="let req of pendingRequests" class="hover:bg-slate-700/30 transition-colors">
//                   <td class="px-6 py-4">
//                     <div class="flex flex-col">
//                       <span class="text-white font-medium">{{ req.orgName }}</span>
//                       <span class="text-xs text-slate-500 font-mono">{{ req.adminEmail }}</span>
//                       <span class="mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
//                         {{ req.orgType }}
//                       </span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4">
//                     <div class="flex items-center gap-2">
//                       <span class="text-sm text-cyan-300">{{ req.selectedPlan?.name || 'N/A' }}</span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4">
//                     <span [ngClass]="{
//                       'text-emerald-400 bg-emerald-500/10 border-emerald-500/20': req.paymentStatus === 'PAID',
//                       'text-amber-400 bg-amber-500/10 border-amber-500/20': req.paymentStatus !== 'PAID'
//                     }" class="px-2.5 py-1 text-xs font-bold rounded border inline-flex items-center gap-1.5">
//                       <span [class.bg-emerald-400]="req.paymentStatus === 'PAID'" 
//                             [class.bg-amber-400]="req.paymentStatus !== 'PAID'"
//                             class="w-1.5 h-1.5 rounded-full"></span>
//                       {{ req.paymentStatus }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4 text-right">
//                     <button *ngIf="req.paymentStatus === 'PAID'" 
//                             (click)="initiateApproval(req)" 
//                             class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg shadow-lg shadow-cyan-900/20 transition-all font-medium tracking-wide">
//                       APPROVE
//                     </button>
//                     <span *ngIf="req.paymentStatus !== 'PAID'" class="text-xs text-slate-500 italic">Awaiting Payment</span>
//                   </td>
//                 </tr>
//                 <tr *ngIf="pendingRequests.length === 0">
//                   <td colspan="4" class="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
//                     <svg class="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
//                     No pending requests found.
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </section>

//         <section class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
//           <div class="px-6 py-5 border-b border-slate-700">
//             <h2 class="text-lg font-semibold text-white">Active Blockchain Nodes</h2>
//             <p class="text-xs text-slate-400 mt-1">Live tenants currently writing to the ledger</p>
//           </div>
          
//           <div class="overflow-x-auto">
//             <table class="w-full text-left">
//               <thead>
//                 <tr class="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
//                   <th class="px-6 py-4">Tenant Identity</th>
//                   <th class="px-6 py-4">Node Status</th>
//                   <th class="px-6 py-4">Capacity (Admins)</th>
//                   <th class="px-6 py-4 text-right">Governance</th>
//                 </tr>
//               </thead>
//               <tbody class="divide-y divide-slate-700">
//                 <tr *ngFor="let t of tenants" class="hover:bg-slate-700/30 transition-colors">
//                   <td class="px-6 py-4">
//                     <span class="font-mono text-cyan-400 font-medium bg-cyan-900/20 px-2 py-1 rounded border border-cyan-900/50">
//                       {{ t.tenantId }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4">
//                     <span [ngClass]="{
//                       'text-emerald-400': t.status === 'ACTIVE',
//                       'text-rose-400': t.status === 'BANNED',
//                       'text-amber-400': t.status === 'SUSPENDED'
//                     }" class="text-xs font-bold flex items-center gap-2">
//                       <span class="relative flex h-2 w-2">
//                         <span *ngIf="t.status === 'ACTIVE'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                         <span [ngClass]="{
//                           'bg-emerald-400': t.status === 'ACTIVE',
//                           'bg-rose-500': t.status === 'BANNED',
//                           'bg-amber-400': t.status === 'SUSPENDED'
//                         }" class="relative inline-flex rounded-full h-2 w-2"></span>
//                       </span>
//                       {{ t.status }}
//                     </span>
//                   </td>
//                   <td class="px-6 py-4 text-sm text-slate-400">
//                     <div class="flex items-center gap-3">
//                       <div class="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
//                         <div class="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
//                              [style.width.%]="(t.currentAdmins / t.maxAdmins) * 100"></div>
//                       </div>
//                       <span class="text-xs font-mono">{{ t.currentAdmins }}/{{ t.maxAdmins }}</span>
//                     </div>
//                   </td>
//                   <td class="px-6 py-4 text-right space-x-2">
//                     <button *ngIf="t.status !== 'BANNED'" (click)="updateStatus(t.tenantId, 'BANNED')" 
//                       class="text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 px-3 py-1.5 rounded border border-rose-900/50 hover:border-rose-800 transition-colors">
//                       Ban Access
//                     </button>
//                     <button *ngIf="t.status === 'BANNED'" (click)="updateStatus(t.tenantId, 'ACTIVE')" 
//                       class="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 px-3 py-1.5 rounded border border-emerald-900/50 hover:border-emerald-800 transition-colors">
//                       Reactivate
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </section>

//       </main>

//       <div *ngIf="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
        
//         <div class="relative bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
          
//           <div class="px-6 py-6 border-b border-slate-700 bg-slate-800">
//             <h3 class="text-xl font-bold text-white mb-1">Provision Organization</h3>
//             <p class="text-sm text-slate-400">Initialize a new tenant ID on the blockchain ledger.</p>
//           </div>
          
//           <div class="px-6 py-6">
//             <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-6 space-y-2">
//               <div class="flex justify-between text-sm">
//                 <span class="text-slate-500">Organization Name</span>
//                 <span class="text-white font-medium">{{ selectedRequest?.orgName }}</span>
//               </div>
//               <div class="flex justify-between text-sm">
//                 <span class="text-slate-500">Administrator</span>
//                 <span class="text-cyan-400 font-mono">{{ selectedRequest?.adminEmail }}</span>
//               </div>
//             </div>

//             <div class="space-y-2">
//               <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">
//                 Assign Tenant ID
//               </label>
//               <div class="relative">
//                 <input type="text" [(ngModel)]="manualTenantId" 
//                   placeholder="e.g. UAP_CSE_2026" 
//                   [disabled]="isProcessing"
//                   (keyup.enter)="confirmApproval()"
//                   class="w-full bg-slate-900 text-white placeholder-slate-600 border border-slate-600 rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all disabled:opacity-50">
//               </div>
//               <p class="text-xs text-slate-500">Must be unique and adhere to blockchain naming conventions.</p>
//             </div>

//             <div *ngIf="errorMsg" class="mt-4 p-3 bg-rose-900/20 border border-rose-800/50 rounded-lg text-rose-300 text-sm flex items-center gap-2 animate-pulse">
//               <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//               {{ errorMsg }}
//             </div>
//           </div>

//           <div class="px-6 py-4 bg-slate-900/50 flex justify-end gap-3 border-t border-slate-700">
//             <button (click)="closeModal()" 
//               [disabled]="isProcessing"
//               class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">
//               Cancel
//             </button>
//             <button (click)="confirmApproval()" 
//               [disabled]="isProcessing || !manualTenantId" 
//               class="px-6 py-2 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2">
//               <svg *ngIf="isProcessing" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               {{ isProcessing ? 'Provisioning...' : 'Deploy Tenant' }}
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   `,
//   styles: [] // All styles handled by Tailwind
// })
// export class SuperDashboardComponent implements OnInit {
//   pendingRequests: RegistrationRequest[] = [];
//   tenants: Tenant[] = [];
  
//   // Modal State
//   showApprovalModal = false;
//   selectedRequest: RegistrationRequest | null = null;
//   manualTenantId = '';
//   isProcessing = false;
//   errorMsg = '';

//   constructor(private api: SuperAdminService) {}

//   ngOnInit() {
//     this.loadData();
//   }

//   loadData() {
//     this.api.getPendingRequests().subscribe({
//       next: (data) => this.pendingRequests = data,
//       error: (err) => this.showToast('Failed to load pending requests', 'error')
//     });

//     this.api.getAllTenants().subscribe({
//       next: (data) => this.tenants = data,
//       error: (err) => this.showToast('Failed to load active tenants', 'error')
//     });
//   }

//   // --- APPROVAL LOGIC ---

//   initiateApproval(req: RegistrationRequest) {
//     this.selectedRequest = req;
//     this.manualTenantId = ''; 
//     this.errorMsg = '';
//     this.showApprovalModal = true;
//   }

//   closeModal() {
//     if (this.isProcessing) return; // Prevent closing while busy
//     this.showApprovalModal = false;
//     this.selectedRequest = null;
//   }

//   confirmApproval() {
//     if (!this.selectedRequest || !this.manualTenantId) return;

//     this.isProcessing = true;
//     this.errorMsg = '';

//     this.api.approveRequest(this.selectedRequest._id, this.manualTenantId).subscribe({
//       next: (res) => {
//         // 1. Reset Logic
//         this.isProcessing = false;
//         this.showApprovalModal = false; // Close modal manually
//         this.selectedRequest = null;
        
//         // 2. Refresh Table
//         this.loadData(); 

//         // 3. SweetAlert Success (Replaces the manual successMsg div)
//         Swal.fire({
//           title: 'Deployment Successful!',
//           html: `<span class="text-slate-300">Tenant <b>${this.manualTenantId}</b> is now live on the blockchain.</span>`,
//           icon: 'success',
//           background: '#1e293b', // slate-800
//           color: '#f1f5f9', // slate-100
//           confirmButtonColor: '#0891b2', // cyan-600
//           confirmButtonText: 'Excellent',
//           customClass: {
//             popup: 'border border-slate-600 rounded-xl shadow-2xl'
//           }
//         });
//       },
//       error: (err) => {
//         this.isProcessing = false;
//         this.errorMsg = err.error?.error || 'Provisioning sequence failed.';
//       }
//     });
//   }

//   // --- STATUS LOGIC ---

//   updateStatus(tenantId: string, newStatus: string) {
//     const isBan = newStatus === 'BANNED';
    
//     Swal.fire({
//       title: isBan ? 'Revoke Access?' : 'Restore Access?',
//       text: isBan 
//         ? `This will immediately block all transactions for ${tenantId}.` 
//         : `This will allow ${tenantId} to write to the ledger again.`,
//       icon: isBan ? 'warning' : 'info',
//       showCancelButton: true,
//       background: '#1e293b',
//       color: '#f1f5f9',
//       confirmButtonColor: isBan ? '#e11d48' : '#10b981', // Rose or Emerald
//       cancelButtonColor: '#475569',
//       confirmButtonText: isBan ? 'Yes, Ban Tenant' : 'Yes, Activate',
//       customClass: {
//         popup: 'border border-slate-600 rounded-xl'
//       }
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.api.setTenantStatus(tenantId, newStatus).subscribe({
//           next: () => {
//             this.loadData();
//             this.showToast(`Tenant status updated to ${newStatus}`, 'success');
//           },
//           error: () => this.showToast('Failed to update status', 'error')
//         });
//       }
//     });
//   }

//   // Helper for small non-blocking notifications
//   showToast(title: string, icon: 'success' | 'error' | 'warning') {
//     const Toast = Swal.mixin({
//       toast: true,
//       position: 'top-end',
//       showConfirmButton: false,
//       timer: 3000,
//       timerProgressBar: true,
//       background: '#334155', // slate-700
//       color: '#fff',
//       customClass: {
//         popup: 'rounded-lg border border-slate-600 shadow-xl'
//       },
//       didOpen: (toast) => {
//         toast.addEventListener('mouseenter', Swal.stopTimer);
//         toast.addEventListener('mouseleave', Swal.resumeTimer);
//       }
//     });

//     Toast.fire({ icon, title });
//   }

//   logout() {
//     Swal.fire({
//       title: 'Logging out...',
//       timer: 800,
//       showConfirmButton: false,
//       background: '#1e293b',
//       color: '#fff',
//       willClose: () => {
//         window.location.href = '/super-login';
//       }
//     });
//   }
// }













//main1
// import { Component, OnInit } from '@angular/core';
// import { SuperAdminService, RegistrationRequest, Tenant } from '../../core/services/super-admin.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-super-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <div class="dashboard-container">
//       <header>
//         <h1>Super Admin Dashboard</h1>
//         <button (click)="logout()" class="logout-btn">Logout</button>
//       </header>

//       <section class="panel">
//         <div class="panel-header">
//           <h2>Pending Registration Requests</h2>
//           <button (click)="loadData()">Refresh</button>
//         </div>

//         <table class="data-table">
//           <thead>
//             <tr>
//               <th>Org Name</th>
//               <th>Type</th>
//               <th>Admin Email</th>
//               <th>Plan</th>
//               <th>Payment</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr *ngFor="let req of pendingRequests">
//               <td>{{ req.orgName }}</td>
//               <td><span class="badge type">{{ req.orgType }}</span></td>
//               <td>{{ req.adminEmail }}</td>
//               <td>{{ req.selectedPlan?.name || 'N/A' }}</td>
//               <td>
//                 <span [class.paid]="req.paymentStatus === 'PAID'" 
//                       [class.unpaid]="req.paymentStatus !== 'PAID'">
//                   {{ req.paymentStatus }}
//                 </span>
//               </td>
//               <td>
//                 <button *ngIf="req.paymentStatus === 'PAID'" 
//                         (click)="initiateApproval(req)" 
//                         class="btn-approve">
//                   Approve
//                 </button>
//                 <span *ngIf="req.paymentStatus !== 'PAID'" class="text-muted">Waiting Payment</span>
//               </td>
//             </tr>
//             <tr *ngIf="pendingRequests.length === 0">
//               <td colspan="6" class="text-center">No pending requests found.</td>
//             </tr>
//           </tbody>
//         </table>
//       </section>

//       <section class="panel">
//         <h2>Active Blockchain Tenants</h2>
//         <table class="data-table">
//           <thead>
//             <tr>
//               <th>Tenant ID</th>
//               <th>Status</th>
//               <th>Admins Used</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr *ngFor="let t of tenants">
//               <td><strong>{{ t.tenantId }}</strong></td>
//               <td>
//                 <span [ngClass]="{
//                   'status-active': t.status === 'ACTIVE',
//                   'status-banned': t.status === 'BANNED',
//                   'status-suspended': t.status === 'SUSPENDED'
//                 }">{{ t.status }}</span>
//               </td>
//               <td>{{ t.currentAdmins }} / {{ t.maxAdmins }}</td>
//               <td>
//                 <button *ngIf="t.status !== 'BANNED'" (click)="updateStatus(t.tenantId, 'BANNED')" class="btn-ban">Ban</button>
//                 <button *ngIf="t.status === 'BANNED'" (click)="updateStatus(t.tenantId, 'ACTIVE')" class="btn-activate">Unban</button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </section>

//       <div class="modal-backdrop" *ngIf="showApprovalModal">
//         <div class="modal">
//           <h3>Approve Organization</h3>
//           <p>Assign a unique <strong>Tenant ID</strong> for Blockchain storage.</p>
          
//           <div class="info-box">
//             <p><strong>Org:</strong> {{ selectedRequest?.orgName }}</p>
//             <p><strong>Email:</strong> {{ selectedRequest?.adminEmail }}</p>
//           </div>

//           <label>Assign Tenant ID (e.g., UAP_CSE_2026):</label>
//           <input type="text" [(ngModel)]="manualTenantId" placeholder="Type ID here..." class="input-id">
          
//           <div class="modal-actions">
//             <button (click)="closeModal()" class="btn-cancel">Cancel</button>
//             <button (click)="confirmApproval()" [disabled]="isProcessing || !manualTenantId" class="btn-confirm">
//               {{ isProcessing ? 'Provisioning...' : 'Confirm & Deploy' }}
//             </button>
//           </div>
//           <p *ngIf="errorMsg" class="error">{{ errorMsg }}</p>
//         </div>
//       </div>

//     </div>
//   `,
//   styles: [`
//     .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }
//     header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    
//     .panel { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
//     .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }

//     /* Tables */
//     .data-table { width: 100%; border-collapse: collapse; }
//     .data-table th, .data-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
//     .data-table th { background: #f8f9fa; font-weight: 600; }
    
//     /* Badges */
//     .paid { color: green; font-weight: bold; }
//     .unpaid { color: orange; font-weight: bold; }
//     .status-active { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; }
//     .status-banned { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; }
    
//     /* Buttons */
//     .btn-approve { background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
//     .btn-ban { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
//     .btn-activate { background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
//     .logout-btn { background: #343a40; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }

//     /* Modal */
//     .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
//     .modal { background: white; padding: 25px; border-radius: 8px; width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
//     .input-id { width: 100%; padding: 10px; margin: 15px 0; border: 2px solid #007bff; border-radius: 4px; font-size: 16px; }
//     .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
//     .btn-confirm { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
//     .btn-confirm:disabled { background: #ccc; cursor: not-allowed; }
//     .error { color: red; margin-top: 10px; }
//   `]
// })
// export class SuperDashboardComponent implements OnInit {
//   pendingRequests: RegistrationRequest[] = [];
//   tenants: Tenant[] = [];
  
//   // Modal State
//   showApprovalModal = false;
//   selectedRequest: RegistrationRequest | null = null;
//   manualTenantId = '';
//   isProcessing = false;
//   errorMsg = '';

//   constructor(private api: SuperAdminService) {}

//   ngOnInit() {
//     this.loadData();
//   }

//   loadData() {
//     // 1. Load Requests
//     this.api.getPendingRequests().subscribe({
//       next: (data) => this.pendingRequests = data,
//       error: (err) => console.error('Failed to load requests', err)
//     });

//     // 2. Load Tenants
//     this.api.getAllTenants().subscribe({
//       next: (data) => this.tenants = data,
//       error: (err) => console.error('Failed to load tenants', err)
//     });
//   }

//   // --- APPROVAL FLOW ---

//   initiateApproval(req: RegistrationRequest) {
//     this.selectedRequest = req;
//     this.manualTenantId = ''; // Reset input
//     this.errorMsg = '';
//     this.showApprovalModal = true;
//   }

//   closeModal() {
//     this.showApprovalModal = false;
//     this.selectedRequest = null;
//   }

//   confirmApproval() {
//     if (!this.selectedRequest || !this.manualTenantId) return;

//     this.isProcessing = true;
//     this.errorMsg = '';

//     // Call API: Approve & Provision
//     this.api.approveRequest(this.selectedRequest._id, this.manualTenantId).subscribe({
//       next: (res) => {
//         alert('Organization Provisioned Successfully!');
//         this.closeModal();
//         this.loadData(); // Refresh tables
//         this.isProcessing = false;
//       },
//       error: (err) => {
//         this.errorMsg = err.error?.error || 'Provisioning Failed';
//         this.isProcessing = false;
//       }
//     });
//   }

//   // --- TENANT MANAGEMENT ---

//   updateStatus(tenantId: string, newStatus: string) {
//     if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

//     this.api.setTenantStatus(tenantId, newStatus).subscribe({
//       next: () => {
//         this.loadData(); // Refresh list to see new status
//       },
//       error: (err) => alert('Failed to update status')
//     });
//   }

//   logout() {
//     // Clear cookies/tokens logic here
//     window.location.href = '/super-login';
//   }
// }