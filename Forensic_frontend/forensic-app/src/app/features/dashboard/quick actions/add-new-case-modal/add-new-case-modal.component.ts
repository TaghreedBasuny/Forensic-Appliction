import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CasesService } from '../../../../core/services/cases.service';
import { CreateCaseRequest } from '../../../../core/models/models_auth/case.model';

@Component({
  selector: 'app-add-new-case-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-new-case-modal.component.html',
  styleUrls: ['./add-new-case-modal.component.scss']
})
export class AddNewCaseModalComponent {
  @Output() caseAdded = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  
  caseData = { title: '', description: '' };
  errors = { title: false, description: false };

  constructor(private casesService: CasesService) {}

  openModal() {
    this.isOpen = true;
    this.resetValidation();
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  onOverlayClick(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  resetForm() {
    this.caseData = { title: '', description: '' };
    this.resetValidation();
  }

  resetValidation() {
    this.errors = { title: false, description: false };
  }

  validateForm(): boolean {
    this.resetValidation(); 
    let isValid = true;
    if (!this.caseData.title.trim()) { this.errors.title = true; isValid = false; }
    if (!this.caseData.description.trim()) { this.errors.description = true; isValid = false; }
    return isValid;
  }

  createCase() {
     if (this.isLoading) return;
  console.log(' Button Clicked');
  console.log(' Current Form Data:', this.caseData);

  if (!this.validateForm()) {
    console.log('Validation Failed');
    return;
  }

  this.isLoading = true;

  const request: CreateCaseRequest = {
    name: this.caseData.title,
    description: this.caseData.description,
    status: 'active',
    // user_id: 1 // TODO: Replace with actual user ID
  };

  console.log('Payload to API:', request);

  this.casesService.createCase(request).subscribe({
    next: (response) => {
      console.log('API Success Response:', response);
      
      this.casesService.addCaseToState(response);
      
      this.isLoading = false;
      this.closeModal();
      this.caseAdded.emit();
    },
    error: (err) => {
      this.isLoading = false;
      console.error('API Error:', err);
      alert('Failed to create case. Please try again.');
    }
  });
}
}