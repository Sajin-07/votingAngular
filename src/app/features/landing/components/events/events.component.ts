import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Artwork {
  title: string;
  artist: string;
  badge?: string;
  imageUrl: string;
}

interface Insight {
  title: string;
  subtitle: string;
  date: string;
  icon?: string;
}

@Component({
  selector: 'app-landing-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  currentSlide = 0;
  
  artworks: Artwork[] = [
    {
      title: 'The Silent Symphony',
      artist: 'Oishi Saha',
      badge: 'Winner',
      imageUrl: '/assets/images/events/the-silent-symphony.svg'
    },
    {
      title: 'Echelon',
      artist: 'Giash Uddin',
      badge: '2nd position',
      imageUrl: '/assets/images/events/echelon.svg'
    }
  ];

  latestInsight: Insight = {
    title: 'The Creative Pulse',
    subtitle: 'Scholastica School · Art Competition',
    date: 'January 12, 2026',
    icon: '/assets/images/icons/scholastica-logo.svg'
  };

  ngOnInit(): void {
    // Auto-rotate slides every 5 seconds
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.artworks.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.artworks.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  getSecondPosition(): number {
    return (this.currentSlide + 1) % this.artworks.length;
  }
}