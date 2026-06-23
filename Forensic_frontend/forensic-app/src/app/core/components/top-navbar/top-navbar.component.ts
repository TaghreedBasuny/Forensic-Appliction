import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service'; 

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
    switch(part.trim()) {
      case 'Explore': return '/explore';
      case 'Analysis Models': return '/explore/analysis-models';
      case 'Investigative Cases': return '/explore/investigative-cases';
      case 'Deep Fake Detection': return '/explore/analysis-models/deep-fake-detection';
      case 'Face Recognition': return '/explore/analysis-models/face-recognition';
      case 'DNA Analysis': return '/explore/analysis-models/dna-analysis';
      case 'Reconstruct Image': return '/explore/analysis-models/reconstruct-image';
      default: return '/dashboard';
    }
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