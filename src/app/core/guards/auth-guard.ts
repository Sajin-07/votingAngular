import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

// Guard for Organization Admin routes
export const orgAdminGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  return http.get<any>('http://localhost:3000/api/auth/admin-status', {
    withCredentials: true
  }).pipe(
    map(response => {
      console.log('Auth Status:', response);
      
      if (!response.authenticated) {
        router.navigate(['/org-login']);
        return false;
      }

      // Allow ORG_ADMIN and tenant_admin roles
      if (response.role === 'ORG_ADMIN' || response.role === 'tenant_admin') {
        return true;
      }

      // Redirect moderators to their dashboard
      if (response.role === 'MODERATOR') {
        router.navigate(['/mod-dashboard']);
        return false;
      }

      // Redirect super admin to their dashboard
      if (response.role === 'super_admin') {
        router.navigate(['/super-dashboard']);
        return false;
      }

      router.navigate(['/org-login']);
      return false;
    }),
    catchError(error => {
      console.error('Auth check failed:', error);
      router.navigate(['/org-login']);
      return of(false);
    })
  );
};

// Guard for Moderator routes
export const moderatorGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<any>('http://localhost:3000/api/auth/admin-status', {
    withCredentials: true
  }).pipe(
    map(response => {
      console.log('Auth Status:', response);
      
      if (!response.authenticated) {
        router.navigate(['/org-login']);
        return false;
      }

      // Allow MODERATOR role
      if (response.role === 'MODERATOR') {
        return true;
      }

      // Redirect admins to their dashboard
      if (response.role === 'ORG_ADMIN' || response.role === 'tenant_admin') {
        router.navigate(['/org-dashboard']);
        return false;
      }

      // Redirect super admin to their dashboard
      if (response.role === 'super_admin') {
        router.navigate(['/super-dashboard']);
        return false;
      }

      router.navigate(['/org-login']);
      return false;
    }),
    catchError(error => {
      console.error('Auth check failed:', error);
      router.navigate(['/org-login']);
      return of(false);
    })
  );
};

// Guard for routes that both Admin and Moderator can access
export const orgUserGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<any>('http://localhost:3000/api/auth/admin-status', {
    withCredentials: true
  }).pipe(
    map(response => {
      console.log('Auth Status:', response);
      
      if (!response.authenticated) {
        router.navigate(['/org-login']);
        return false;
      }

      // Allow both ORG_ADMIN and MODERATOR roles
      if (response.role === 'ORG_ADMIN' || 
          response.role === 'tenant_admin' || 
          response.role === 'MODERATOR') {
        return true;
      }

      router.navigate(['/org-login']);
      return false;
    }),
    catchError(error => {
      console.error('Auth check failed:', error);
      router.navigate(['/org-login']);
      return of(false);
    })
  );
};