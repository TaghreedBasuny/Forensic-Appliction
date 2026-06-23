import { Component, Input, Output, EventEmitter, OnInit ,ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Article, Post } from '../models/community.models';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityService } from '../services/community.service';

export interface Comment {
  id: number;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  user_id?: number;
}

interface UnifiedContent {
  id: number;
  type: 'article' | 'post';
  title?: string;
  content: string;
  imageUrl?: string | null;
  authorName?: string;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  isLiked: boolean;
  timestamp: string;
  user_id?: number;
}

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-publications.component.html',
  styleUrls: ['./my-publications.component.scss'],
    encapsulation: ViewEncapsulation.None  

})
export class MyPublicationsComponent implements OnInit {
  @Input() myArticles: Article[] = [];
  @Input() myPosts: Post[] = [];
  
  @Output() articleCreated = new EventEmitter<any>();
  @Output() articleUpdated = new EventEmitter<any>();
  @Output() articleDeleted = new EventEmitter<{ id: number, type: 'article' | 'post' }>();

  unifiedList: UnifiedContent[] = [];
  currentUserId: number | null = null;
  currentUserName: string = '';
  
  showModal = false;
  isEditMode = false;
  editingItemId: number | null = null;
  editingItemType: 'article' | 'post' | null = null;

  articleForm = {
    title: '',
    content: '',
    imageFile: null as File | null,
    imagePreview: null as string | null
  };

  comments: { [id: number]: Comment[] } = {};
  newCommentText: { [id: number]: string } = {};
  showCommentSection: { [id: number]: boolean } = {};

  showEditCommentModal = false;
  showDeleteCommentModal = false;
  editCommentText = '';
  selectedCommentId: number | null = null;
  selectedPostId: number | null = null;

  constructor(
    private authService: AuthService,
    private communityService: CommunityService
  ) {}

 ngOnInit() {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  this.currentUserId = user?.id || null;
  this.currentUserName = user?.name || '';
  
  console.log('currentUserId:', this.currentUserId); 
  
  this.mergeAndSortData();
}
  mergeAndSortData() {
    const articles: UnifiedContent[] = this.myArticles.map(a => ({
      id: a.id,
      type: 'article',
      title: a.title,
      content: a.content,
      imageUrl: a.imageUrl,
      authorName: a.authorName,
      likes: a.likes,
      comments: a.comments,
      shares: a.shares,
      isLiked: a.isLiked,
      timestamp: a.timestamp,
      user_id: a.user_id
    }));

    const posts: UnifiedContent[] = this.myPosts.map(p => ({
      id: p.id,
      type: 'post',
      content: p.content,
      authorName: p.user?.name,
      likes: p.likes,
      comments: p.comments,
      views: p.views_count,
      isLiked: p.isLiked,
      timestamp: p.created_at,
      user_id: p.user?.id
    }));

    this.unifiedList = [...articles, ...posts].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    this.initComments();
  }

  ngOnChanges() {
    this.mergeAndSortData();
  }

  initComments() {
    this.unifiedList.forEach(item => {
      if (!this.comments[item.id]) {
        this.comments[item.id] = [];
        this.newCommentText[item.id] = '';
        this.showCommentSection[item.id] = false;
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.editingItemId = null;
    this.editingItemType = 'article';
    this.articleForm = { title: '', content: '', imageFile: null, imagePreview: null };
    this.showModal = true;
  }

  openEditModal(item: UnifiedContent) {
    this.isEditMode = true;
    this.editingItemId = item.id;
    this.editingItemType = item.type;
    this.articleForm = {
      title: item.title || '',
      content: item.content,
      imageFile: null,
      imagePreview: item.imageUrl || null
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.articleForm.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.articleForm.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.articleForm.imageFile = null;
    this.articleForm.imagePreview = null;
  }

  submitArticle() {
    if (!this.articleForm.title.trim() && this.editingItemType === 'article') return;
    if (!this.articleForm.content.trim()) return;

    const data = { ...this.articleForm, type: this.editingItemType };
    
    if (this.isEditMode) {
      this.articleUpdated.emit(data);
    } else {
      this.articleCreated.emit(data);
    }
    this.closeModal();
  }

  deleteItem(id: number, type: 'article' | 'post') {
    if (confirm('Are you sure you want to delete this item?')) {
      this.articleDeleted.emit({ id, type });
    }
  }

  toggleLike(item: UnifiedContent) {
    item.isLiked = !item.isLiked;
    item.likes += item.isLiked ? 1 : -1;
    
    if (item.type === 'post') {
      this.communityService.toggleLike(item.id).subscribe({ error: () => {} });
    } else {
      this.communityService.toggleArticleLike(item.id).subscribe({ error: () => {} });
    }
  }

 toggleComments(id: number) {
  this.showCommentSection[id] = !this.showCommentSection[id];
  if (this.showCommentSection[id] && this.comments[id].length === 0) {
    this.communityService.getComments(id).subscribe({
      next: (res) => {
        const commentsList = res.data || res.comments || res || [];
        this.comments[id] = commentsList.map((c: any) => ({
          id: c.id,
          authorName: c.user?.name,
text: (c as any).content || (c as any).comment || c.text || '',          user_id: c.user?.id
        }));
      },
      error: (err) => console.log('error:', err)
    });
  }
}
  addComment(id: number) {
    const text = this.newCommentText[id]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: Date.now(),
      authorName: this.currentUserName,  
      text: text,
      timestamp: 'Just now',
      user_id: this.currentUserId || undefined  
    };
    
    this.comments[id].unshift(newComment);
    const item = this.unifiedList.find(i => i.id === id);
    if (item) item.comments++;
    
    this.newCommentText[id] = '';
    this.communityService.addComment(id, text).subscribe();
  }

  handleShare(item: UnifiedContent) {
    if (item.type === 'article') {
      this.communityService.shareArticle(item.id).subscribe(res => {
        navigator.clipboard.writeText(res.share_link);
        alert('Link copied!');
      });
    }
  }

  openEditComment(comment: Comment, postId: number) {
    this.selectedCommentId = comment.id;
    this.selectedPostId = postId;
    this.editCommentText = comment.text;
    this.showEditCommentModal = true;
  }

  saveEditComment() {
    if (!this.selectedCommentId || !this.selectedPostId) return;
    
    const postId = this.selectedPostId;
    const postComments = this.comments[postId];
    const oldText = postComments?.find((c: Comment) => c.id === this.selectedCommentId)?.text;
    
    this.communityService.updateComment(this.selectedCommentId, this.editCommentText).subscribe({
      next: () => {
        const comment = postComments?.find((c: Comment) => c.id === this.selectedCommentId);
        if (comment) comment.text = this.editCommentText;
        this.closeEditCommentModal();
      },
      error: () => {
        const comment = postComments?.find((c: Comment) => c.id === this.selectedCommentId);
        if (comment && oldText) comment.text = oldText;
      }
    });
  }

  closeEditCommentModal() {
    this.showEditCommentModal = false;
    this.selectedCommentId = null;
    this.selectedPostId = null;
    this.editCommentText = '';
  }

  openDeleteComment(comment: Comment, postId: number) {
    this.selectedCommentId = comment.id;
    this.selectedPostId = postId;
    this.showDeleteCommentModal = true;
  }

  confirmDeleteComment() {
    if (!this.selectedCommentId || !this.selectedPostId) return;
    
    const postId = this.selectedPostId;

    this.communityService.deleteComment(this.selectedCommentId).subscribe({
      next: () => {
        const postComments = this.comments[postId];
        if (postComments) {
          this.comments[postId] = postComments.filter((c: Comment) => c.id !== this.selectedCommentId);
          const item = this.unifiedList.find(i => i.id === postId);
          if (item) item.comments--;
        }
        this.closeDeleteCommentModal();
      }
    });
  }

  closeDeleteCommentModal() {
    this.showDeleteCommentModal = false;
    this.selectedCommentId = null;
    this.selectedPostId = null;
  }
}