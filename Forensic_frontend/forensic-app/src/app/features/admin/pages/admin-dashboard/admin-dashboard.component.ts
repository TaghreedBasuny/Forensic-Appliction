import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, TopDoctorApi, ChartDataApi } from '../../services/dashboard.service'; 
interface AIModel {
  name: string;
  value: number;
  percentage: number;
}

interface Doctor {
  name: string;
  cases: number;
  image: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  totalDoctors = 0;
  activeCases = 0;
  totalPosts = 0;

  yAxisLabels: string[] = [];

  aiModels: AIModel[] = [];

  topDoctors: Doctor[] = [];

  avatarColors = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3'];

  isLoading = true;
  errorMessage = '';

  imageBaseUrl: string;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
    this.imageBaseUrl = this.dashboardService.imageBaseUrl;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        if (res.status) {
          const { statistics, top_doctors, chart_data } = res.data;

          this.totalDoctors = statistics.total_doctors;
          this.activeCases = statistics.active_cases;
          this.totalPosts = statistics.total_feeds_posts;

          this.topDoctors = top_doctors.map((d: TopDoctorApi) => ({
            name: d.name,
            cases: d.cases_count,
            image: d.image
          }));

          this.aiModels = this.buildAiModels(chart_data);
          this.yAxisLabels = this.buildYAxisLabels(this.aiModels);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.errorMessage = 'An error occurred while loading the dashboard data.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildAiModels(chartData: ChartDataApi[]): AIModel[] {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    const maxValue = Math.max(...chartData.map(c => c.total_used), 1);

    return chartData.map(c => ({
      name: this.formatModelName(c.models),
      value: c.total_used,
      percentage: Math.round((c.total_used / maxValue) * 100)
    }));
  }

  // "deep fake" -> "Deep Fake"
  private formatModelName(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private buildYAxisLabels(models: AIModel[]): string[] {
    if (models.length === 0) {
      return ['0'];
    }
    const maxVal = Math.max(...models.map(m => m.value));
    const roundedMax = Math.ceil(maxVal / 10) * 10 || 10;
    const step = roundedMax / 4;

    const labels: string[] = [];
    for (let i = 4; i >= 0; i--) {
      labels.push(Math.round(step * i).toString());
    }
    return labels;
  }

  
  viewFullRanking(): void {
    console.log('Viewing full ranking...');
  }

  navigateToGlobalReport(): void {
    this.router.navigate(['/admin/generate-global-report']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }

  getDoctorImageUrl(image: string | null): string | null {
    if (!image) {
      return null;
    }
    return this.imageBaseUrl + image;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }
}