import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-green-50">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
        <p class="text-gray-600 mb-6">
          Your payment has been verified. Your organization is now successfully registered.
        </p>
        
        <a routerLink="/login" class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-200">
          Go to Dashboard
        </a>
      </div>
    </div>
  `
})
export class PaymentSuccessComponent {}