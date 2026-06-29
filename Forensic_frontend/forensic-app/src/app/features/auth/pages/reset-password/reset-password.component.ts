import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass , NgIf} from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink ,NgClass , NgIf]
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = ''; 
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const otp = localStorage.getItem('resetOtp');
    if (!otp) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get isSubmitDisabled(): boolean {
    return this.form.invalid || this.isLoading;
  }

  onSubmit(): void {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      
      const email = localStorage.getItem('resetEmail');
      const otp = localStorage.getItem('resetOtp');
      
      if (!email || !otp) {
        this.router.navigate(['/auth/forgot-password']);
        return;
      }

      const newPassword = this.form.value.newPassword;
      const confirmPass = this.form.value.confirmPassword;

      this.authService.resetPassword(email, otp, newPassword, confirmPass).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 1) {
            this.successMessage = 'Password reset successfully!';
            setTimeout(() => {
              localStorage.removeItem('resetEmail');
              localStorage.removeItem('resetOtp');
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            alert(response.msg || 'Failed to reset password.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          alert(error.error?.msg || 'Network error.');
        }
      });
    }
  }
}