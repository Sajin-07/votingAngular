import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

// Configuration
const API_URL = 'http://localhost:3000'; // Your Node Backend
const IMGBB_KEY = '49c34f91f4f7457f0cb17f358b9e8b40';

export interface Candidate {
  candidateId: string; // Changed from 'id' to match React
  name: string;
  position: string;
  description: string;
  photoUrl: string;
  voteCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  constructor(private http: HttpClient) { }

  // 1. Check if ID Exists (for Async Validator)
  checkCandidateExists(id: string): Observable<boolean> {
    return this.http.get(`${API_URL}/api/check-candidate/${id}`, { 
    withCredentials: true 
  }).pipe(
      map(() => true), // If 200 OK, it exists
      catchError(() => of(false)) // If 404 or error, it doesn't exist
    );
  }

  // 2. Upload to ImgBB
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<any>(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, formData).pipe(
      map(response => response.data.url)
    );
  }

  // 3. Add to Blockchain
  addCandidate(candidate: Candidate): Observable<any> {
    return this.http.post(`${API_URL}/candidates/add`, candidate, { 
      withCredentials: true 
    });
  }

  // 4. Get All Candidates
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${API_URL}/candidates`, { 
    withCredentials: true 
  }).pipe(
      // Ensure uniqueness logic from React if needed, 
      // though usually backend handles this better.
      catchError(() => of([]))
    );
  }
}