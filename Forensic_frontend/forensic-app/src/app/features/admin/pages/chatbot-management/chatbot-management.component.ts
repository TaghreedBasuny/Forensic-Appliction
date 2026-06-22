import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. عدلنا النوع هنا عشان يقبل النصوص الطويلة زي Error - Timeout
interface ConversationLog {
  id: number;
  title: string;
  status: 'Success' | 'Error' | 'Error - Timeout'; 
  date: string;
}

@Component({
  selector: 'app-chatbot-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-management.component.html',
  styleUrls: ['./chatbot-management.component.scss']
})
export class ChatbotManagementComponent {
  
  conversationLogs: ConversationLog[] = [
    { id: 1, title: 'Verify this DNA', status: 'Success', date: 'Feb 12, 2026' },
    { id: 2, title: 'Analyze face recognition', status: 'Success', date: 'Feb 08, 2026' },
    { id: 3, title: 'Check deep fake video', status: 'Error - Timeout', date: 'Feb 03, 2026' },
  ];
}