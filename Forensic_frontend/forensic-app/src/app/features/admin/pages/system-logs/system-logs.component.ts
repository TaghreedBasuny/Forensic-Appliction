import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SystemLog {
  id: number;
  description: string;
  adminName: string;
  timestamp: string;
  type: 'Export' | 'Delete' | 'Modify' | 'Suspend';
}

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.scss']
})
export class SystemLogsComponent {
  
  allLogs: SystemLog[] = [
    { id: 1, description: 'Exported Doctors List (Excel)', adminName: 'Admin_Taghreed', timestamp: '2026-04-23 10:15', type: 'Export' },
    { id: 2, description: 'Deleted Case #1847', adminName: 'Admin_Nada', timestamp: '2026-04-22 16:45', type: 'Delete' },
    { id: 3, description: 'Modified System Settings', adminName: 'Admin_Anas', timestamp: '2026-04-22 09:30', type: 'Modify' },
    { id: 4, description: 'Blocked User #445', adminName: 'Admin_Abdulrahman', timestamp: '2026-04-21 13:20', type: 'Suspend' },
    { id: 5, description: 'Suspended Doctor #201', adminName: 'Admin_Yaseen', timestamp: '2026-04-23 14:20', type: 'Suspend' },
    // بيانات إضافية للتجربة
    { id: 6, description: 'Updated Security Policy', adminName: 'Admin_Sakr', timestamp: '2026-04-20 11:00', type: 'Modify' },
    { id: 7, description: 'Exported Audit Report', adminName: 'Admin_Taghreed', timestamp: '2026-04-19 15:30', type: 'Export' },
    { id: 8, description: 'Deleted Old Logs', adminName: 'Admin_Nada', timestamp: '2026-04-18 09:15', type: 'Delete' },
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  get totalLogs(): number {
    return this.allLogs.length;
  }

  get paginatedLogs(): SystemLog[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allLogs.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalLogs / this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages || 1 }, (_, i) => i + 1);
  }

  get startIndex(): number {
    return this.totalLogs === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalLogs ? this.totalLogs : end;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportPDF(): void {
    console.log('Exporting logs to PDF...');
  }
}