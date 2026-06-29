import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatManagementService, ChatItem } from '../../services/chat-management.service';

@Component({
  selector: 'app-chatbot-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-management.component.html',
  styleUrls: ['./chatbot-management.component.scss']
})
export class ChatbotManagementComponent implements OnInit {
  
  chatsData: ChatItem[] = [];
  currentPage = 1;
  totalPages = 1;
  totalChats = 0;
  isLoading = false;

  constructor(
    private chatService: ChatManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchChats();
  }

  fetchChats(page: number = 1): void {
    this.isLoading = true;
    this.chatService.getChats(page).subscribe({
      next: (response) => {
        const conversationData = response.data.Conversation;
        this.chatsData = conversationData.data;
        this.totalPages = conversationData.last_page;
        this.totalChats = conversationData.total;
        this.currentPage = conversationData.current_page;
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching chats:', err);
        this.isLoading = false;
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.fetchChats(page);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages || 1 }, (_, i) => i + 1);
  }
}