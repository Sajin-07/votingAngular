import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  
  // State for the Guard to check
  public isVotingOpen$ = new BehaviorSubject<boolean>(false);
  public timeLeft$ = new BehaviorSubject<number>(0);

  constructor() {
    // Automatically try to connect as a voter (public) when service inits
    // Unless we are explicitly in admin mode. 
    // Ideally, call connectPublic() from app.component or specific features.
  }

  // --- ADMIN CONNECTION ---
  connectAdmin() {
    if (this.socket && this.socket.connected) this.socket.disconnect();

    this.socket = io('http://localhost:3000/admin', {
      withCredentials: true,
      transports: ['websocket']
    });

    this.setupCommonListeners();
    
    this.socket.on('connect', () => console.log('✅ Admin Socket connected'));
  }

  // --- VOTER CONNECTION (Public) ---
  connectVoter() {
    if (this.socket && this.socket.connected) return;

    this.socket = io('http://localhost:3000', { // Default namespace
      withCredentials: true,
      transports: ['websocket']
    });

    this.setupCommonListeners();
  }

  private setupCommonListeners() {
    // Listen for Timer Updates (Works for both Admin and Voter)
    this.socket.on('timer:update', (data: { isOpen: boolean, timeLeft: number }) => {
      this.isVotingOpen$.next(data.isOpen);
      this.timeLeft$.next(data.timeLeft);
    });
  }

  // --- ADMIN ACTIONS ---
  startTimer(minutes: number) {
    this.socket.emit('admin:start-timer', minutes);
  }

  stopTimer() {
    this.socket.emit('admin:stop-timer');
  }

  // --- DATA STREAMS ---
  onActivity(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('activity', data => observer.next(data));
    });
  }

  onActivityHistory(): Observable<any[]> {
    return new Observable(observer => {
      this.socket.on('activity:history', data => observer.next(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { Observable } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class SocketService {
//   private socket!: Socket;

//   connectAdmin() {
//     if (this.socket && this.socket.connected) return;

//     this.socket = io('http://localhost:3000/admin', {
//       withCredentials: true,
//       transports: ['websocket']
//     });

//     this.socket.on('connect', () => {
//       console.log('Socket connected', this.socket.id);
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Socket disconnected');
//     });
//   }

//   onActivity(): Observable<any> {
//     return new Observable(observer => {
//       this.socket.on('activity', data => observer.next(data));
//     });
//   }

//   onActivityHistory(): Observable<any[]> {
//     return new Observable(observer => {
//       this.socket.on('activity:history', data => observer.next(data));
//     });
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }
// }
