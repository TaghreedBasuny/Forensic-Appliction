import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CasesService } from '../../../core/services/cases.service';
import { Case, CreateCaseRequest } from '../../../core/models/models_auth/case.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-investigative-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investigative-cases.component.html',
  styleUrls: ['./investigative-cases.component.scss']
})
export class InvestigativeCasesComponent implements OnInit {
  // Search & Filter
  searchQuery: string = '';
  selectedFilter: string = 'all';
  isFilterOpen: boolean = false;
  
  // Display Cases
  displayedCases: any[] = [];
  
  // Delete Confirmation Modal
  showDeleteConfirm: boolean = false;
  deleteCaseId: number | null = null;  
  
  // Create Modal State
  showCreateModal: boolean = false;
  newCaseTitle: string = '';
  newCaseDescription: string = '';

  // Edit Modal State
  showEditModal: boolean = false;
  editingCaseId: number | null = null;
  editCaseData: { title: string; description: string } = { title: '', description: '' };

  // Toast Notification State
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  // Loading State
  isLoading: boolean = true;
  

  constructor(
    private router: Router,
    private casesService: CasesService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone 
  ) {}

 
  ngOnInit() {
  this.casesService.loadCasesFromApi();

  this.casesService.cases$.subscribe(cases => {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    });
  });
}
  
  // ================= FILTER & SEARCH =================
  applyFilters() {
    let filtered: any[] = [...this.casesService.getCasesValue()];

    if (this.selectedFilter === 'completed') {
      filtered = filtered.filter(c => 
        c.status === 'completed' || 
        c.status === 'complete' || 
        c.status === 'inactive'
      );
    } else if (this.selectedFilter === 'active') {
      filtered = filtered.filter(c => c.status === 'active');
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.caseNumber?.toLowerCase().includes(query)
      );
    }

    this.displayedCases = filtered;
  }

  getFilterLabel(): string {
    const labels: { [key: string]: string } = {
      'all': 'All Cases',
      'completed': 'Completed',
      'active': 'Active'
    };
    return labels[this.selectedFilter] || 'All Cases';
  }

  toggleFilter() { 
    this.isFilterOpen = !this.isFilterOpen; 
  }
  
  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.isFilterOpen = false;
    this.applyFilters();
  }

  // ================= CREATE CASE =================
  openCreateModal() {
    this.showCreateModal = true;
    this.newCaseTitle = '';
    this.newCaseDescription = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newCaseTitle = '';
    this.newCaseDescription = '';
  }

  createCase() {
    if (!this.newCaseTitle.trim() || !this.newCaseDescription.trim()) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    const request: CreateCaseRequest = {
      name: this.newCaseTitle,
      description: this.newCaseDescription,
      status: 'active',
    };

    this.casesService.createCase(request).subscribe({
      next: (response) => {
        this.casesService.addCaseToState(response);
        
        this.closeCreateModal();
        
        this.ngZone.run(() => {
          this.showToast = false; 
          setTimeout(() => {
            this.showNotification('Case created successfully!');
            this.cdr.detectChanges(); 
          }, 50);
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.showNotification('Failed to create case. Please try again.', 'error');
          this.cdr.detectChanges();
        });
        this.isLoading = false;
      }
    });
  }

  // ================= EDIT CASE =================
  openEditModal(caseItem: Case) {
    this.editingCaseId = caseItem.id;
    this.editCaseData = {
      title: caseItem.title,
      description: caseItem.description
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingCaseId = null;
    this.editCaseData = { title: '', description: '' };
  }

  saveEditCase() {
    if (!this.editingCaseId) return;

    const payload = {
      name: this.editCaseData.title,
      description: this.editCaseData.description
    };

    this.casesService.updateCase(this.editingCaseId, payload).subscribe({
      next: (res) => {
        if (res.status) {
          const updatedCase: Case = {
            ...this.displayedCases.find((c: any) => c.id === this.editingCaseId)!,
            title: res.data.name,
            description: res.data.description
          };
          this.casesService.updateCaseInState(updatedCase);
          this.closeEditModal();
          
          this.ngZone.run(() => {
            this.showToast = false;
            setTimeout(() => {
              this.showNotification('Case updated successfully');
              this.cdr.detectChanges();
            }, 50);
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.ngZone.run(() => {
          this.showNotification('Update failed', 'error');
          this.cdr.detectChanges();
        });
        this.isLoading = false;
      }
    });
  }

  // ================= DELETE CASE =================
  openDeleteConfirm(id: number) {
    this.deleteCaseId = id;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.deleteCaseId = null;
  }

  confirmDelete() {
    if (!this.deleteCaseId || this.isLoading) return;

    const idToDelete = this.deleteCaseId; 
    const backupCases = [...this.casesService.getCasesValue()];

    this.casesService.deleteCaseFromState(idToDelete);
    this.closeDeleteConfirm();
    this.isLoading = true;

    this.casesService.deleteCase(idToDelete).subscribe({
      next: (res) => {
        if (res.status) {
          this.ngZone.run(() => {
            this.showNotification('Deleted successfully', 'success');
            this.cdr.detectChanges();
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.casesService.restoreCases(backupCases);
        this.ngZone.run(() => {
          this.showNotification('Delete failed', 'error');
          this.cdr.detectChanges();
        });
        this.isLoading = false;
      }
    });
  }

  // ================= NAVIGATION =================
  viewCase(caseId: string | number) {
    this.router.navigate([`/explore/investigative-cases/${caseId}`]);
  }

  // ================= NOTIFICATION =================
  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.ngZone.run(() => {
        this.showToast = false;
        this.cdr.detectChanges();
      });
    }, 2900);
  }
}