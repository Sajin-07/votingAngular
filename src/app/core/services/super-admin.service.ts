import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistrationRequest {
  _id: string;
  orgName: string;
  orgType: string;
  adminEmail: string;
  paymentStatus: string;
  approvalStatus: string;
  selectedPlan: any;
}

export interface Tenant {
  tenantId: string;
  orgType: string;
  status: string; // 'ACTIVE', 'SUSPENDED', 'BANNED'
  currentAdmins: number;
  maxAdmins: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = 'http://localhost:3000/api'; // Adjust port if needed

  constructor(private http: HttpClient) {}

  // 1. Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/super-login`, credentials, { withCredentials: true });
  }

  // 2. Get Pending Requests
  getPendingRequests(): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(`${this.apiUrl}/super/requests`, { withCredentials: true });
  }

  // 3. Approve Request (Critical Step)
  approveRequest(requestId: string, assignedTenantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/super/approve-request`, 
      { requestId, assignedTenantId }, 
      { withCredentials: true }
    );
  }

  // 4. Reject Request (You might need to add this API endpoint if not exists)
  rejectRequest(requestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/super/reject-request`, { requestId }, { withCredentials: true });
  }

  // 5. Get All Tenants (Blockchain Query)
  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.apiUrl}/super/tenants`, { withCredentials: true });
  }

  // 6. Ban/Unban Tenant (SetTenantStatus)
  setTenantStatus(tenantId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/super/set-status`, 
      { tenantId, status }, 
      { withCredentials: true }
    );
  }
}