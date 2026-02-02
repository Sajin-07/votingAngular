// import { inject } from '@angular/core';
// import { Router, CanActivateFn, UrlTree } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { map, take } from 'rxjs/operators';

// export const votingGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 1. Determine which step user is trying to visit
//   const path = route.routeConfig?.path || ''; 
//   // Extracts '1' from 'step1', '2' from 'step2', etc.
//   const targetStep = parseInt(path.replace('step', ''), 10);

//   // If this route isn't a step (e.g. dashboard), allow it or add separate admin guard
//   if (isNaN(targetStep)) {
//     return true; 
//   }

//   // 2. Check Authentication
//   return authService.isAuthenticated().pipe(
//     take(1), // Ensure observable completes
//     map(isValid => {
      
//       const isLoginPage = (targetStep === 1);

//       // --- SCENARIO A: User is NOT Logged In ---
//       if (!isValid) {
//         // If they are trying to reach Login (Step 1), ALLOW IT.
//         if (isLoginPage) {
//           return true;
//         }
//         // If they try Step 2-5 without login, kick them to Step 1
//         return router.createUrlTree(['/step1']);
//       }

//       // --- SCENARIO B: User IS Logged In ---
//       if (!isValid) {
//         // Allow Step 2 if sessionStorage says user already passed QR
//         const allowed = sessionStorage.getItem('allowedStep');
//         if (allowed && Number(allowed) >= 2) {
//           return true;
//         }
//         return router.createUrlTree(['/step1']);
//       }

      
//       // Fallback (should never happen)
//       return router.createUrlTree(['/step1']);
//     })
//   );
// };




// //jan 6
// import { inject } from '@angular/core';
// import { Router, CanActivateFn, UrlTree } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { map, take } from 'rxjs/operators';

// export const votingGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 1. Determine which step user is trying to visit
//   const path = route.routeConfig?.path || ''; 
//   // Extracts '1' from 'step1', '2' from 'step2', etc.
//   const targetStep = parseInt(path.replace('step', ''), 10);

//   // If this route isn't a step (e.g. dashboard), allow it or add separate admin guard
//   if (isNaN(targetStep)) {
//     return true; 
//   }

//   // 2. Check Authentication
//   return authService.isAuthenticated().pipe(
//     take(1), // Ensure observable completes
//     map(isValid => {
      
//       const isLoginPage = (targetStep === 1);

//       // --- SCENARIO A: User is NOT Logged In ---
//       if (!isValid) {
//         // If they are trying to reach Login (Step 1), ALLOW IT.
//         if (isLoginPage) {
//           return true;
//         }
//         // If they try Step 2-5 without login, kick them to Step 1
//         return router.createUrlTree(['/step1']);
//       }

//       // --- SCENARIO B: User IS Logged In ---
//       if (isValid) {
//         // If they try to go back to Login (Step 1), force them forward
//         if (isLoginPage) {
//            const allowed = sessionStorage.getItem('allowedStep') || '2';
//            return router.createUrlTree([`/step${allowed}`]);
//         }

//         // Strict Workflow: Only allow the specifically allowed step
//         if (!authService.canAccessStep(targetStep)) {
//            const allowed = sessionStorage.getItem('allowedStep') || '2';
//            return router.createUrlTree([`/step${allowed}`]);
//         }
        
//         // Allowed
//         return true; 
//       }
      
//       // Fallback (should never happen)
//       return router.createUrlTree(['/step1']);
//     })
//   );
// };


import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { map, take } from 'rxjs/operators';

export const votingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const socketService = inject(SocketService); // Inject Socket
  const router = inject(Router);

  const path = route.routeConfig?.path || ''; 
  const targetStep = parseInt(path.replace('step', ''), 10);

  // 1. CHECK TIMER STATUS
  // If socket isn't connected yet, this might return false initially.
  // Ideally, ensure socket connects in AppComponent.
  const isVotingOpen = socketService.isVotingOpen$.value;

  // List of restricted routes that REQUIRE timer to be running
  const restrictedRoutes = ['step2', 'step3', 'step4', 'step5'];
  
  // Check if current route is a QR generator route
  const isQrRoute = state.url.includes('qr-generator');

  if ((restrictedRoutes.includes(path) || isQrRoute) && !isVotingOpen) {
    console.log('⛔ Access Denied: Voting is currently closed.');
    // Redirect to home or a "Voting Closed" page
    return router.createUrlTree(['/']); 
  }

  // 2. EXISTING AUTH LOGIC...
  if (isNaN(targetStep)) { return true; }

  return authService.isAuthenticated().pipe(
    take(1),
    map(isValid => {
      const isLoginPage = (targetStep === 1);

      if (!isValid) {
        if (isLoginPage) return true;
        return router.createUrlTree(['/step1']);
      }

      if (isValid) {
        if (isLoginPage) {
           const allowed = sessionStorage.getItem('allowedStep') || '2';
           return router.createUrlTree([`/step${allowed}`]);
        }
        if (!authService.canAccessStep(targetStep)) {
           const allowed = sessionStorage.getItem('allowedStep') || '2';
           return router.createUrlTree([`/step${allowed}`]);
        }
        return true; 
      }
      return router.createUrlTree(['/step1']);
    })
  );
};