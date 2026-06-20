import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf]
})
export class VerifyOtpComponent implements OnInit {
  email = '';
  otpValues: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  errorMessage = '';
  
  showResendToast = false; 

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('resetEmail');
    if (saved) {
      this.email = saved;
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  isOtpIncomplete(): boolean {
    return this.otpValues.some(val => val === '');
  }

  handleInput(event: any, index: number) {
    const val = event.target.value;
    if (!/^\d*$/.test(val)) {
      this.otpValues[index] = '';
      return;
    }
    this.otpValues[index] = val.slice(-1);
    
    if (val && index < 5) {
      this.inputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  handleBackspace(event: any, index: number) {
    if (!this.otpValues[index] && index > 0) {
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onContinue(): void {
    if (this.isOtpIncomplete()) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    const fullCode = this.otpValues.join('');

    this.authService.verifyOtp(this.email, fullCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 1) {
          localStorage.setItem('resetOtp', fullCode);
          this.router.navigate(['/auth/reset-password']);
        } else {
          this.errorMessage = response.msg || 'Invalid verification code.';
          this.clearInputs();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.msg || 'Network error. Please try again.';
        this.clearInputs();
      }
    });
  }

  clearInputs() {
    this.otpValues = ['', '', '', '', '', ''];
    setTimeout(() => {
       this.inputs.toArray()[0].nativeElement.focus();
    }, 0);
  }

  resendCode(e: Event) {
    e.preventDefault();
    
    this.showResendToast = true;
    this.errorMessage = ''; // مسح أي خطأ سابق في التحقق

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.clearInputs();
        
        // إخفاء التوست بعد 3 ثواني
        setTimeout(() => {
          this.showResendToast = false;
        }, 3000);
      },
      error: () => {
        this.showResendToast = false;
        this.errorMessage = 'Failed to resend code. Please try again.';
      }
    });
  }
}