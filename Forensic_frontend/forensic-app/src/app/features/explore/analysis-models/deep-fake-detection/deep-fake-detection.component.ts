import { Component, ViewChild, ElementRef, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeepFakeApiService, CaseItem } from './deep-fake-api.service';
import { IAnalysisResponse, IApiErrorResponse } from './deep-fake-api.interface';
import { CameraService } from '../../../../core/services/camera.service';
import { CasesService } from '../../../../core/services/cases.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-deep-fake-detection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deep-fake-detection.component.html',
  styleUrls: ['./deep-fake-detection.component.scss']
})
export class DeepFakeDetectionComponent implements OnDestroy, OnInit {

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  mediaType: 'image' | 'video' | 'audio' | null = null;
  isAnalyzing = false;
  analysisComplete = false;
  analysisResult: IAnalysisResponse | null = null;
  errorMessage: string | null = null;
  showCamera = false;
  showSaveModal = false;
  evidenceName = '';
  selectedCaseId = '';
  availableCases: CaseItem[] = [];

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  imageNaturalWidth: number = 0;
  imageNaturalHeight: number = 0;
  displayedImageWidth: number = 0;
  displayedImageHeight: number = 0;

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('detectionCanvas') detectionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resultImage') resultImage!: ElementRef<HTMLImageElement>;
  constructor(
    private analysisService: DeepFakeApiService,
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef,
    private casesService: CasesService
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.analysisService.getCases().subscribe(cases => {
      this.availableCases = cases;
      this.cdr.detectChanges();
    });
  }

  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    this.cleanupPreview();
    this.resetAnalysisState();
    this.selectedFile = file;
    this.showCamera = false;
    this.mediaType = 'image';
    this.previewUrl = URL.createObjectURL(file);
    setTimeout(() => this.cdr.detectChanges());
  }

  private cleanupPreview(): void {
    if (this.previewUrl) {
      const oldUrl = this.previewUrl;
      this.previewUrl = null;
      setTimeout(() => URL.revokeObjectURL(oldUrl), 1000);
    }
  }

  private resetAnalysisState(): void {
    this.analysisResult = null;
    this.analysisComplete = false;
    this.isAnalyzing = false;
    this.errorMessage = null;
  }

  async openCamera(): Promise<void> {
    try {
      this.cleanupPreview();
      this.resetAnalysisState();
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.processFile(file);
        this.closeCamera();
      }
    }, 'image/jpeg', 0.9);
  }

  closeCamera(): void {
    this.showCamera = false;
    this.cameraService.stopCamera();
    this.cdr.detectChanges();
  }

  startAnalysis(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }
    this.resetAnalysisState();
    this.isAnalyzing = true;
    this.cdr.detectChanges();
    this.analysisService.analyzeMedia(this.selectedFile).subscribe({
      next: (result) => this.handleAnalysisSuccess(result),
      error: (err: IApiErrorResponse | Error) => this.handleAnalysisError(err)
    });
  }

 private handleAnalysisSuccess(result: IAnalysisResponse): void {
  this.analysisResult = result;
  this.isAnalyzing = false;
  this.analysisComplete = true;
  this.errorMessage = null;
  this.cdr.detectChanges();
  
  setTimeout(() => this.drawBoxesOnCanvas(), 50);
}
  private handleAnalysisError(err: IApiErrorResponse | Error): void {
    this.isAnalyzing = false;
    if ('isValidationError' in err && err.isValidationError) {
      this.errorMessage = err.userMessage;
      this.analysisResult = null;
    } else if ('userMessage' in err) {
      this.errorMessage = err.userMessage;
    } else {
      this.errorMessage = 'Analysis failed.';
    }
    this.cdr.detectChanges();
  }

  clearSelection(): void {
    this.cleanupPreview();
    this.resetAnalysisState();
    this.selectedFile = null;
    this.mediaType = null;
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  downloadReport(): void {
    if (!this.analysisResult) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 42, 94);
    doc.text('Deep Fake Detection Report', 105, 20, { align: 'center' });
    doc.setDrawColor(30, 42, 94);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(11);
    doc.setTextColor(114, 114, 114);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
    doc.setFontSize(16);
    doc.setTextColor(
      this.analysisResult.isReal ? 16 : 239,
      this.analysisResult.isReal ? 185 : 68,
      this.analysisResult.isReal ? 129 : 68
    );
    doc.text(`Result: ${this.analysisResult.isReal ? 'REAL' : 'DEEP FAKE DETECTED'}`, 20, 50);
    doc.setFontSize(12);
    doc.setTextColor(30, 42, 94);
    doc.text(`File Name: ${this.analysisResult.fileName || 'N/A'}`, 20, 65);
    if (this.previewUrl) {
      doc.text('Analyzed Image:', 20, 90);
      doc.addImage(this.previewUrl, 'JPEG', 20, 95, 80, 80);
    }
    doc.save(`deepfake-report-${Date.now()}.pdf`);
  }

  saveToCaseFiles(): void {
    if (!this.analysisResult) return;
    this.evidenceName = this.analysisResult.fileName || '';
    this.selectedCaseId = '';
    this.showSaveModal = true;
  }

   closeSaveModal(): void {
    this.showSaveModal = false;
    this.evidenceName = '';
    this.selectedCaseId = '';
    this.cdr.detectChanges(); 
  }

   async confirmSaveToCase(): Promise<void> {
    if (!this.analysisResult || !this.selectedCaseId || !this.selectedFile) return;

    try {
      const base64Image = await this.fileToBase64(this.selectedFile);

      const evidencePayload = {
        name: this.evidenceName || this.analysisResult.fileName || 'Untitled Evidence',
        model_used: 'Deep Fake',
        case_id: Number(this.selectedCaseId),
        data: {
          phenotypes: {
            model_used: 'deep fake',
            status: this.analysisResult.isReal ? 'real' : 'fake',
            confidence: this.analysisResult.confidence,
            message: this.analysisResult.details || 'Analysis completed successfully',
            image: base64Image
          }
        }
      };

      this.analysisService.saveAsEvidence(evidencePayload).subscribe({
        next: () => {
          this.closeSaveModal();
          
          setTimeout(() => {
            this.showNotification('Evidence added to case successfully!', 'success');
          }, 300);
          
          this.casesService.refreshCaseDetails(Number(this.selectedCaseId)).subscribe();
        },
        error: (err: any) => {
          console.error('Save failed:', err);
          this.closeSaveModal();
          setTimeout(() => {
            this.showNotification('Failed to save evidence.', 'error');
          }, 300);
        }
      });

    } catch (error) {
      console.error('Error converting image to base64:', error);
      this.closeSaveModal();
      setTimeout(() => {
        this.showNotification('Error processing image.', 'error');
      }, 300);
    }
  }



  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges(); 

    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges(); 
    }, 3000);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidFileType(file)) {
      this.processFile(file);
    } else {
      this.errorMessage = 'Please upload a valid file';
      this.cdr.detectChanges();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private isValidFileType(file: File): boolean {
    return file.type.startsWith('image/') ||
           file.type.startsWith('video/') ||
           file.type.startsWith('audio/');
  }

  ngOnDestroy(): void {
    this.cleanupPreview();
    this.cameraService.stopCamera();
  }


    onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  this.imageNaturalWidth = img.naturalWidth;
  this.imageNaturalHeight = img.naturalHeight;
  
  setTimeout(() => {
    this.drawBoxesOnCanvas();
  }, 100);
}
  getBoxStyle(face: any): any {
    return {
      left: `${(face.facial_area.x / this.imageNaturalWidth) * 100}%`,
      top: `${(face.facial_area.y / this.imageNaturalHeight) *  100}%`,
      width: `${(face.facial_area.w / this.imageNaturalWidth) * 100}%`,
      height: `${(face.facial_area.h / this.imageNaturalHeight) * 100}%`
    };
  }

  drawBoxesOnCanvas() {
  if (!this.analysisResult?.faces || !this.detectionCanvas || !this.resultImage) return;

  const canvas = this.detectionCanvas.nativeElement;
  const img = this.resultImage.nativeElement;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / this.imageNaturalWidth;
  const scaleY = canvas.height / this.imageNaturalHeight;

  this.analysisResult.faces.forEach(face => {
    const x = face.facial_area.x * scaleX;
    const y = face.facial_area.y * scaleY;
    const w = face.facial_area.w * scaleX;
    const h = face.facial_area.h * scaleY;

    ctx.strokeStyle = face.is_real ? '#10b981' : '#ef4444'; 
    ctx.lineWidth = 3;
    
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = face.is_real ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(x, y, w, h);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = face.is_real ? '#10b981' : '#ef4444';
    
    const text = face.is_real ? 'Real' : 'Fake';
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = face.is_real ? '#10b981' : '#ef4444';
    ctx.fillRect(x, y - 20, textWidth + 10, 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 5, y - 5);
  });
}

}