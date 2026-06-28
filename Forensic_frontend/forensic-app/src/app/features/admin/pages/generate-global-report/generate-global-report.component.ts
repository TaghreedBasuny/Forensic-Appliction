import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  GlobalReportService,
  GlobalReportData,
  GlobalReportMetadata
} from '../../services/global-report.service'; 

@Component({
  selector: 'app-generate-global-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generate-global-report.component.html',
  styleUrls: ['./generate-global-report.component.scss']
})
export class GenerateGlobalReportComponent implements OnInit {
  reportData: GlobalReportData | null = null;
  metadata: GlobalReportMetadata | null = null;

  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private globalReportService: GlobalReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.globalReportService.getGlobalReportData().subscribe({
      next: (res) => {
        if (res.status) {
          this.reportData = res.data;
          this.metadata = res.metadata;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading report data', err);
        this.errorMessage = 'An error occurred while loading the report data.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ============ EXCEL EXPORT ============
  exportToExcel(): void {
    if (!this.reportData) {
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1: User Activity
    const userActivitySheet = XLSX.utils.json_to_sheet(
      this.reportData.user_activity.map(u => ({
        Name: u.name,
        Role: u.role,
        'Last Updated': new Date(u.updated_at).toLocaleString()
      }))
    );
    XLSX.utils.book_append_sheet(workbook, userActivitySheet, 'User Activity');

    // Sheet 2: Case Statistics
    const caseStatsSheet = XLSX.utils.json_to_sheet([
      {
        Total: this.reportData.case_statistics.total,
        Active: this.reportData.case_statistics.active,
        Completed: this.reportData.case_statistics.completed
      }
    ]);
    XLSX.utils.book_append_sheet(workbook, caseStatsSheet, 'Case Statistics');

    // Sheet 3: AI Performance
    const aiPerformanceSheet = XLSX.utils.json_to_sheet(
      this.reportData.ai_performance.map(a => ({
        Model: a.models,
        'Usage Count': a.usage_count
      }))
    );
    XLSX.utils.book_append_sheet(workbook, aiPerformanceSheet, 'AI Performance');

    // Sheet 4: Community Engagement
    const communitySheet = XLSX.utils.json_to_sheet([
      {
        Articles: this.reportData.community_engagement.articles,
        Feeds: this.reportData.community_engagement.feeds,
        Comments: this.reportData.community_engagement.comments
      }
    ]);
    XLSX.utils.book_append_sheet(workbook, communitySheet, 'Community Engagement');

    const fileName = `Global_Report_${this.metadata?.period || 'report'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // ============ PDF EXPORT ============
  exportToPDF(): void {
    if (!this.reportData) {
      return;
    }

    const doc = new jsPDF();
    let currentY = 15;

    doc.setFontSize(16);
    doc.text('Global Report', 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.text(`Period: ${this.metadata?.period || ''}`, 14, currentY);
    currentY += 5;
    doc.text(`Generated at: ${this.metadata?.generated_at || ''}`, 14, currentY);
    currentY += 10;

    // Case Statistics
    doc.setFontSize(12);
    doc.text('Case Statistics', 14, currentY);
    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      head: [['Total', 'Active', 'Completed']],
      body: [[
        this.reportData.case_statistics.total,
        this.reportData.case_statistics.active,
        this.reportData.case_statistics.completed
      ]]
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // AI Performance
    doc.setFontSize(12);
    doc.text('AI Models Performance', 14, currentY);
    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      head: [['Model', 'Usage Count']],
      body: this.reportData.ai_performance.map(a => [a.models, a.usage_count])
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Community Engagement
    doc.setFontSize(12);
    doc.text('Community Engagement', 14, currentY);
    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      head: [['Articles', 'Feeds', 'Comments']],
      body: [[
        this.reportData.community_engagement.articles,
        this.reportData.community_engagement.feeds,
        this.reportData.community_engagement.comments
      ]]
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;

    // User Activity (can be long, placed last on a new page)
    doc.addPage();
    currentY = 15;
    doc.setFontSize(12);
    doc.text('User Activity', 14, currentY);
    currentY += 4;
    autoTable(doc, {
      startY: currentY,
      head: [['Name', 'Role', 'Last Updated']],
      body: this.reportData.user_activity.map(u => [
        u.name,
        u.role,
        new Date(u.updated_at).toLocaleString()
      ])
    });

    const fileName = `Global_Report_${this.metadata?.period || 'report'}.pdf`;
    doc.save(fileName);
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}