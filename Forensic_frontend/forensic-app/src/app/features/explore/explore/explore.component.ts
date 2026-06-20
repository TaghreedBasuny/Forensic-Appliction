import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explore',
  standalone: true,
   imports: [CommonModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements AfterViewInit {

  sidebarOpen = true;

  constructor(private router: Router) {}
  navigateToInvestigativeCases() {
    console.log('Navigating to: /explore/investigative-cases');
    this.router.navigate(['/explore/investigative-cases']);
  }

   goToInvestigativeCases() {
    this.router.navigate(['/investigative-cases']);
  }
  ngAfterViewInit(): void {
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  goToAnalysisModels() {
  this.router.navigate(['/explore/analysis-models']);
}

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('demo_email');
    this.router.navigate(['/']); 
  }
}