// voter-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class VoterAuthGuard implements CanActivate {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🔒 [VoterAuthGuard] Checking voter authentication...');
    
    return this.http.get<any>(`${API_URL}/api/voter/session-status`, {
      withCredentials: true
    }).pipe(
      map(response => {
        if (response.authenticated) {
          console.log('✅ [VoterAuthGuard] Voter authenticated:', response.voterId);
          return true;
        } else {
          console.log('❌ [VoterAuthGuard] Not authenticated:', response.message);
          this.router.navigate(['/verify-qr']);
          return false;
        }
      }),
      catchError(error => {
        console.error('❌ [VoterAuthGuard] Auth check failed:', error);
        this.router.navigate(['/verify-qr']);
        return of(false);
      })
    );
  }
}