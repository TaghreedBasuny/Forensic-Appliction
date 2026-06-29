import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DoctorsHubService } from '../../services/doctors-hub.service';

interface DoctorProfileView {
  id: number;
  name: string;
  email: string;
  nationalId: string;
  status: 'Active' | 'Blocked';
  totalCases: number;
  articles: number;
  avatarUrl?: string;
  joinDate: string;
  activityLevel: string;
}

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit {
  doctor: DoctorProfileView | null = null;
  isLoading = false;
  errorMsg = '';
  isAssigning = false;
  isAssigned = false;
 assignMessage = '';
  assignSuccess = false;
  constructor(
    private route: ActivatedRoute,
    private doctorsHubService: DoctorsHubService,
    private cdr: ChangeDetectorRef
  ) {}

 ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  const id = idParam ? +idParam : 0;

  const passedDate = (history.state && history.state.registerDate) || null;

  this.loadProfile(id, passedDate);
}

private loadProfile(id: number, passedDate: string | null): void {
  this.isLoading = true;
  this.doctorsHubService.getDoctorProfile(id).subscribe({
    next: (res) => {
      const info = res.data.doctor_info;
      this.doctor = {
        id: info.id,
        name: info.name,
        email: info.email,
        nationalId: info.national_id ?? '—',
        status: info.status === 'active' ? 'Active' : 'Blocked',
        totalCases: info.total_cases,
        articles: info.total_articles,
        avatarUrl: info.image ?? 'assets/default-avatar.png',
        joinDate: passedDate ?? 'N/A',
        activityLevel: this.calculateActivityLevel(info.total_cases, info.total_articles)
      };
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private calculateActivityLevel(cases: number, articles: number): string {
    const total = cases + articles;
    if (total >= 50) return 'Very Active';
    if (total >= 20) return 'Active';
    if (total >= 5) return 'Moderate';
    return 'Low';
  }

  toggleStatus(): void {
    if (!this.doctor) return;
    const previousStatus = this.doctor.status;

    this.doctorsHubService.toggleActive(this.doctor.id).subscribe({
      next: (res) => {
        this.doctor!.status = res.status === 'active' ? 'Active' : 'Blocked';
      },
      error: (err) => {
        console.error(err);
        this.doctor!.status = previousStatus;
        alert('An error occurred; try again.');
      }
    });
  }

  assignAdmin(): void {
  if (!this.doctor || this.isAssigning) return;
  this.isAssigning = true;

  this.doctorsHubService.assignAdmin(this.doctor.id).subscribe({
    next: (res) => {
      this.isAssigned = true;
      this.isAssigning = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.isAssigning = false;
      this.cdr.detectChanges();
    }
  });
}

}