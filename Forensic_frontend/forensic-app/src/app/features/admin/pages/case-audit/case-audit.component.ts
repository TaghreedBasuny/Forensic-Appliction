import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseAuditService } from '../../services/case-audit.service';
import { CaseRecord } from '../../models/case-audit.model';

@Component({
  selector: 'app-case-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-audit.component.html',
  styleUrls: ['./case-audit.component.scss']
})
export class CaseAuditComponent implements OnInit {

  searchTerm: string = '';
  allCases: CaseRecord[] = [];      
  filteredCases: CaseRecord[] = [];

  currentPage = 1;
  itemsPerPage = 10; 
  totalCases = 0;
  totalPages = 1;

  loading = false;
  errorMsg = '';

  constructor(private caseService: CaseAuditService,
    private cdr: ChangeDetectorRef, 
  ) {}

  ngOnInit(): void {
    this.fetchCases(this.currentPage);
  }

  fetchCases(page: number): void {
    this.loading = true;
    this.errorMsg = '';

    this.caseService.getCases(page).subscribe({
      next: (res) => {
        this.allCases = res.cases;
        this.filteredCases = [...res.cases];
        this.totalCases = res.total;
        this.totalPages = res.lastPage;
        this.currentPage = page;
        this.loading = false;
              this.cdr.detectChanges();

      },
      error: (err) => {
        console.error(err);
        this.loading = false;
                this.cdr.detectChanges();

      }
    });
  }

  get paginatedCases(): CaseRecord[] {
    return this.filteredCases;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages || 1 }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return this.totalCases === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalCases ? this.totalCases : end;
  }

  filterCases(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCases = this.allCases.filter(c =>
      c.caseId.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.leadDoctor.toLowerCase().includes(term)
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.fetchCases(page);
    }
  }
}