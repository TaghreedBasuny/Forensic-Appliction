import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article } from '../models/community.models';
import { CommunityService } from '../services/community.service';
import { AuthService } from '../../../core/services/auth.service'; 
import { environment } from '../../../../environments/environment';
export interface Comment {
  id: number;
  user_id: number;
  userName: string;
  text: string;
  created_at: string;
}

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  @Input() articles: Article[] = [];
  @Output() articleCreated = new EventEmitter<any>();
  @Output() likeToggled = new EventEmitter<number>();
  @Output() commentClicked = new EventEmitter<number>();
  @Output() shareClicked = new EventEmitter<number>();

  showArticleModal = false;
  newArticle = { title: '', content: '', imageFile: null as File | null, imagePreview: null as string | null };
  showEditArticleModal = false;
  showDeleteArticleModal = false;
  editArticleData: any = {};
  articleToDeleteId: number | null = null;
  currentUserId: number | null = null;
  searchText: string = '';
  
  // Comment Logic Variables
  comments: { [articleId: number]: Comment[] } = {};
  newCommentText: { [articleId: number]: string } = {};
  showCommentSection: { [articleId: number]: boolean } = {};
  
  // Edit/Delete Comment Modals
  editingComment: any = null;
  editText: string = '';
  deleteCommentId: number | null = null;
  selectedPostId: number | null = null; 
  showEditCommentModal: boolean = false;
  showDeleteCommentModal: boolean = false;

  showToast: boolean = false;
  toastMessage: string = '';
  private viewedArticles = new Set<number>();

  constructor(
    private CommunityService: CommunityService,
    private authService: AuthService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.currentUserId = user?.id || null;
    
    this.loadPublications();
  }

  filteredArticles() {
    if (!this.searchText.trim()) {
      return this.articles;
    }

    const search = this.searchText.toLowerCase();

    return this.articles.filter(article =>
      article.title?.toLowerCase().includes(search) ||
      article.content?.toLowerCase().includes(search) ||
      article.authorName?.toLowerCase().includes(search)
    );
  }

  loadPublications() {
    this.CommunityService.getPublications().subscribe({
      next: (res) => {
        this.articles = res.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          imageUrl: item.image ? (item.image.startsWith('http') ? item.image : `${environment.apiUrl}/storage/${item.image}`) : null,
          authorName: item.user?.name,
          user_id: item.user?.id,
          likes: item.likes_count,
          comments: item.comments_count,
          shares: item.shares_count || 0,
          isLiked: item.is_liked,
          timestamp: item.created_at
        }));
        this.cdr.detectChanges();
         setTimeout(() => {
        this.observeArticles();
      }, 0);
      }
      
    });
  }

  openModal() { 
    this.showArticleModal = true; 
    this.newArticle = { title: '', content: '', imageFile: null, imagePreview: null }; 
  }
  closeModal() { this.showArticleModal = false; }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newArticle.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.newArticle.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  removeImage() { 
    this.newArticle.imageFile = null; 
    this.newArticle.imagePreview = null; 
  }

  publishArticle() {
    const formData = new FormData();
    formData.append('title', this.newArticle.title);
    formData.append('content', this.newArticle.content);
    if (this.newArticle.imageFile) {
      formData.append('image', this.newArticle.imageFile);
    }

    this.CommunityService.addArticle(formData).subscribe({
      next: (res: any) => {
        this.closeModal();
        this.loadPublications(); 
      },
      error: (err) => console.log(err)
    });
  }

  handleLike(articleId: number) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;
    const previousState = article.isLiked;
    article.isLiked = !article.isLiked;
    article.likes += article.isLiked ? 1 : -1;

    this.CommunityService.toggleArticleLike(articleId).subscribe({
      next: () => {},
      error: () => {
        article.isLiked = previousState;
        article.likes += article.isLiked ? 1 : -1;
      }
    });
  }  

  trackById(index: number, item: any) { return item.id; }

  // --- Comment Logic ---

  toggleComments(articleId: number) {
    this.showCommentSection[articleId] = !this.showCommentSection[articleId];
    if (this.showCommentSection[articleId]) {
      this.CommunityService.getPost(articleId).subscribe(res => {
        this.comments[articleId] = res.comments.map((c: any) => ({
          id: c.id,
          user_id: c.user.id,
          userName: c.user?.name,
          text: c.comment,
          created_at: c.created_at
        }));
        this.cdr.detectChanges();
      });
    }
  }

  addComment(articleId: number) {
    const text = this.newCommentText[articleId]?.trim();
    if (!text) return;

    const user = this.authService.currentUserValue;
    const newComment: Comment = {
      id: Date.now(),
      user_id: user?.id || 0,
      userName: user?.name || 'User',
      text: text,
      created_at: new Date().toISOString()
    };

    const currentComments = this.comments[articleId] || [];
    this.comments[articleId] = [newComment, ...currentComments];
    
    const article = this.articles.find(a => a.id === articleId);
    if (article) article.comments++;
    
    this.newCommentText[articleId] = '';

    this.CommunityService.addComment(articleId, text).subscribe({
      next: (res: any) => {
        newComment.id = res.data.id;
        newComment.created_at = res.data.created_at;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding comment', err);
      }
    });
  }

  // Edit Comment
  openEditComment(comment: any, articleId: number) {
    this.editingComment = comment;
    this.editText = comment.text;
    this.selectedPostId = articleId;
    this.showEditCommentModal = true;
  }

  saveEditComment() {
    if (!this.editingComment) return;
    const commentId = this.editingComment.id;
    const oldText = this.editingComment.text;
    
    this.editingComment!.text = this.editText;
    
    this.closeEditModal(); 

    // 3. Send request to server in background
    this.CommunityService.updateComment(commentId, this.editText).subscribe({
      next: () => {
        // Success - do nothing extra, UI is already updated
      },
      error: () => {
        // Revert change if failed
        this.editingComment!.text = oldText;
        alert('Failed to update comment');
      }
    });
  }

  closeEditModal() {
    this.showEditCommentModal = false;
    this.editingComment = null;
    this.editText = '';
  }

  // Delete Comment
  openDeleteComment(comment: any, articleId: number) {
    this.deleteCommentId = comment.id;
    this.selectedPostId = articleId;
    this.showDeleteCommentModal = true;
  }

  confirmDeleteComment() {
    if (!this.deleteCommentId || !this.selectedPostId) return;
    
    const articleId = this.selectedPostId;
    const commentId = this.deleteCommentId;

    this.comments[articleId] = this.comments[articleId].filter(c => c.id !== commentId);
    const article = this.articles.find(a => a.id === articleId);
    if (article && article.comments > 0) article.comments--;

    this.CommunityService.deleteComment(commentId).subscribe({
      next: () => {
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting comment', err);
      }
    });
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteCommentModal = false;
    this.deleteCommentId = null;
    this.selectedPostId = null;
  }

  handleShare(id: number) {
    this.CommunityService.shareArticle(id).subscribe({
      next: (res) => {
        if (res.share_link) {
          navigator.clipboard.writeText(res.share_link).then(() => {
            this.toastMessage = 'Article link copied successfully'; 
            this.showToast = true;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.showToast = false;
              this.cdr.detectChanges();
            }, 2500);
          });
        }
      }
    });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    if (isNaN(Date.parse(dateStr))) return dateStr;
    const date = new Date(dateStr);
    const now = new Date();
    if (isNaN(date.getTime())) return '';
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  }


  openEditArticle(article: any) {
    this.editArticleData = { ...article };
    this.showEditArticleModal = true;
  }

  closeEditArticleModal() {
    this.showEditArticleModal = false;
    this.editArticleData = {};
  }

  saveEditArticle() {
    if (!this.editArticleData.id) return;

    const formData = new FormData();
    formData.append('title', this.editArticleData.title);
    formData.append('content', this.editArticleData.content);
    this.CommunityService.updateArticle(this.editArticleData.id, formData).subscribe({
      next: () => {
        const index = this.articles.findIndex(a => a.id === this.editArticleData.id);
        if (index !== -1) {
          this.articles[index].title = this.editArticleData.title;
          this.articles[index].content = this.editArticleData.content;
        }
        this.closeEditArticleModal();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error updating article', err);
      }
    });
  }

  openDeleteArticle(id: number) {
    this.articleToDeleteId = id;
    this.showDeleteArticleModal = true;
  }

  closeDeleteArticleModal() {
    this.showDeleteArticleModal = false;
    this.articleToDeleteId = null;
  }

  confirmDeleteArticle() {
    if (!this.articleToDeleteId) return;

    this.CommunityService.deleteArticle(this.articleToDeleteId).subscribe({
      next: () => {
        this.articles = this.articles.filter(a => a.id !== this.articleToDeleteId);
        this.closeDeleteArticleModal();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error deleting article', err);
      }
    });
  }

  observeArticles() {
    const elements = document.querySelectorAll('.article-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {

        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-id'));

          if (!this.viewedArticles.has(id)) {
            this.viewedArticles.add(id);
            this.incrementView(id);
          }
        }

      });
    }, { threshold: 0.5 });

    elements.forEach(el => observer.observe(el));
  }

  incrementView(articleId: number) {
    this.CommunityService.incrementArticleView(articleId).subscribe({
      next: (res: any) => {
        const article = this.articles.find(a => a.id === articleId);

        if (article) {
          article.views_count = res.data.views_count;
          this.cdr.detectChanges();
        }
      }
    });
  }
}