import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { EventsComponent } from './components/events/events.component';
import { UpcomingEventsComponent } from './components/upcoming-events/upcoming-events.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { RoadmapComponent } from './components/roadmap/roadmap.component';
import { FooterComponent } from './components/footer/footer.component';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, HeroComponent, EventsComponent, UpcomingEventsComponent, AboutUsComponent, RoadmapComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  title = 'Votilum - Art Voting Platform';
}