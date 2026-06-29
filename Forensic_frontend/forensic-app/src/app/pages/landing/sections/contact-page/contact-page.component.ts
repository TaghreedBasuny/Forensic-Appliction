// src/app/pages/contact-page/contact-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../../core/services/contact.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss']
})
export class ContactPageComponent {
  contactForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  private egyptianPhoneRegex = /^(010|011|012|015)[0-9]{8}$/;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required, 
        Validators.pattern(this.egyptianPhoneRegex) 
      ]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.isSuccess = false;
      this.isError = false;
      this.errorMessage = '';

      const contactData = {
        name: this.contactForm.value.fullName,
        email: this.contactForm.value.email,
        phone_number: this.contactForm.value.phone,
        message: this.contactForm.value.message
      };

      this.contactService.submitContact(contactData).subscribe({
        next: (response: any) => {
          console.log('Success:', response);
          this.isLoading = false;
          this.isSuccess = true;
          this.contactForm.reset();
          
          setTimeout(() => { this.isSuccess = false; }, 5000);
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.isLoading = false;
          this.isError = true;
          this.errorMessage = error.error?.msg || 'Failed to send message. Please try again.';
          
          setTimeout(() => { this.isError = false; }, 5000);
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  get f() { return this.contactForm.controls; }
}