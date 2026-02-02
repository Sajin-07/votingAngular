// admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Server-validated check (verifies HTTP-only cookie)
  return authService.isAdminAuthenticated().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Store intended URL for redirect after login
        sessionStorage.setItem('adminReturnUrl', state.url);
        
        console.log('🚫 Admin access denied - redirecting to login');
        router.navigate(['/adminLogin']);
        return false;
      }
    })
  );
};

//JAN13
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const adminGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Check if Admin is authenticated
//   if (authService.isAdminLoggedIn()) {
//     return true;
//   } else {
//     // Store the intended URL for redirecting after login
//     sessionStorage.setItem('adminReturnUrl', state.url);
    
//     // Redirect to Admin Login page
//     router.navigate(['/adminLogin']);
//     return false;
//   }
// };


// //main
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service'; // Adjust path to match your structure

// export const adminGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Check if Admin is authenticated
//   if (authService.isAdminLoggedIn()) {
//     return true;
//   } else {
//     // If not, redirect to Admin Login page
//     router.navigate(['/adminLogin']);
//     return false;
//   }
// };