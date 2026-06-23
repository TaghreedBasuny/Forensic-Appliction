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
  this.authService.logout().subscribe({
    next: () => this.router.navigate(['/auth/login']),
    error: () => this.router.navigate(['/auth/login']) // برضه نخرجها حتى لو فشل السيرفر
  });
}
  openLogoutModal() {
    this.showLogoutModal = true;
  }

 confirmLogout() {
  this.authService.logout().subscribe({
    next: () => this.router.navigate(['/landing']),
    error: () => this.router.navigate(['/landing'])
  });
}

  cancelLogout() {
    this.showLogoutModal = false;
  }
}