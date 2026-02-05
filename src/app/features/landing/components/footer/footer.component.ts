import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  email = '';

  onNewsletterSubmit() {
    if (this.email.trim()) {
      console.log('Newsletter signup:', this.email);
      this.email = '';
    }
  }

  footerSections = [
    {
      title: 'About Us',
      links: [
        { label: 'Career', href: '#' },
        { label: 'Services', href: '#' },
        { label: 'Projects', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'Blog', href: '#' },
        { label: 'Career', href: '#' }
      ]
    },
    {
      title: 'About Us',
      links: [
        { label: 'Career', href: '#' },
        { label: 'Career', href: '#' }
      ]
    }
  ];

  contactInfo = [
    { label: '0088-0144558765', icon: 'phone' },
    { label: 'Artium.bd@gmail.com', icon: 'email' }
  ];
}
