import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemLogService, LogItem } from '../../services/system-log.service';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.scss']
})
export class SystemLogsComponent implements OnInit {
  
  logsData: LogItem[] = [];
  currentPage = 1;
  totalPages = 1;
  totalLogs = 0;
  itemsPerPage = 6; 
  isLoading = false;

  constructor(private systemLogService: SystemLogService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(page: number = 1): void {
    this.isLoading = true;
    
    this.systemLogService.getLogs(page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.logsData = response.data.data;
        
        this.totalPages = response.data.last_page;
        this.totalLogs = response.data.total;
        this.currentPage = response.data.current_page;
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching logs:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.fetchLogs(page);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getActionType(message: string): string {
    if (message.includes('block')) return 'Suspend';
    if (message.includes('active')) return 'Active';
    if (message.includes('delete')) return 'Delete';
    if (message.includes('assign')) return 'Modify';
    return 'Other';
  }

  exportPDF(): void {
    console.log('Exporting logs to PDF...');
  }

  get startIndex(): number {
    return this.totalLogs === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalLogs ? this.totalLogs : end;
  }
  
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages || 1 }, (_, i) => i + 1);
  }
}