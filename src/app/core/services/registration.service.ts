import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // Update this to your actual backend URL
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/public/plans`);
  }

  initiateRegistration(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/initiate`, data);
  }

  createPayment(registrationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/create`, { registrationId });
  }
}