import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CasesService } from '../../../../core/services/cases.service';
import { ChangeDetectorRef } from '@angular/core';
import jsPDF from 'jspdf';

export interface EvidenceItem {
  id: number;
  name: string;
  model_used: string;
  status?: string;
  confidence?: number;
  data?: any;
  created_at: string;
}

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.scss']
})
export class CaseDetailsComponent implements OnInit {

  caseId: string | null = null;
  caseData: any = null;
  isLoading = true;
  evidenceList: EvidenceItem[] = [];

  isCompleting = false;
  isCompleted = false;

  showDeleteModal = false;
  evidenceToDelete: EvidenceItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private casesService: CasesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('caseId');
      if (id) {
        this.caseId = id;
        this.evidenceList = [];
        this.caseData = null;
        this.isLoading = true;
        this.isCompleted = false;
        this.isCompleting = false;
        this.cdr.detectChanges();
        this.loadCase(id);
      }
    });
  }

  loadCase(id: string) {
    this.isLoading = true;
    this.caseData = null;
    this.evidenceList = [];
    this.cdr.detectChanges();

    this.casesService.getCaseDetails(+id).subscribe({
      next: (res) => {
        this.caseData = {
          title: res.data.name,
          caseNumber: `CS-${res.data.id}`,
          date: res.data.created_at,
          status: res.data.status,
          description: res.data.description
        };

        const evidences = res.evidence || [];
        this.evidenceList = evidences.map((ev: any) => ({
          id: ev.id,
          name: ev.name || 'Untitled Evidence',
          model_used: ev.model_used || 'Unknown',
          status: ev.data?.phenotypes?.status,
          confidence: ev.data?.phenotypes?.confidence,
          data: ev.data,
          created_at: ev.created_at
        }));

        const status = res.data.status?.toLowerCase();
        this.isCompleted = status === 'complete' || status === 'completed' || status === 'inactive';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading case details:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleToggleCase(): void {
    if (this.isCompleted) {
      this.downloadReport();
      return;
    }

    if (!this.caseId) return;

    this.isCompleting = true;
    this.cdr.detectChanges();

    this.casesService.toggleCaseStatus(+this.caseId).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isCompleting = false;
          this.isCompleted = true;
          if (this.caseData) this.caseData.status = 'complete';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        console.error('Failed:', err);
        this.isCompleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(ev: EvidenceItem): void {
    this.evidenceToDelete = ev;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.evidenceToDelete = null;
  }

  confirmDeleteEvidence(): void {
    if (!this.evidenceToDelete || !this.caseId) return;

    this.casesService.deleteEvidence(this.evidenceToDelete.id, +this.caseId).subscribe({
      next: () => {
        this.evidenceList = this.evidenceList.filter(e => e.id !== this.evidenceToDelete!.id);
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete evidence:', err);
        alert('Failed to delete evidence. Please try again.');
      }
    });
  }

  async downloadReport(): Promise<void> {
    if (!this.caseData) return;

    const doc = new jsPDF();
    const primaryR = 30, primaryG = 42, primaryB = 94;
    const grayR = 100, grayG = 116, grayB = 139;
    let y = 20;

    const addPageIfNeeded = (neededSpace: number) => {
      if (y + neededSpace > 270) {
        doc.addPage();
        y = 20;
      }
    };

    doc.setFillColor(primaryR, primaryG, primaryB);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Forensic Case Report', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 27, { align: 'center' });

    y = 50;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.text('Case Information', 20, y);

    doc.setDrawColor(primaryR, primaryG, primaryB);
    doc.line(20, y + 3, 190, y + 3);
    y += 14;

    const caseInfoRows = [
      ['Case Title', this.caseData.title || 'N/A'],
      ['Case Number', this.caseData.caseNumber || 'N/A'],
      ['Date', this.caseData.date || 'N/A'],
      ['Status', this.isCompleted ? 'Complete' : 'Active'],
    ];

    caseInfoRows.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.text(`${label}:`, 20, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(value, 70, y);
      y += 10;
    });

    if (this.caseData.description) {
      y += 4;
      addPageIfNeeded(30);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.text('Description:', 20, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const descLines = doc.splitTextToSize(this.caseData.description, 165);
      descLines.forEach((line: string) => {
        addPageIfNeeded(8);
        doc.text(line, 20, y);
        y += 7;
      });
    }

    y += 8;
    addPageIfNeeded(20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryR, primaryG, primaryB);
    doc.text(`Evidence Collection (${this.evidenceList.length} items)`, 20, y);
    doc.line(20, y + 3, 190, y + 3);
    y += 14;

    if (this.evidenceList.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayR, grayG, grayB);
      doc.text('No evidence added to this case yet.', 20, y);
      y += 10;
    }

    for (let i = 0; i < this.evidenceList.length; i++) {
      const ev = this.evidenceList[i];
      addPageIfNeeded(50);

      doc.setFillColor(247, 248, 253);
      doc.roundedRect(15, y - 5, 180, 12, 2, 2, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryR, primaryG, primaryB);
      doc.text(`${i + 1}. ${ev.name}`, 20, y + 3);
      y += 14;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayR, grayG, grayB);
      doc.text(`Model: ${ev.model_used}`, 20, y);
      y += 8;

      const model = ev.model_used.toLowerCase();

      if (model.includes('deep fake')) {
        const status = ev.data?.phenotypes?.status || 'N/A';
        const isReal = status === 'real';

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isReal ? 22 : 185, isReal ? 163 : 28, isReal ? 74 : 28);
        doc.text(`Result: ${isReal ? 'REAL' : 'FAKE DETECTED'}`, 20, y);
        y += 8;

        if (ev.data?.phenotypes?.confidence) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          doc.text(`Confidence: ${ev.data.phenotypes.confidence}%`, 20, y);
          y += 8;
        }

        if (ev.data?.phenotypes?.image) {
          try {
            const base64 = await this.urlToBase64(ev.data.phenotypes.image);
            addPageIfNeeded(70);
            doc.text('Analyzed Image:', 20, y);
            y += 5;
            doc.addImage(base64, 'JPEG', 20, y, 60, 55);
            y += 62;
          } catch {
            doc.setTextColor(grayR, grayG, grayB);
            doc.text('Image could not be loaded.', 20, y);
            y += 8;
          }
        }
      }

      if (model.includes('face')) {
        const name = ev.data?.phenotypes?.name || 'Unknown Person';

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(7, 89, 133);
        doc.text(`Identified Person: ${name}`, 20, y);
        y += 8;

        if (ev.data?.phenotypes?.image && name !== 'Unknown Person') {
          try {
            const base64 = await this.urlToBase64(ev.data.phenotypes.image);
            addPageIfNeeded(70);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            doc.text('Matched Identity:', 20, y);
            y += 5;
            doc.addImage(base64, 'JPEG', 20, y, 55, 55);
            y += 62;
          } catch {
            doc.setTextColor(grayR, grayG, grayB);
            doc.text('Image could not be loaded.', 20, y);
            y += 8;
          }
        }
      }

      if (model.includes('dna')) {
        const phenotypes = ev.data?.phenotypes;
        if (phenotypes) {
          const traits = [
            { label: 'Eye Color', data: phenotypes.eye_color },
            { label: 'Hair Color', data: phenotypes.hair_color },
            { label: 'Skin Tone', data: phenotypes.skin_color },
            { label: 'Ancestry', data: phenotypes.ancestry },
          ];

          traits.forEach(trait => {
            if (!trait.data) return;
            addPageIfNeeded(10);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryR, primaryG, primaryB);
            doc.text(`${trait.label}:`, 20, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            doc.text(trait.data.trait || 'N/A', 65, y);

            const prob = Math.round((trait.data.probability || 0) * 100);
            doc.setTextColor(grayR, grayG, grayB);
            doc.text(`${prob}%`, 170, y);

            doc.setFillColor(226, 232, 240);
            doc.rect(65, y + 2, 95, 3, 'F');
            doc.setFillColor(99, 102, 241);
            doc.rect(65, y + 2, 95 * (trait.data.probability || 0), 3, 'F');

            y += 12;
          });
        }
      }

      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, 190, y);
      y += 8;
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(grayR, grayG, grayB);
      doc.text(
        `Forensic AI System — Page ${i} of ${pageCount}`,
        105, 290,
        { align: 'center' }
      );
    }

    doc.save(`case-report-${this.caseData.caseNumber}-${Date.now()}.pdf`);
  }

  private urlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  openAddEvidenceModal() {
    console.log('Add Evidence clicked');
  }
}