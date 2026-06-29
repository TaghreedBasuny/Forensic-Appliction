import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService, ArticleItem, FeedItem, CommentItem } from '../../services/community.service';
import { Observable } from 'rxjs'; 

interface DisplayItem {
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
export class CommunityModerationComponent implements OnInit {
  
  activeTab: 'articles' | 'posts' | 'comments' = 'articles';
  isLoading = false;
  isDeleting = false; 

  articlesData: ArticleItem[] = [];
  feedsData: FeedItem[] = [];
  commentsData: CommentItem[] = [];

  pagesInfo: any = {
    articles: { currentPage: 1, totalPages: 1, total: 0 },
    posts: { currentPage: 1, totalPages: 1, total: 0 },
    comments: { currentPage: 1, totalPages: 1, total: 0 }
  };

  isDeleteModalOpen: boolean = false;
  itemToDeleteId: number | null = null;
  deleteType: 'article' | 'feed' | 'comment' | null = null;

  constructor(
    private communityService: CommunityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    
    let apiType: 'articles' | 'feeds' | 'comments' = 'articles';
    if (this.activeTab === 'posts') apiType = 'feeds';
    else if (this.activeTab === 'comments') apiType = 'comments';

    const currentPage = this.pagesInfo[this.activeTab].currentPage;

    this.communityService.getData(apiType, currentPage).subscribe({
      next: (response) => {
        const sectionData = response.data[apiType];
        
        if (apiType === 'articles') {
          this.articlesData = sectionData.data as ArticleItem[];
        } else if (apiType === 'feeds') {
          this.feedsData = sectionData.data as FeedItem[];
        } else if (apiType === 'comments') {
          this.commentsData = sectionData.data as CommentItem[];
        }

        this.pagesInfo[this.activeTab] = {
          currentPage: sectionData.current_page,
          totalPages: sectionData.last_page,
          total: sectionData.total
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching community data:', err);
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: 'articles' | 'posts' | 'comments'): void {
    this.activeTab = tab;
    this.fetchData();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagesInfo[this.activeTab].totalPages) {
      this.pagesInfo[this.activeTab].currentPage = page;
      this.fetchData();
    }
  }

  get currentData(): DisplayItem[] {
    if (this.activeTab === 'articles') {
      return this.articlesData.map(item => ({
        id: item.id,
        snippet: item.title,
        author: item.user.name,
        type: 'article'
      }));
    } 
    else if (this.activeTab === 'posts') {
      return this.feedsData.map(item => ({
        id: item.id,
        snippet: item.content,
        author: item.user.name,
        type: 'post'
      }));
    } 
    else {
      return this.commentsData.map(item => ({
        id: item.id,
        snippet: item.comment,
        author: item.user.name,
        type: 'comment'
      }));
    }
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.pagesInfo[this.activeTab].totalPages || 1 }, (_, i) => i + 1);
  }

  openDeleteModal(id: number): void {
    this.itemToDeleteId = id;
    this.deleteType = this.activeTab === 'posts' ? 'feed' : this.activeTab.slice(0, -1) as any;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.itemToDeleteId = null;
    this.deleteType = null;
  }

  
  confirmDelete(): void {
    if (!this.itemToDeleteId || !this.deleteType) return;

    this.isDeleting = true;
    this.cdr.detectChanges();

    let deleteRequest: Observable<any>;

    if (this.deleteType === 'article') {
      deleteRequest = this.communityService.deleteArticle(this.itemToDeleteId);
    } else if (this.deleteType === 'feed') {
      deleteRequest = this.communityService.deleteFeed(this.itemToDeleteId);
    } else {
      deleteRequest = this.communityService.deleteComment(this.itemToDeleteId);
    }

    deleteRequest.subscribe({
      next: () => {
        if (this.deleteType === 'article') {
          this.articlesData = this.articlesData.filter(i => i.id !== this.itemToDeleteId);
        } else if (this.deleteType === 'feed') {
          this.feedsData = this.feedsData.filter(i => i.id !== this.itemToDeleteId);
        } else if (this.deleteType === 'comment') {
          this.commentsData = this.commentsData.filter(i => i.id !== this.itemToDeleteId);
        }
        
        this.closeDeleteModal();
        this.isDeleting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`Failed to delete ${this.deleteType}:`, err);
        alert('Failed to delete item. Please try again.');
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }
}