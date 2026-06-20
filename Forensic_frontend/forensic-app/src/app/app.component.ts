import { Component,OnInit } from '@angular/core';
import { RouterOutlet ,Router ,NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators'; 
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { TopNavbarComponent } from './core/components/top-navbar/top-navbar.component';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './shared/chatbot/chatbot.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    // NavbarComponent,
    // FooterComponent,
    SidebarComponent,
    CommonModule,
    TopNavbarComponent,
    ChatbotComponent

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  showSidebar = true;
  showChatbot = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkIfShowSidebar();
    
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfShowSidebar();
        this.checkIfShowChatbot();
      });
  }

  checkIfShowSidebar() {
    const currentUrl = this.router.url;
    const publicPages = [
      '/landing', 
      '/auth/login', 
      '/auth/signup', 
      '/auth/forgot-password',
      '/auth/check-email', 
      '/auth/reset-password',
        '/auth/verify-otp'
    ];
    
    const isPublic = publicPages.some(page => currentUrl.startsWith(page));
    this.showSidebar = !isPublic;
  }

  checkIfShowChatbot() {
    const currentUrl = this.router.url;
    const excludedPages = [
      '/landing', 
      '/auth/login', 
      '/auth/signup', 
      '/auth/forgot-password',
      '/auth/check-email', 
      '/auth/reset-password',
        '/auth/verify-otp'

    ];
    
    const shouldHide = excludedPages.some(page => currentUrl.startsWith(page));
    this.showChatbot = !shouldHide;
  }
}