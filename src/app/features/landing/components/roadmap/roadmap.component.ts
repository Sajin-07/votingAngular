import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.css']
})
export class RoadmapComponent {
  roadmapSteps = [
    {
      number: '1.',
      title: 'Registration',
      description: 'Authorized admins add students\' profiles to ensure verified participation.'
    },
    {
      number: '2.',
      title: 'Student Enrollment',
      description: 'Authorized admins add student profiles to ensure verified participation.'
    },
    {
      number: '3.',
      title: 'Setup Competition',
      description: 'Competition details such as theme, timeline, and voting period are defined.'
    },
    {
      number: '4.',
      title: 'Voting Phase',
      description: 'Registered participants cast their votes during the active competition window.'
    },
    {
      number: '5.',
      title: 'Result Declaration',
      description: 'Votes are tallied automatically and winners are announced transparently.'
    },
    {
      number: '6.',
      title: 'Artwork Submission',
      description: 'Student artworks are uploaded and prepared for public viewing and voting.'
    },
    {
      number: '7.',
      title: 'Public Showcase',
      description: 'Winning artworks and artist details are displayed for everyone to explore.'
    }
  ];
}
