// reconstruct-image.component.ts
import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReconstructImageService } from './reconstruct-image.service';
import { IReconstructImageResult } from './reconstruct-image.interface';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-reconstruct-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconstruct-image.component.html',
  styleUrls: ['./reconstruct-image.component.scss']
})
export class ReconstructImageComponent implements OnDestroy {  // ✅ export + الاسم صح
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  isProcessing = false;
  reconstructionResult: IReconstructImageResult | null = null;
  processingComplete = false;
  errorMessage: string | null = null;
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private reconstructService: ReconstructImageService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please upload an image file only';
      return;
    }
    this.selectedFile = file;
    this.errorMessage = null;
    this.reconstructionResult = null;
    this.processingComplete = false;
    this.previewUrl = URL.createObjectURL(file);
  }

  startReconstruction(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please upload an image first';
      return;
    }
    this.isProcessing = true;
    this.errorMessage = null;
    this.reconstructionResult = null;
    this.cdr.detectChanges();

    this.reconstructService.reconstructImage(this.selectedFile).subscribe({
      next: (result) => {
        this.reconstructionResult = result;
        this.isProcessing = false;
        this.processingComplete = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reconstruction error:', err);
        this.errorMessage = 'Failed to reconstruct image. Please try another image.';
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSelection(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = null;
    this.previewUrl = null;
    this.reconstructionResult = null;
    this.errorMessage = null;
    this.processingComplete = false;
    this.isProcessing = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processFile(file);
    } else {
      this.errorMessage = 'Please upload only image files';
    }
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }
  onDragLeave(event: DragEvent): void { event.preventDefault(); }

  downloadReconstructedImage(): void {
    if (!this.reconstructionResult?.reconstructedImageUrl) return;
    const link = document.createElement('a');
    link.href = this.reconstructionResult.reconstructedImageUrl;
    link.download = `reconstructed-${this.reconstructionResult.id}.jpg`;
    link.click();
  }

  downloadReport(): void {
    if (!this.reconstructionResult) return;
    this.reconstructService.downloadReport(this.reconstructionResult.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reconstruction-report-${this.reconstructionResult!.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  saveToCaseFiles(): void {
    if (!this.reconstructionResult) return;
    const caseId = prompt('Enter Case ID:');
    if (caseId) {
      this.reconstructService.saveToCase(this.reconstructionResult.id, caseId).subscribe({
        next: () => alert('Successfully saved to case files!'),
        error: () => alert('Failed to save to case files')
      });
    }
  }

  ngOnDestroy(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }
}