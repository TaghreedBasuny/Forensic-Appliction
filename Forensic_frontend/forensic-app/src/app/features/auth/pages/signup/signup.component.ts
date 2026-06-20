import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest, RegisterResponse } from '../../../../core/models/auth/register.model';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, NgIf]
})
export class SignupComponent implements OnInit {
  
  todayDate = new Date().toISOString().split('T')[0];
  form!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  backendErrors: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
   this.form = this.fb.group({
  fullName: ['', [
    Validators.required,
    Validators.minLength(3)
  ]],

  email: ['', [
    Validators.required,
    Validators.email
  ]],

  nationalId: ['', [
    Validators.required,
    Validators.pattern(/^[0-9]{14}$/)
  ]],

  phoneNumber: ['', [
    Validators.required,
    Validators.pattern(/^01[0-9]{9}$/)
  ]],

  dateOfBirth: ['', Validators.required],

  password: ['', [
    Validators.required,
    Validators.minLength(8)
  ]],

  confirmPassword: ['', Validators.required],

  terms: [false, Validators.requiredTrue]

}, {
  validators: this.passwordMatchValidator
});
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

 onSubmit(): void {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  const data: RegisterRequest = {
    name: this.form.value.fullName,
    email: this.form.value.email,
    password: this.form.value.password,
    phone_number: this.form.value.phoneNumber,
    national_id: this.form.value.nationalId,
    date_of_birth: this.form.value.dateOfBirth
  };

  this.authService.register(data).subscribe({

 next: (res) => {
  this.isLoading = false;
  this.form.reset();


 this.router.navigate(['/auth/login']);
},

error: (err) => {
      this.isLoading = false;

     if (err.status === 422) {
    this.backendErrors = err.error.data;
  }
   console.log(err);
    }

  });
}
}