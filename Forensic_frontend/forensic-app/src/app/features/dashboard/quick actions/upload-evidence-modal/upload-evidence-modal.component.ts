import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-evidence-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-evidence-modal.component.html',
  styleUrls: ['./upload-evidence-modal.component.scss']
})
export class UploadEvidenceModalComponent {
  isOpen = false;
  isLoading = false;
  errorMsg = '';
  selectedFile: File | null = null;
  isDragging = false;

  formData = {
    evidenceName: '',
    linkToCase: '',
    evidenceType: 'Image',
    description: ''
  };

  evidenceTypes = [
    'Image',
    'Video',
    'Document',
    'Audio',
    'DNA Sample',
    'Fingerprint',
    'Other'
  ];

  openModal() {
    this.isOpen = true;
    this.errorMsg = '';
    this.selectedFile = null;
    this.resetForm();
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    this.errorMsg = '';
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  onOverlayClick(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  resetForm() {
    this.formData = {
      evidenceName: '',
      linkToCase: '',
      evidenceType: 'Image',
      description: ''
    };
    this.selectedFile = null;
    this.errorMsg = '';
  }

  // Drag & Drop Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.errorMsg = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMsg = '';
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  removeFile(event: Event) {
    event.stopPropagation(); 
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  validateForm(): boolean {
    if (!this.selectedFile) {
      this.errorMsg = 'Please select a file to upload';
      return false;
    }
    if (!this.formData.evidenceName.trim()) {
      this.errorMsg = 'Evidence Name is required';
      return false;
    }
    if (!this.formData.description.trim()) {
      this.errorMsg = 'Description is required';
      return false;
    }
    return true;
  }

  uploadEvidence() {
    this.errorMsg = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      console.log('✅ Evidence uploaded successfully (Mock):', {
        file: this.selectedFile?.name,
        ...this.formData
      });

      this.isLoading = false;
      this.closeModal();
      alert('Evidence uploaded successfully!');
    }, 2000); // 2 seconds simulation
  }

  getFileIcon(): string {
    if (!this.selectedFile) return '';
    const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return 'video';
    if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'document';
    return 'file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}