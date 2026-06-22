import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentItem {
  id: number;
  snippet: string;
  author: string;
  type: 'article' | 'post' | 'comment';
}

@Component({
  selector: 'app-community-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-moderation.component.html',
  styleUrls: ['./community-moderation.component.scss']
})
export class CommunityModerationComponent {
  
  activeTab: 'articles' | 'posts' | 'comments' = 'articles';
  
  isDeleteModalOpen: boolean = false;
  itemToDeleteId: number | null = null;

  allData: ContentItem[] = [
    { id: 1, snippet: 'How to use DNA Analysis in forensics...', author: 'Admin_Yaseen', type: 'article' },
    { id: 2, snippet: 'What is the best practice for crime scene...', author: 'Admin_Hema', type: 'post' },
    { id: 3, snippet: 'Great article! really helped me understand...', author: 'User_Ahmed', type: 'comment' },
    { id: 4, snippet: 'Update on the new security protocols...', author: 'Admin_Sakr', type: 'article' },
    { id: 5, snippet: 'Can someone explain the reconstruction model?', author: 'User_Sara', type: 'post' },
  ];

  get currentData(): ContentItem[] {
    return this.allData.filter(item => item.type === this.activeTab.slice(0, -1)); 
  }

  switchTab(tab: 'articles' | 'posts' | 'comments'): void {
    this.activeTab = tab;
  }

  openDeleteModal(id: number): void {
    this.itemToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.itemToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.itemToDeleteId !== null) {
      this.allData = this.allData.filter(item => item.id !== this.itemToDeleteId);
      this.closeDeleteModal();
    }
  }
}