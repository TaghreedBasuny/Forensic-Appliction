import { Component, AfterViewInit, ViewChild ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkActive } from '@angular/router';
import Chart from 'chart.js/auto';
import { RouterLink } from '@angular/router';
import { ActiveCasesModalComponent } from '../model cases/active-cases-modal/active-cases-modal.component';
import { EvidenceItemsModalComponent } from '../model cases/evidence-items-modal/evidence-items-modal.component';
import { CompletedCasesModalComponent } from '../model cases/completed-cases-modal/completed-cases-modal.component';
import { AddNewCaseModalComponent } from '../quick actions/add-new-case-modal/add-new-case-modal.component';
import { UploadEvidenceModalComponent } from '../quick actions/upload-evidence-modal/upload-evidence-modal.component';
import { AnalysisModelsModalComponent } from '../quick actions/analysis-models-model/analysis-models-model.component';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ActiveCasesModalComponent,
    EvidenceItemsModalComponent,
    CompletedCasesModalComponent,
    AddNewCaseModalComponent,
    UploadEvidenceModalComponent,
    AnalysisModelsModalComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  sidebarOpen = true;
  chart!: Chart;
  showToast: boolean = false;
  toastMessage: string = '';

  // Cards Data
  activeCasesCount: number = 0;
  activeCasesThisWeek: number = 0;
  evidenceCount: number = 0;
  evidencePending: number = 0;
  completedCasesCount: number = 0;
  completedThisMonth: number = 0;

  // Chart Data
  chartLabels: string[] = [];
  chartCases: number[] = [];
  chartEvidence: number[] = [];

  @ViewChild('activeModal') activeModalRef!: ActiveCasesModalComponent;
  @ViewChild('evidenceModal') evidenceModalRef!: EvidenceItemsModalComponent;
  @ViewChild('completedModal') completedModalRef!: CompletedCasesModalComponent;
  @ViewChild('addCaseModal') addCaseModalRef!: AddNewCaseModalComponent;
  @ViewChild('uploadEvidenceModal') uploadEvidenceModalRef!: UploadEvidenceModalComponent;
  @ViewChild('analysisModelsModal') analysisModelsModalRef!: AnalysisModelsModalComponent;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef 
  ) {}

 ngAfterViewInit(): void {
  setTimeout(() => {
    this.loadDashboardData();
  }, 0);
}

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        const data = res.data;

        // Cards
        this.activeCasesCount = data.overview.active_cases.total;
        this.activeCasesThisWeek = data.overview.active_cases.new_this_week;
        this.evidenceCount = data.overview.evidences.total;
        this.evidencePending = data.overview.evidences.pending_review;
        this.completedCasesCount = data.overview.completed_cases.total;
        this.completedThisMonth = data.overview.completed_cases.completed_this_month;

        // Chart
        this.chartLabels = data.chart_data.map((d: any) => d.day);
        this.chartCases = data.chart_data.map((d: any) => d.cases);
        this.chartEvidence = data.chart_data.map((d: any) => d.evidence);

        // Modals
        this.activeModalRef.setData(data.modals_data.active_cases_list);
        this.evidenceModalRef.setData(data.modals_data.evidences_list);
        this.completedModalRef.setData(data.modals_data.completed_cases_list);

        // Chart
        this.initChart();
            this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
      }
    });
  }

  initChart(): void {
    const canvas = document.getElementById('caseChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const gradientCases = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientCases.addColorStop(0, '#8E36D9');
    gradientCases.addColorStop(1, '#272B68');

    const gradientEvidence = ctx.createLinearGradient(10, 50, 0, canvas.height);
    gradientEvidence.addColorStop(0, '#3c52b3');
    gradientEvidence.addColorStop(1, '#9b6ead');

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            label: 'Cases',
            data: this.chartCases,
            backgroundColor: gradientCases,
            borderRadius: 6,
            barThickness: 20
          },
          {
            label: 'Evidence',
            data: this.chartEvidence,
            backgroundColor: gradientEvidence,
            borderRadius: 6,
            barThickness: 20
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#475569', font: { size: 13, weight: 500 } }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  openActiveCases() { this.activeModalRef.openModal(); }
  openEvidenceItems() { this.evidenceModalRef.openModal(); }
  openCompletedCases() { this.completedModalRef.openModal(); }
  openAddNewCase() { this.addCaseModalRef.openModal(); }
  openUploadEvidence() { this.uploadEvidenceModalRef.openModal(); }
  openAnalysisModels() { this.analysisModelsModalRef.openModal(); }

  onCaseAddedFromDashboard() {
    this.showNotification('Case created successfully!');
    this.loadDashboardData();
  }

  showNotification(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('demo_email');
    this.router.navigate(['/landing']);
  }
}