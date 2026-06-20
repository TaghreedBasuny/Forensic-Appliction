import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfileData {
  name: string;
  email: string;
  profilePicture: string | null;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private userProfileSubject = new BehaviorSubject<UserProfileData>({
    name: 'Dr. Mohammed Sakr',
    email: 'mohammedsakr2026@gmail.com',
    profilePicture: null,
    role: 'Doctor'
  });

  public userProfile$: Observable<UserProfileData> = this.userProfileSubject.asObservable();

  updateProfile(data: Partial<UserProfileData>): void {
    const current = this.userProfileSubject.getValue();
    this.userProfileSubject.next({ ...current, ...data });
    
    localStorage.setItem('userProfile', JSON.stringify({ ...current, ...data }));
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      this.userProfileSubject.next(JSON.parse(stored));
    }
  }

  getCurrentProfile(): UserProfileData {
    return this.userProfileSubject.getValue();
  }
}