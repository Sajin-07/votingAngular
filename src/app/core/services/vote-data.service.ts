//this is for step4
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoteDataService {
  // Store Logged in User Info
  private _currentUser: any = null;
  
  // Store Selected Candidate Info
  private _selectedCandidate: any = null;

  constructor() {
    // Optional: Recover from sessionStorage if page refreshes
    const savedUser = sessionStorage.getItem('vote_user');
    const savedCandidate = sessionStorage.getItem('vote_candidate');
    
    if (savedUser) this._currentUser = JSON.parse(savedUser);
    if (savedCandidate) this._selectedCandidate = JSON.parse(savedCandidate);
  }

  // --- SETTERS ---
  setCurrentUser(user: any) {
    this._currentUser = user;
    sessionStorage.setItem('vote_user', JSON.stringify(user));
  }

  setSelectedCandidate(candidate: any) {
    this._selectedCandidate = candidate;
    sessionStorage.setItem('vote_candidate', JSON.stringify(candidate));
  }

  // --- GETTERS ---
  get currentUser() { return this._currentUser; }
  get selectedCandidate() { return this._selectedCandidate; }
}