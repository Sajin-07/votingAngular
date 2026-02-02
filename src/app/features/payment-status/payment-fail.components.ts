import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-red-50">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg class="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p class="text-gray-600 mb-6">
          We couldn't process your payment. This might be due to a network issue or insufficient funds.
        </p>
        
        <a routerLink="/register" class="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition duration-200">
          Try Again
        </a>
      </div>
    </div>
  `
})
export class PaymentFailComponent {}