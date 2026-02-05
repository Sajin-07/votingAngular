import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UpcomingEvent {
  title: string;
  school: string;
  date: string;
  imageUrl: string;
}

@Component({
  selector: 'app-landing-upcoming-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit {
  currentSlide = 0;
  
  upcomingEvents: UpcomingEvent[] = [
    {
      title: 'The Orchestra',
      school: 'St. Joseph School, Dhaka',
      date: '26th Feb, 26',
      imageUrl: 'orchestra.svg'
    },
    {
      title: 'Chromatic',
      school: 'Academia School, Dhaka',
      date: '16th Feb, 26',
      imageUrl: 'chromatic.svg'
    },
    {
      title: 'Unfiltered',
      school: 'Govt. Lab School, Dhaka',
      date: '6th March, 26',
      imageUrl: 'unfiltered.svg'
    }
  ];

  visibleEvents: UpcomingEvent[] = [];

  ngOnInit(): void {
    this.updateVisibleEvents();
  }

  updateVisibleEvents(): void {
    const start = this.currentSlide;
    this.visibleEvents = [
      this.upcomingEvents[start % this.upcomingEvents.length],
      this.upcomingEvents[(start + 1) % this.upcomingEvents.length],
      this.upcomingEvents[(start + 2) % this.upcomingEvents.length]
    ];
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.upcomingEvents.length;
    this.updateVisibleEvents();
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 
      ? this.upcomingEvents.length - 1 
      : this.currentSlide - 1;
    this.updateVisibleEvents();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateVisibleEvents();
  }
}