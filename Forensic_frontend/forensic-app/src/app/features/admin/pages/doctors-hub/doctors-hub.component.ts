import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorsHubService } from '../../services/doctors-hub.service';
import { UserViewModel, DoctorApi, AdminApi } from '../../models/user.model';

@Component({
  selector: 'app-doctors-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors-hub.component.html',
  styleUrls: ['./doctors-hub.component.scss']
})
export class DoctorsHubComponent implements OnInit {
  activeTab: 'doctors' | 'admin' = 'doctors';
  currentPage = 1;
  itemsPerPage = 6;

  isLoading = false;
  errorMsg = '';

  allDoctors: UserViewModel[] = [];
  allAdmins: UserViewModel[] = [];

  constructor(private doctorsHubService: DoctorsHubService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.doctorsHubService.getDoctorsAndAdmins().subscribe({
      next: (res) => {
        this.allDoctors = res.doctors.data.map((d: DoctorApi) => this.mapDoctor(d));
        this.allAdmins = res.admins.data.map((a: AdminApi) => this.mapAdmin(a));
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'An error occurred while loading the data.';
        this.isLoading = false;
      }
    });
  }

  private mapDoctor(d: DoctorApi): UserViewModel {
    return {
      id: d.id,
      name: d.name,
      nationalId: d.national_id ?? '—',
      registerDate: this.formatDate(d.created_at),
      status: d.status === 'active' ? 'Active' : 'Blocked'
    };
  }

  private mapAdmin(a: AdminApi): UserViewModel {
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      registerDate: this.formatDate(a.created_at),
      status: a.status === 'active' ? 'Active' : 'Blocked'
    };
  }

  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get currentUsers(): UserViewModel[] {
    const users = this.activeTab === 'doctors' ? this.allDoctors : this.allAdmins;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return users.slice(start, start + this.itemsPerPage);
  }

  get totalUsers(): number {
    return this.activeTab === 'doctors' ? this.allDoctors.length : this.allAdmins.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalUsers / this.itemsPerPage));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return this.totalUsers === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalUsers ? this.totalUsers : end;
  }

  switchTab(tab: 'doctors' | 'admin'): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleStatus(user: UserViewModel): void {
    const previousStatus = user.status;
    // Optimistic update
    user.status = user.status === 'Active' ? 'Blocked' : 'Active';

    this.doctorsHubService.toggleActive(user.id).subscribe({
      next: (res) => {
        user.status = res.status === 'active' ? 'Active' : 'Blocked';
      },
      error: (err) => {
        console.error(err);
        user.status = previousStatus; 
        alert('An error occurred; try again.');
      }
    });
  }

  exportPDF(): void {
    console.log(`Exporting ${this.activeTab} list to PDF...`);
  }
}