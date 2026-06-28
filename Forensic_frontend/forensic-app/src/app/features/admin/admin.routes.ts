import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { DoctorsHubComponent } from './pages/doctors-hub/doctors-hub.component';
import { DoctorProfileComponent } from './pages/doctor-profile/doctor-profile.component';
import { CaseAuditComponent } from './pages/case-audit/case-audit.component'; 
import { SystemLogsComponent } from './pages/system-logs/system-logs.component';
import { CommunityModerationComponent } from './pages/community-moderation/community-moderation.component';
import { ChatbotManagementComponent } from './pages/chatbot-management/chatbot-management.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
   {
    path: 'doctors-hub',
    component: DoctorsHubComponent,
    data: { pageTitle: 'User List' }
  },
   {
    path: 'doctors-hub/profile/:id', 
    component: DoctorProfileComponent,
    data: { pageTitle: 'Doctor Profile' }
  },
  {
    path: 'case-audit',
    component: CaseAuditComponent,
    data: { pageTitle: 'Case Audit Monitoring' }
  },
  { 
    path: 'system-logs',
    component: SystemLogsComponent, 
    data: { pageTitle: 'System Logs' }
  },
  {
     path: 'community-moderation',
     component: CommunityModerationComponent, 
     data: { pageTitle: 'Community Moderation' }
  },
  { 
    path: 'chatbot-management', 
    component: ChatbotManagementComponent, 
    data: { pageTitle: 'Chatbot Management' }
  }



];