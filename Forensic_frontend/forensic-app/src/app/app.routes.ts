// app.routes.ts
import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { CheckEmailComponent } from './features/auth/pages/check-email/check-email.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ExploreComponent } from './features/explore/explore/explore.component';
import { AnalysisModelsComponent } from './features/explore/analysis-models/analysis-models.component';
import { DeepFakeDetectionComponent } from './features/explore/analysis-models/deep-fake-detection/deep-fake-detection.component';
import { authGuard } from './core/guards/auth-guard';
import { FaceRecognitionComponent } from './features/explore/analysis-models/face-recognition/face-recognition.component';
import { DNAAnalysisComponent } from './features/explore/analysis-models/dna-analysis/dna-analysis.component';
import { ActiveCasesModalComponent} from './features/dashboard/model cases/active-cases-modal/active-cases-modal.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ReconstructImageComponent } from './features/explore/analysis-models/reconstruct-image/reconstruct-image.component';
import { CommunityFeedComponent } from './features/community/community-feed/community-feed.component';
import { InvestigativeCasesComponent } from './features/explore/investigative-cases/investigative-cases.component';
import { CaseDetailsComponent } from './features/explore/investigative-cases/case-details/case-details.component';
import {VerifyOtpComponent} from './features/auth/pages/verify-otp/verify-otp.component';
import { adminGuard } from './core/guards/admin.guard';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { DoctorsHubComponent } from './features/admin/pages/doctors-hub/doctors-hub.component';
import { DoctorProfileComponent } from './features/admin/pages/doctor-profile/doctor-profile.component';
import { CaseAuditComponent } from './features/admin/pages/case-audit/case-audit.component'; 
import { SystemLogsComponent } from './features/admin/pages/system-logs/system-logs.component';
import { CommunityModerationComponent } from './features/admin/pages/community-moderation/community-moderation.component';
import { ChatbotManagementComponent } from './features/admin/pages/chatbot-management/chatbot-management.component';
import { GenerateGlobalReportComponent } from './features/admin/pages/generate-global-report/generate-global-report.component';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  { path: 'landing', component: LandingComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/check-email', component: CheckEmailComponent }, 
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/verify-otp', component: VerifyOtpComponent }, 
  { path: 'active-cases', component: ActiveCasesModalComponent },

  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { pageTitle: 'Dashboard' }
  },

  { 
    path: 'explore',
    component: ExploreComponent,
    canActivate: [authGuard],
    data: { pageTitle: 'Explore' }
  },

 { 
  path: 'explore/analysis-models',
  component: AnalysisModelsComponent,
  canActivate: [authGuard],
  data: { pageTitle: ['Explore', 'Analysis Models'] }
},
  { 
    path: 'explore/investigative-cases', 
    component: InvestigativeCasesComponent,
    canActivate: [authGuard],  
    data: { pageTitle: ['Explore', 'Investigative Cases'] }
  },
{ 
  path: 'explore/investigative-cases/:caseId', 
  component: CaseDetailsComponent,
  canActivate: [authGuard],
  data: { pageTitle: ['Explore', 'Investigative Cases', 'Case'] }
},
  { 
    path: 'explore/analysis-models/deep-fake-detection',
    component: DeepFakeDetectionComponent,
    canActivate: [authGuard],
    data: { pageTitle: 'Deep Fake Detection' }
  },
 {
  path: 'explore/analysis-models/face-recognition',
  loadComponent: () =>
    import('./features/explore/analysis-models/face-recognition/face-recognition.component')
      .then(m => m.FaceRecognitionComponent),
      canActivate: [authGuard],
       data: { pageTitle: 'Face Recognition' }
},
{
    path: 'explore/analysis-models/dna-analysis',
    loadComponent: () =>
      import('./features/explore/analysis-models/dna-analysis/dna-analysis.component')
        .then(m => m.DNAAnalysisComponent),
    canActivate: [authGuard], 
    data: { pageTitle: 'DNA Analysis' } 
  },
  { 
    path: 'explore/analysis-models/reconstruct-image',
    component: ReconstructImageComponent,
    canActivate: [authGuard],
    data: { pageTitle: 'Reconstruct Image' }
  },
   { 
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
    data: { pageTitle: 'Settings' }
  },
  { 
  path: 'community',
  component: CommunityFeedComponent,
  canActivate: [authGuard], 
  data: { pageTitle: 'Community' }
},

{ 
  path: 'admin/dashboard',
  component: AdminDashboardComponent,
  canActivate: [authGuard, adminGuard],
  data: { pageTitle: 'Admin Dashboard' }
},
{ 
  path: 'admin/generate-global-report',  
  component: GenerateGlobalReportComponent,
  canActivate: [authGuard, adminGuard],
  data: { pageTitle: ['Admin Dashboard', 'System Exports'] }  
},  { 
    path: 'admin/doctors-hub',
    component: DoctorsHubComponent,
    canActivate: [authGuard, adminGuard],
    data: { pageTitle: 'User List' }
  },
  { 
  path: 'admin/doctors-hub/profile/:id',
  component: DoctorProfileComponent,
  canActivate: [authGuard, adminGuard], 
  data: { pageTitle: ['User List','Doctor Profile'] }
},
 { 
    path: 'admin/case-audit',
    component: CaseAuditComponent,
    canActivate: [authGuard, adminGuard], 
    data: { pageTitle: 'Case Audit Monitoring' }
  },
  { 
  path: 'admin/system-logs',
  component: SystemLogsComponent,
  canActivate: [authGuard, adminGuard],
  data: { pageTitle: 'System Logs' }
},
{ 
  path: 'admin/community-moderation',
  component: CommunityModerationComponent,
  canActivate: [authGuard, adminGuard],
  data: { pageTitle: 'Community Moderation' }
},
{ 
  path: 'admin/chatbot-management',
  component: ChatbotManagementComponent,
  canActivate: [authGuard, adminGuard],
  data: { pageTitle: 'Chatbot Management' }
},

  { path: '**', redirectTo: '/landing' }

  // {
  //   path: 'explore',
  //   component: ExploreComponent,
  //   children: [
  //     {
  //       path: 'deep-fake',
  //       loadComponent: () =>
  //         import('../../src/app/features/explore/analysis-models/deep-fake-detection/deep-fake-detection.component')
  //           .then(m => m.DeepFakeDetectionComponent),
  //     },
  //     { path: '', redirectTo: 'deep-fake', pathMatch: 'full' }
  //   ]
  // },
];