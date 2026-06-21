import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // مهم للـ Search

interface CaseRecord {
  id: number;
  caseId: string;
  leadDoctor: string;
  evidenceCount: number;
  status: 'Active' | 'Complete';
}

@Component({
  selector: 'app-case-audit',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './case-audit.component.html',
  styleUrls: ['./case-audit.component.scss']
})
export class CaseAuditComponent {
  
  searchTerm: string = '';
  allCases: CaseRecord[] = [
    { id: 1, caseId: 'CS-2024-0891', leadDoctor: 'Dr. Mohammed Sakr', evidenceCount: 8, status: 'Active' },
    { id: 2, caseId: 'CS-2024-0893', leadDoctor: 'Dr. Julianne Davis', evidenceCount: 8, status: 'Complete' },
    { id: 3, caseId: 'CS-2024-0852', leadDoctor: 'Dr. Elena Lopez', evidenceCount: 8, status: 'Active' },
    { id: 4, caseId: 'CS-2024-0878', leadDoctor: 'Dr. Sara Ali', evidenceCount: 8, status: 'Active' },
    { id: 5, caseId: 'CS-2024-0866', leadDoctor: 'Dr. Taghreed Mohammed', evidenceCount: 8, status: 'Complete' },
    { id: 6, caseId: 'CS-2024-0833', leadDoctor: 'Dr. Basmala Mohammed', evidenceCount: 8, status: 'Active' },
    { id: 7, caseId: 'CS-2024-0901', leadDoctor: 'Dr. Ahmed Hassan', evidenceCount: 12, status: 'Active' },
    { id: 8, caseId: 'CS-2024-0915', leadDoctor: 'Dr. Fatima Al-Rashid', evidenceCount: 5, status: 'Complete' },
    { id: 9, caseId: 'CS-2024-0922', leadDoctor: 'Dr. Omar Khalil', evidenceCount: 20, status: 'Active' },
    { id: 10, caseId: 'CS-2024-0940', leadDoctor: 'Dr. Layla Mansour', evidenceCount: 3, status: 'Complete' },
    { id: 11, caseId: 'CS-2024-0955', leadDoctor: 'Dr. Karim Nabil', evidenceCount: 15, status: 'Active' },
    { id: 12, caseId: 'CS-2024-0968', leadDoctor: 'Dr. Hana Youssef', evidenceCount: 7, status: 'Active' },
  ];

  filteredCases: CaseRecord[] = [...this.allCases];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;

  get totalCases(): number {
    return this.filteredCases.length;
  }

  get paginatedCases(): CaseRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCases.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCases / this.itemsPerPage);
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
      c.leadDoctor.toLowerCase().includes(term)
    );
    this.currentPage = 1; // رجع للصفحة الأولى عند البحث
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}