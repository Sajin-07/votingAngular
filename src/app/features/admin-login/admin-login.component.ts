import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint } from 'lucide-angular';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  // --- ASSETS ---
  readonly icons = { Lock, User, ShieldCheck, ArrowRight, BrainCircuit, CheckCircle2, Fingerprint };
  logoImg = '/dataSoft.svg';

  // --- STATE ---
  adminId = '';
  password = '';
  loading = false;
  error = '';

  // --- "Hold to Mine" Logic ---
  miningProgress = 0;
  isMining = false;
  isMined = false;
  currentHash = '0x0000000000000000';
  
  private mineInterval: any;
  private hashInterval: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.startHashGenerator();
  }

  ngOnDestroy() {
    this.clearAllIntervals();
  }

  // --- HASH GENERATOR (Visual Effect) ---
  startHashGenerator() {
    this.hashInterval = setInterval(() => {
      if (this.isMining && !this.isMined) {
        // Generate random hex string
        const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        this.currentHash = `0x${randomHex}...`;
        this.cdr.detectChanges();
      } else if (this.isMined) {
        this.currentHash = '0xSUCCESS_VERIFIED';
        this.cdr.detectChanges();
      } else {
        this.currentHash = '0xWAITING_FOR_MINER';
        this.cdr.detectChanges();
      }
    }, 50);
  }

  // --- MINING ACTIONS ---
  startMining() {
    if (this.isMined) return;
    this.isMining = true;
    
    this.mineInterval = setInterval(() => {
      if (this.miningProgress >= 100) {
        this.finishMining();
      } else {
        this.miningProgress += 2; // Speed of mining
        this.cdr.detectChanges();
      }
    }, 30);
  }

  stopMining() {
    if (this.isMined) return;
    this.isMining = false;
    this.miningProgress = 0; // Reset if failed
    clearInterval(this.mineInterval);
    this.cdr.detectChanges();
  }

  finishMining() {
    clearInterval(this.mineInterval);
    this.isMined = true;
    this.isMining = false;
    this.miningProgress = 100;
    this.cdr.detectChanges();
  }

  clearAllIntervals() {
    if (this.mineInterval) clearInterval(this.mineInterval);
    if (this.hashInterval) clearInterval(this.hashInterval);
  }

  // --- LOGIN ---
  handleLogin(event: Event) {
    event.preventDefault();
    this.error = '';

    if (!this.isMined) {
      this.error = 'Proof of Work Required: Please mine the block first.';
      return;
    }

    this.loading = true;

    // Simulating secure login
    setTimeout(() => {
      if (this.adminId === 'admin' && this.password === 'password') {
        console.log('Login Successful');
        // Navigate to dashboard here
      } else {
        this.error = 'Invalid Admin ID or Password. Resetting miner...';
        this.isMined = false;
        this.miningProgress = 0;
      }
      this.loading = false;
      this.cdr.detectChanges();
    }, 1800);
  }
}