import { Component, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReconstructImageService } from './reconstruct-image.service';
import { IReconstructImageResult } from './reconstruct-image.interface';
import { CameraService } from '../../../../core/services/camera.service';
import { CasesService } from '../../../../core/services/cases.service'; 
import { Case } from '../../../../core/models/models_auth/case.model'; 
import jsPDF from 'jspdf';

@Component({
  selector: 'app-reconstruct-image',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reconstruct-image.component.html',
  styleUrls: ['./reconstruct-image.component.scss']
})
export class ReconstructImageComponent implements OnDestroy {
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  isProcessing = false;
  reconstructionResult: IReconstructImageResult | null = null;
  processingComplete = false;
  errorMessage: string | null = null;

  showCamera = false;
  isDownloadingReport = false;

  // Save to Case Modal
  showSaveModal = false;
  evidenceName = '';
  selectedCaseId: number | null = null;
  availableCases: Case[] = [];

  // Toast
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor(
    private reconstructService: ReconstructImageService,
    private cameraService: CameraService,
    private casesService: CasesService, 
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
    this.cleanupPreview();
    this.selectedFile = file;
    this.errorMessage = null;
    this.reconstructionResult = null;
    this.processingComplete = false;
    this.showCamera = false;
    this.previewUrl = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }

  private cleanupPreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
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
        this.showToastNotification('Image reconstructed successfully!', 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Reconstruction error:', err);
        const errorMsg = err?.message || 'Failed to reconstruct image. Please try another image.';
        this.errorMessage = errorMsg;
        this.isProcessing = false;
        this.showToastNotification(errorMsg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  clearSelection(): void {
    this.cleanupPreview();
    this.selectedFile = null;
    this.reconstructionResult = null;
    this.errorMessage = null;
    this.processingComplete = false;
    this.isProcessing = false;
    this.showCamera = false;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  async openCamera(): Promise<void> {
    try {
      this.cleanupPreview();
      this.reconstructionResult = null;
      this.processingComplete = false;
      this.errorMessage = null;
      this.showCamera = true;
      this.cdr.detectChanges();

      const stream = await this.cameraService.startCamera();
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
      }
    } catch (error) {
      this.showCamera = false;
      this.errorMessage = 'Could not access camera.';
      this.cdr.detectChanges();
    }
  }

  captureFromCamera(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.closeCamera();
        this.processFile(file);
      }
    }, 'image/jpeg', 0.9);
  }

  closeCamera(): void {
    this.showCamera = false;
    this.cameraService.stopCamera();
    this.cdr.detectChanges();
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

  downloadReport(): void {
    if (!this.reconstructionResult) return;

    this.isDownloadingReport = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.reconstructService.downloadReconstructedImageBlob(this.reconstructionResult.reconstructedImageUrl)
      .subscribe({
        next: async (blob) => {
          try {
            const base64Image = await this.blobToBase64(blob);
            this.buildPdfReport(base64Image);
          } catch (e) {
            console.error('Failed to embed image in report:', e);
            this.buildPdfReport(null);
          } finally {
            this.isDownloadingReport = false;
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('Could not fetch enhanced image for report:', err);
          this.buildPdfReport(null);
          this.isDownloadingReport = false;
          this.cdr.detectChanges();
        }
      });
  }

  private buildPdfReport(base64Image: string | null): void {
    const result = this.reconstructionResult!;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(30, 42, 94);
    doc.text('Face Reconstruction Report', 105, 20, { align: 'center' });
    doc.setDrawColor(30, 42, 94);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(11);
    doc.setTextColor(114, 114, 114);
    doc.text(`Date: ${new Date(result.timestamp).toLocaleString()}`, 20, 35);
    doc.text(`Report ID: ${result.id}`, 20, 42);

    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('Result: Face Reconstructed Successfully', 20, 55);

    doc.setFontSize(12);
    doc.setTextColor(30, 42, 94);
    let y = 70;
    const lineGap = 8;

    doc.text(`Face ID: ${result.faceId}`, 20, y); y += lineGap;
    doc.text(`Gender: ${result.genderInfo.gender}`, 20, y); y += lineGap;
    doc.text(`Age: ${result.displayAge}`, 20, y); y += lineGap;

    doc.setTextColor(114, 114, 114);
    doc.setFontSize(10);
    doc.text(`Face Region: x=${result.region.x}, y=${result.region.y}, w=${result.region.w}, h=${result.region.h}`, 20, y);
    y += lineGap + 5;

    doc.setFontSize(12);
    doc.setTextColor(30, 42, 94);
    doc.text('Reconstructed Image:', 20, y);
    y += 5;

    if (base64Image) {
      try {
        doc.addImage(base64Image, 'JPEG', 20, y, 90, 90);
      } catch (e) {
        console.error('addImage failed:', e);
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text('Image could not be embedded.', 20, y + 10);
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(200, 0, 0);
      doc.text('Image could not be embedded in this report.', 20, y + 5);
      doc.setTextColor(30, 42, 94);
      doc.text(`View image online: ${result.reconstructedImageUrl}`, 20, y + 12);
    }

    doc.save(`reconstruction-report-${result.id}.pdf`);
    this.showToastNotification('Report downloaded successfully!', 'success');
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  // ---------------- Save to Case Modal (Using CasesService) ----------------
  openSaveModal(): void {
    this.showSaveModal = true;
    this.evidenceName = '';
    this.selectedCaseId = null;
    
    this.casesService.loadCasesFromApi();
    
    this.casesService.cases$.subscribe((cases: Case[]) => {
      this.availableCases = cases;
      this.cdr.detectChanges();
    });
    
    this.cdr.detectChanges();
  }

  closeSaveModal(): void {
    this.showSaveModal = false;
    this.evidenceName = '';
    this.selectedCaseId = null;
    this.cdr.detectChanges();
  }

 // reconstruct-image.component.ts

 confirmSaveToCase(): void {
  if (!this.reconstructionResult || !this.evidenceName || !this.selectedCaseId) return;

  this.reconstructService.saveToCase(
    this.reconstructionResult,
    String(this.selectedCaseId),
    this.evidenceName
  ).subscribe({
    next: () => {
      this.showToastNotification('Successfully saved to case files!', 'success');
      this.closeSaveModal();
    },
    error: () => {
      this.showToastNotification('Failed to save to case files', 'error');
    }
  });
}
  private showToastNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnDestroy(): void {
    this.cleanupPreview();
    this.cameraService.stopCamera();
  }
}