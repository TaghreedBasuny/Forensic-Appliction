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

  imageNaturalWidth: number = 0;
  imageNaturalHeight: number = 0;

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('canvasElement') canvasElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('resultImage') resultImage!: ElementRef<HTMLImageElement>;
  @ViewChild('detectionCanvas') detectionCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private faceService: FaceRecognitionService,
    private cameraService: CameraService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  get matchedPersonName(): string {
    const matches = this.analysisResult?.data?.phenotypes?.['fake recognation analysis']?.matches;
    if (!matches || matches.length === 0) return 'Unknown Person';

    const names = Array.from(
      new Set(matches.map(m => m.person_name).filter(n => !!n))
    );
    return names.length ? names.join(', ') : 'Unknown Person';
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

        const analysisData = result.data.phenotypes['fake recognation analysis'];
        const hasMatches = analysisData?.matches && analysisData.matches.length > 0;

        if (!hasMatches) {
          this.errorMessage = 'Person not recognized in the forensic database.';
          this.showRetryButton = true;
        }

        this.cdr.detectChanges();

        setTimeout(() => this.drawFaceBoxes(), 50);
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isAnalyzing = false;
        this.showRetryButton = true;
        this.cdr.detectChanges();
      }
    });
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    this.imageNaturalWidth = img.naturalWidth;
    this.imageNaturalHeight = img.naturalHeight;

    setTimeout(() => this.drawFaceBoxes(), 100);
  }

  saveToCaseFiles(): void {
    if (!this.analysisResult) return;

    this.evidenceName = this.matchedPersonName !== 'Unknown Person' ? this.matchedPersonName : '';

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

    const matchedName = this.matchedPersonName;

    const payload: SaveEvidencePayload = {
      name: this.evidenceName || 'Face Recognition Evidence',
      model_used: 'Face Recognition',
      case_id: Number(this.selectedCaseId),
      data: {
        phenotypes: {
          name: matchedName,
          image: this.analysisResult.data.phenotypes.image,
          message: 'Identity matched successfully',
          status: matchedName === 'Unknown Person' ? 'unknown' : 'matched'
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

  async downloadReport(): Promise<void> {
  if (!this.analysisResult) return;

  const matchedName = this.matchedPersonName;
  const isMatched = matchedName !== 'Unknown Person';
  const imageUrl = this.analysisResult.data.phenotypes.image;

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(30, 42, 94);
  doc.text('Face Recognition Report', 105, 20, { align: 'center' });

  doc.setDrawColor(30, 42, 94);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(11);
  doc.setTextColor(114, 114, 114);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35);

  doc.setFontSize(16);
  doc.setTextColor(
    isMatched ? 16 : 239,
    isMatched ? 185 : 68,
    isMatched ? 129 : 68
  );
  doc.text(`Result: ${isMatched ? matchedName.toUpperCase() : 'UNKNOWN PERSON'}`, 20, 50);

  doc.setFontSize(12);
  doc.setTextColor(30, 42, 94);
  doc.text(`File Name: ${imageUrl || 'N/A'}`, 20, 65);

  if (imageUrl) {
    try {
      const base64Image = await this.urlToBase64(imageUrl);
      doc.text('Analyzed Image:', 20, 90);
      doc.addImage(base64Image, 'JPEG', 20, 95, 80, 80);
    } catch (e) {
      console.warn('Could not embed image in report:', e);
      doc.setTextColor(150, 150, 150);
      doc.text('(Image could not be loaded for the report)', 20, 90);
    }
  }

  doc.save(`face-report-${Date.now()}.pdf`);
}

private urlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
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
  onDrop(event: DragEvent): void { event.preventDefault(); const f = event.dataTransfer?.files[0]; if (f) this.processFile(f); }
  onDragOver(e: DragEvent): void { e.preventDefault(); }
  onDragLeave(e: DragEvent): void { e.preventDefault(); }
  ngOnDestroy(): void { this.cleanupPreview(); this.cameraService.stopCamera(); }

  drawFaceBoxes() {
    if (!this.analysisResult || !this.detectionCanvas || !this.resultImage) return;

    const canvas = this.detectionCanvas.nativeElement;
    const img = this.resultImage.nativeElement;
    const ctx = canvas.getContext('2d');
    const matches = this.analysisResult.data.phenotypes['fake recognation analysis']?.matches;

    if (!ctx || !matches || matches.length === 0) return;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / this.imageNaturalWidth;
    const scaleY = canvas.height / this.imageNaturalHeight;

    matches.forEach(match => {
      const x = match.box.x * scaleX;
      const y = match.box.y * scaleY;
      const w = match.box.w * scaleX;
      const h = match.box.h * scaleY;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(x, y, w, h);

      const name = match.person_name || 'Unknown';
      ctx.font = 'bold 14px Arial';
      const textWidth = ctx.measureText(name).width;

      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, y - 22, textWidth + 12, 22);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, x + 6, y - 6);
    });
  }

}