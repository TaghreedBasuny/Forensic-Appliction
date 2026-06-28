import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service'; 
import { SettingsService } from '../../../features/settings/settings.service';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit, OnDestroy {
  pageTitle: string = '';
  
  currentUser: any = null;
  userInitials: string = '';
  
  private authSub!: Subscription;
  private routerSub!: Subscription;  

 constructor(
  private router: Router, 
  private titleService: Title,
  private authService: AuthService,
  private settingsService: SettingsService,
  private cd: ChangeDetectorRef
) {}

 ngOnInit() {
  this.authSub = this.authService.user$.subscribe(user => {
    setTimeout(() => {
      this.currentUser = user;

      if (user && user.name) {
        this.userInitials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      } else {
        this.userInitials = 'U';
      }

      this.cd.detectChanges();

      if (user && !user.avatar) {
        this.settingsService.getUserProfile().subscribe(res => {
          if (res.status && res.data?.image) {
            this.currentUser = { ...this.currentUser, avatar: res.data.image };
            this.cd.detectChanges();
          }
        });
      }
    });
  });

  this.routerSub = this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getPageTitleFromRoute())
    )
    .subscribe((title: string) => {
      this.pageTitle = title;
      this.titleService.setTitle(title);
    });

  this.pageTitle = this.getPageTitleFromRoute();
}
  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }


 getRouteForBreadcrumb(part: string): string {
  const routes: { [key: string]: string } = {
    'Explore': '/explore',
    'Analysis Models': '/explore/analysis-models',
    'Investigative Cases': '/explore/investigative-cases',
    'Deep Fake Detection': '/explore/analysis-models/deep-fake-detection',
    'Face Recognition': '/explore/analysis-models/face-recognition',
    'DNA Analysis': '/explore/analysis-models/dna-analysis',
    'Reconstruct Image': '/explore/analysis-models/reconstruct-image',
    'Admin Dashboard': '/admin/dashboard',
    'System Exports': '/admin/generate-global-report',
    'User List': '/admin/doctors-hub',
    'Case Audit': '/admin/case-audit',
    'System Logs': '/admin/system-logs',
    'Community Moderation': '/admin/community-moderation',
    'Chatbot Management': '/admin/chatbot-management'
  };

  return routes[part.trim()] || '/admin/dashboard';
}


  private getPageTitleFromRoute(): string {
    let child = this.router.routerState.root.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }
    const data = child?.snapshot.data['pageTitle'];
    if (Array.isArray(data)) {
      return data.join(' > ');
    }
    return data || 'Dashboard';
  }
}