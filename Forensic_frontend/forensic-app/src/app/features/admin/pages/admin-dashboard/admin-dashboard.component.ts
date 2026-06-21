import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
interface AIModel {
  name: string;
  value: number;
  percentage: number;
}

interface Doctor {
  name: string;
  cases: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,                 
  imports: [CommonModule],          
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  totalDoctors = 42;
  activeCases = 850;
  totalPosts = 1225;

  yAxisLabels = ['2000', '1600', '1200', '800', '400', '0'];

  aiModels: AIModel[] = [
    { name: 'Deep Fake', value: 1900, percentage: 95 },
    { name: 'Face Recognition', value: 1200, percentage: 60 },
    { name: 'DNA', value: 600, percentage: 30 },
    { name: 'Reconstruct Image', value: 640, percentage: 32 }
  ];

  topDoctors: Doctor[] = [
    { name: 'Elias Thorne', cases: 142 },
    { name: 'Sarah Vance', cases: 128 },
    { name: 'Julian Marsh', cases: 115 },
    { name: 'Anita Ray', cases: 98 },
    { name: 'Leo Knox', cases: 87 }
  ];

  avatarColors = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3'];

  exportPDF() {
    console.log('Exporting to PDF...');
  }

  exportExcel() {
    console.log('Exporting to Excel...');
  }

  viewFullRanking() {
    console.log('Viewing full ranking...');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }
}