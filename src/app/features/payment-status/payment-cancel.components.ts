import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-yellow-50">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <svg class="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
        <p class="text-gray-600 mb-6">
          You cancelled the transaction. No charges were made to your account.
        </p>
        
        <a routerLink="/register" class="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded transition duration-200">
          Return to Registration
        </a>
      </div>
    </div>
  `
})
export class PaymentCancelComponent {}