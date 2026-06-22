import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  sidebarOpen = true;
  localStorage = localStorage;
  showLogoutModal = false;
  isAdmin = false;   // ← جديد

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }
}