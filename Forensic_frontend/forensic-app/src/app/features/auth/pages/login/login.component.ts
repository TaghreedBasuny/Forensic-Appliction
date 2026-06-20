import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth/register.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, NgIf]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  message: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    const savedEmail = localStorage.getItem('demo_email');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail });
    }
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.message = ''; 
    this.isError = false;

    const data: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isError = false;
        
        localStorage.setItem('currentUser', JSON.stringify(res.user));
        localStorage.setItem('authToken', res.token);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        
        this.message = err.error?.msg || 'Invalid email or password. Please try again.';
        
        this.cdRef.detectChanges();

        setTimeout(() => {
          this.message = '';
          this.isError = false;
          this.cdRef.detectChanges(); 
        }, 3000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}