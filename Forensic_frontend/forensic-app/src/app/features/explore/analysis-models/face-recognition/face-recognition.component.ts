import { Component, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaceRecognitionService, CaseItem, SaveEvidencePayload } from './face-recognition.service';
import { IFaceRecognitionResponse } from './face-recognition.interface';
import { CameraService } from '../../../../core/services/camera.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './face-recognition.component.html',
  styleUrls: ['./face-recognition.component.scss']
})
export class FaceRecognitionComponent implements OnDestroy, OnInit {

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  errorMessage: string | null = null;
  showRetryButton = false;

  isAnalyzing = false;
  analysisResult: IFaceRecognitionResponse | null = null;

  showCamera = false;
  showFaceBox = false;
  faceBoxStyle: any = {};

  showSaveModal = false;
  evidenceName = '';
  selectedCaseId = '';
  availableCases: CaseItem[] = [];
  
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('resultImage') resultImage!: ElementRef;

  constructor(
    private faceService: FaceRecognitionService,
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.faceService.getCases().subscribe(cases => {
      this.availableCases = cases;
      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    this.cleanupPreview();
    this.resetState();
    this.selectedFile = file;
    this.showCamera = false;
    this.previewUrl = URL.createObjectURL(file);
  }

  startAnalysis(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }
    this.resetState();
    this.isAnalyzing = true;
    this.cdr.detectChanges();

    this.faceService.analyzeFace(this.selectedFile).subscribe({
      next: (result) => {
        this.analysisResult = result;
        this.isAnalyzing = false;
        const bbox = result.data?.phenotypes?.bbox;
        this.showFaceBox = !!bbox;

        if (result.data.phenotypes.name === 'Unknown Person') {
          this.errorMessage = 'Person not recognized in the forensic database.';
          this.showRetryButton = true;
        }
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isAnalyzing = false;
        this.showRetryButton = true;
        this.cdr.detectChanges();
      }
    });
  }

  onImageLoad(event: Event): void {
    if (!this.showFaceBox) return;
    const img = event.target as HTMLImageElement;
    const bbox = this.analysisResult?.data?.phenotypes?.bbox;
    if (!bbox) return;
    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;
    this.faceBoxStyle = {
      left: `${bbox.x * scaleX}px`, top: `${bbox.y * scaleY}px`,
      width: `${bbox.width * scaleX}px`, height: `${bbox.height * scaleY}px`
    };
  }

  saveToCaseFiles(): void {
    if (!this.analysisResult) return;
    
    this.evidenceName = this.analysisResult.data.phenotypes.name ?? ''; 
    
    if (this.analysisResult.data.phenotypes.name === 'Unknown Person') {
      this.evidenceName = '';
    }
    
    this.selectedCaseId = '';
    this.showSaveModal = true;
  }

  closeSaveModal(): void {
    this.showSaveModal = false;
    this.evidenceName = '';
    this.selectedCaseId = '';
    this.cdr.detectChanges(); 
  }

  confirmSaveToCase(): void {
    if (!this.analysisResult || !this.selectedCaseId) return;

    const payload: SaveEvidencePayload = {
      name: this.evidenceName || 'Face Recognition Evidence',
      model_used: 'Face Recognition',
      case_id: Number(this.selectedCaseId),
      data: {
        phenotypes: {
          name: this.analysisResult.data.phenotypes.name ?? 'Unknown', 
          image: this.analysisResult.data.phenotypes.image,
          message: 'Identity matched successfully',
          status: this.analysisResult.data.phenotypes.name === 'Unknown Person' ? 'unknown' : 'matched'
        }
      }
    };

    this.faceService.saveAsEvidence(payload).subscribe({
      next: () => {
        this.closeSaveModal();
        
        setTimeout(() => {
          this.showNotification('Evidence saved successfully!', 'success');
        }, 300);
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.closeSaveModal();
        setTimeout(() => {
          this.showNotification('Failed to save evidence.', 'error');
        }, 300);
      }
    });
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

  downloadReport(): void {
    if (!this.analysisResult) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 42, 94);
    doc.text('Face Recognition Report', 105, 20, { align: 'center' });
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Person: ${this.analysisResult.data.phenotypes.name}`, 20, 50);
    doc.save(`face-report-${Date.now()}.pdf`);
  }

  private cleanupPreview(): void {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
  }

  private resetState(): void {
    this.analysisResult = null; this.errorMessage = null; this.isAnalyzing = false;
    this.showFaceBox = false; this.showRetryButton = false;
  }

  clearSelection(): void {
    this.cleanupPreview(); this.resetState(); this.selectedFile = null;
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  async openCamera(): Promise<void> {
    try { 
      this.cleanupPreview(); this.resetState(); this.showCamera = true; this.cdr.detectChanges();
      const stream = await this.cameraService.startCamera();
      if (this.videoElement?.nativeElement) this.videoElement.nativeElement.srcObject = stream;
    } catch { 
      this.showCamera = false; this.errorMessage = 'Could not access camera.'; this.cdr.detectChanges(); 
    }
  }

  captureFromCamera(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;
    const ctx = this.canvasElement.nativeElement.getContext('2d');
    this.canvasElement.nativeElement.width = this.videoElement.nativeElement.videoWidth;
    this.canvasElement.nativeElement.height = this.videoElement.nativeElement.videoHeight;
    ctx.drawImage(this.videoElement.nativeElement, 0, 0);
    this.canvasElement.nativeElement.toBlob((blob: Blob | null) => {
      if (blob) { 
        this.processFile(new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })); 
        this.closeCamera(); 
      }
    }, 'image/jpeg', 0.9);
  }

  closeCamera(): void { this.showCamera = false; this.cameraService.stopCamera(); this.cdr.detectChanges(); }
  onDrop(event: DragEvent): void { event.preventDefault(); const f = event.dataTransfer?.files[0]; if(f) this.processFile(f); }
  onDragOver(e: DragEvent): void { e.preventDefault(); }
  onDragLeave(e: DragEvent): void { e.preventDefault(); }
  ngOnDestroy(): void { this.cleanupPreview(); this.cameraService.stopCamera(); }
}