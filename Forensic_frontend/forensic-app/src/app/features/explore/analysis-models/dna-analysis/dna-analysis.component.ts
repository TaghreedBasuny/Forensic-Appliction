import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DNAAnalysisService } from './dna-analysis.service';
import { CasesService } from '../../../../core/services/cases.service';
import jsPDF from 'jspdf';

export interface CaseItem {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

@Component({
  selector: 'app-dna-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dna-analysis.component.html',
  styleUrls: ['./dna-analysis.component.scss']
})
export class DNAAnalysisComponent implements OnInit {
  
  activeTab: 'upload' | 'text' = 'upload';
  sequenceText: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  result: any = null;

  showSaveModal = false;
  evidenceName = '';
  selectedCaseId = '';
  availableCases: CaseItem[] = [];

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'error';
  isToastVisible: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dnaService: DNAAnalysisService,
    private casesService: CasesService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.http.get<any>('https://forensic-ai-system-api-production.up.railway.app/api/all-cases').subscribe({
      next: (res) => {
        this.availableCases = res.cases.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          status: c.status || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load cases:', err)
    });
  }

  switchTab(tab: 'upload' | 'text') {
    this.activeTab = tab;
    this.clearAnalysis();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.sequenceText = '';
      this.result = null;
      this.runAnalysis(); 
    }
  }

  processSequenceText() {
    if (this.sequenceText.trim()) {
      this.selectedFile = null;
      this.runAnalysis();
    }
  }

  runAnalysis() {
    if (!this.selectedFile && !this.sequenceText.trim()) return;

    this.isLoading = true;
    this.result = null;
    this.cdr.detectChanges();

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    } else {
      formData.append('sequence', this.sequenceText);
    }

    this.dnaService.analyzeDNA(formData).subscribe({
      next: (res) => {
        console.log('API RESPONSE', res);
        this.result = res.data.phenotypes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error occurred:', err);
        this.isLoading = false;
        const errorMsg = err?.error?.message || 'Analysis failed. Please try again.';
        this.showToast(errorMsg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  clearAnalysis(): void {
    this.selectedFile = null;
    this.sequenceText = '';
    this.result = null;
    this.isLoading = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  downloadReport() {
    if (!this.result) return;
    const doc = new jsPDF();
    
    const primaryR = 30, primaryG = 42, primaryB = 94;
    const secondaryR = 114, secondaryG = 114, secondaryB = 114;

    doc.setFontSize(24);
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.text('DNA Phenotype Prediction Report', 105, 20, { align: 'center' });
    
    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.line(20, 28, 190, 28);

    doc.setFontSize(11);
    doc.setTextColor(secondaryR, secondaryG, secondaryB);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38);
    doc.text(`Source: ${this.selectedFile?.name || 'Text Sequence Input'}`, 20, 46);

    doc.setFontSize(16);
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.text('Analysis Results:', 20, 60);
    doc.line(20, 63, 190, 63);

    let yPos = 75;
    const traits = [
      { label: 'Eye Color', value: this.result.eye_color.trait, prob: this.result.eye_color.probability, color: [59, 130, 246] },
      { label: 'Hair Color', value: this.result.hair_color.trait, prob: this.result.hair_color.probability, color: [93, 64, 55] },
      { label: 'Skin Color', value: this.result.skin_color.trait, prob: this.result.skin_color.probability, color: [253, 186, 116] },
      { label: 'Ancestry', value: this.result.ancestry.trait, prob: this.result.ancestry.probability, color: [100, 116, 139] }
    ];

    traits.forEach(trait => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.text(`${trait.label}:`, 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(secondaryR, secondaryG, secondaryB);
      doc.text(trait.value, 70, yPos);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`${(trait.prob * 100).toFixed(1)}%`, 170, yPos);

      doc.setFillColor(240, 240, 240);
      doc.rect(70, yPos + 4, 95, 4, 'F'); 
      
      doc.setFillColor(trait.color[0], trait.color[1], trait.color[2]);
      doc.rect(70, yPos + 4, 95 * trait.prob, 4, 'F'); 

      yPos += 22;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(secondaryR, secondaryG, secondaryB);
    doc.text('Generated by Forensic AI System - DNA Analysis Module', 105, 280, { align: 'center' });

    doc.save(`DNA_Report_${Date.now()}.pdf`);
    this.showToast('Report downloaded successfully!', 'success');
  }

  openSaveModal(): void {
    if (!this.result) return;
    this.evidenceName = 'DNA Profile - Sample A1';
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
    if (!this.result || !this.selectedCaseId) return;

    const evidencePayload = {
      name: this.evidenceName,
      model_used: 'DNA Analysis',
      case_id: Number(this.selectedCaseId),
      data: {
        phenotypes: {
          eye_color: {
            trait: this.result.eye_color.trait,
            probability: this.result.eye_color.probability
          },
          hair_color: {
            trait: this.result.hair_color.trait,
            probability: this.result.hair_color.probability
          },
          skin_color: {
            trait: this.result.skin_color.trait,
            probability: this.result.skin_color.probability
          },
          ancestry: {
            trait: this.result.ancestry.trait,
            probability: this.result.ancestry.probability
          }
        }
      }
    };

    this.dnaService.saveAsEvidence(evidencePayload).subscribe({
      next: () => {
        this.closeSaveModal();
        
        setTimeout(() => {
          this.showToast('Saved successfully to case files!', 'success');
        }, 300);
      },
      error: () => {
        this.closeSaveModal();
        setTimeout(() => {
          this.showToast('Failed to save to case files.', 'error');
        }, 300);
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.isToastVisible = true;
    this.cdr.detectChanges(); 

    setTimeout(() => {
      this.isToastVisible = false;
      this.cdr.detectChanges(); 
    }, 4000);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      this.sequenceText = '';
      this.result = null;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }
}