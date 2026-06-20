import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '../models/auth/register.model';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface PasswordResetResponse {
  status: number;
  msg: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  );

  user$ = this.userSubject.asObservable();
  private apiUrl = environment.apiUrl;

  get currentUserValue() {
    return this.userSubject.value;
  }

  constructor(private http: HttpClient) {}

  
  register(data: RegisterRequest) {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }


  forgotPassword(email: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/password/forgot`, 
      { email }
    );
  }

 
  verifyOtp(email: string, otp: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/password/verify-code`, 
      { email, otp }
    );
  }


  resetPassword(
    email: string, 
    otp: string | number, 
    password: string, 
    passwordConfirmation: string
  ): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/password/reset`, 
      { 
        email, 
        otp, 
        password, 
        password_confirmation: passwordConfirmation 
      }
    );
  }

  getRole(): string | null {
  const user = this.currentUserValue;
  return user ? user.role : null;
}
}