import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf]
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const email = this.form.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 1) {
            localStorage.setItem('resetEmail', email);
            this.router.navigate(['/auth/verify-otp']); 
          } else {
            this.errorMessage = response.msg || 'Failed to send email.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.msg || 'An error occurred. Please try again.';
        }
      });
    }
  }
}