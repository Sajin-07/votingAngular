import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, UserPlus, Vote, ArrowRight, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  // Define icons for the template to access
  readonly icons = {
    LayoutDashboard,
    UserPlus,
    Vote,
    ArrowRight,
    ShieldCheck
  };

  // Image path based on your request
  // logoImg = '../../../../public/dataSoft.svg';
  logoImg = '/dataSoft.svg';

  MENU_ITEMS = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Manage candidates, view live results, and system settings.',
      icon: 'LayoutDashboard',
      path: '/adminLogin', 
      color: 'text-blue-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(96,165,250,0.5)]',
      primary: false
    },
    {
      id: 'QR',
      title: 'QR',
      description: 'Generate QR Code',
      icon: 'UserPlus',
      // UPDATED PATH HERE
      path: '/qr-login', 
      color: 'text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(192,132,252,0.5)]',
      primary: false
    },
    {
      id: 'QR Verify',
      title: 'QR Verify',
      description: 'Verify QR Code to Cast Vote',
      icon: 'UserPlus',
      // UPDATED PATH HERE
      path: '/qr-verify', 
      color: 'text-purple-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(192,132,252,0.5)]',
      primary: false
    },
    // {
    //   id: 'vote',
    //   title: 'Voting Portal',
    //   description: 'Cast your vote securely using your employee ID.',
    //   icon: 'Vote',
    //   path: '/step1',
    //   color: 'text-[#529F2D]',
    //   glow: 'group-hover:shadow-[0_0_20px_rgba(82,159,45,0.5)]',
    //   primary: true
    // }
  ];

  // Helper to resolve icon based on string name
  getIcon(name: string): any {
    // @ts-ignore
    return this.icons[name];
  }
}