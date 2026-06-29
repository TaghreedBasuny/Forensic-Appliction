import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicFeedComponent } from '../public-feed/public-feed.component';
import { PublicationsComponent } from '../publications/publications.component';
import { Post, Article } from '../models/community.models';
import { CommunityService } from '../services/community.service';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface MyContentItem {
  id: number;
  type: 'post' | 'article';
  title?: string;
  content: string;
  imageUrl?: string | null;
  authorName?: string;
  likes: number;
  comments: number;
  views?: number;
  timestamp: string;
  isLiked?: boolean;
}

interface Comment {
  id: number;
  authorName: string;
  text: string;
  timestamp: string;
  user_id?: number; 
}

@Component({
  selector: 'app-community-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicFeedComponent, PublicationsComponent],
  templateUrl: './community-feed.component.html',
  styleUrls: ['./community-feed.component.scss']
})
export class CommunityFeedComponent implements OnInit {
  @ViewChild('publicationsComp') publicationsComp!: PublicationsComponent;
  
  activeTab: string = 'feed';
  
  // Modal Variables (Post/Article)
  showPostModal: boolean = false;
  newPostContent: string = '';
  editPostTitle: string = ''; 
editingCommentText: string = '';
  // Delete Confirmation Modal (Post/Article)
  showDeleteConfirmModal: boolean = false;
  itemToDelete: MyContentItem | null = null;

  //  Comment Edit/Delete Modals Variables
  showEditCommentModal: boolean = false;
  editingCommentId: number | null = null;
  editingCommentParentId: number | null = null; 

  showDeleteCommentModal: boolean = false;
  commentToDeleteId: number | null = null;
  commentToDeleteParentId: number | null = null;

  feedPosts: Post[] = [];
  allPublications: Article[] = [];
  myContentList: MyContentItem[] = []; 
  currentUserId: number | null = null;
  currentUserName: string | null = null; 

  // Interaction Variables
  showMyComments: { [id: number]: boolean } = {};
  myCommentsData: { [id: number]: Comment[] } = {};
  newCommentText: { [id: number]: string } = {};
  
  editingItem: MyContentItem | null = null;

  constructor(
    private CommunityService: CommunityService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  tabs = [
    { id: 'feed', label: 'Public Feed' },
    { id: 'publications', label: 'Publications' },
    { id: 'myPublications', label: 'My Publications' }
  ];

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.currentUserId = user?.id || null;
    this.currentUserName = user?.name || 'Me';
    this.loadFeeds();
    this.loadPublications();
  }

 loadFeeds() {
  this.CommunityService.getFeed().subscribe({
    next: (data: Post[]) => {

      this.feedPosts = Array.isArray(data) ? data : [];

      this.updateMyContentList();
    }
  });
}

  loadPublications() {
    this.CommunityService.getPublications().subscribe(res => {
      this.allPublications = res.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          imageUrl: item.image ? (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000/storage/${item.image}`) : null,
          authorName: item.user?.name,
          user_id: item.user?.id,
          likes: item.likes_count,
          comments: item.comments_count,
          views_count: item.views_count,
          shares: item.shares_count || 0,
          isLiked: item.is_liked,
          timestamp: item.created_at
      }));
      this.updateMyContentList();
    });
  }

  updateMyContentList() {
    if (!this.currentUserId) return;

    const myPosts: MyContentItem[] = this.feedPosts
      .filter(p => p.user?.id === this.currentUserId)
      .map(p => ({
        id: p.id, type: 'post', content: p.content, authorName: p.user?.name,
        likes: p.likes, comments: p.comments, views: p.views_count,
        timestamp: p.created_at, isLiked: p.isLiked
      }));

    const myArticles: MyContentItem[] = this.allPublications
      .filter(a => a.user_id === this.currentUserId)
      .map(a => ({
        id: a.id, type: 'article', title: a.title, content: a.content,
        imageUrl: a.imageUrl, authorName: a.authorName,
        likes: a.likes, comments: a.comments, views: a.views_count || 0,
        timestamp: a.timestamp, isLiked: a.isLiked
      }));

    this.myContentList = [...myPosts, ...myArticles].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    this.cdr.detectChanges();
  }



  
  // --- Actions for My Publications ---

  toggleMyLike(item: MyContentItem) {
    const previousState = item.isLiked;
    item.isLiked = !item.isLiked;
    item.likes += item.isLiked ? 1 : -1;

    if (item.type === 'post') {
      this.CommunityService.toggleLike(item.id).subscribe({
        error: () => { item.isLiked = previousState; item.likes += item.isLiked ? 1 : -1; }
      });
    } else {
      this.CommunityService.toggleArticleLike(item.id).subscribe({
        error: () => { item.isLiked = previousState; item.likes += item.isLiked ? 1 : -1; }
      });
    }
  }

  toggleMyComments(item: MyContentItem) {
    this.showMyComments[item.id] = !this.showMyComments[item.id];
    
    if (!this.showMyComments[item.id]) return;

    if (!this.myCommentsData[item.id]) {
      this.myCommentsData[item.id] = [];
    }

    if (this.myCommentsData[item.id].length > 0) return;

    const request$ = item.type === 'post' 
      ? this.CommunityService.getPost(item.id)      
      : this.CommunityService.getArticleDetails(item.id);

    request$.subscribe({
      next: (res: any) => {
        const commentsList = res?.data?.comments || res?.comments || [];
        
        this.myCommentsData[item.id] = Array.isArray(commentsList) ? commentsList.map((c: any) => ({
          id: c.id,
          authorName: c.user?.name || 'Unknown',
          user_id: c.user?.id,
          text: c.content || c.comment || c.text || '',
          timestamp: c.created_at
        })) : [];
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }
  addMyComment(id: number, type: 'post' | 'article') {
    const text = this.newCommentText[id]?.trim();
    if (!text) return;

    const newComment: Comment = { 
      id: Date.now(), 
      authorName: this.currentUserName || 'Me', 
      user_id: this.currentUserId || 0,
      text: text, 
      timestamp: 'Just now' 
    };
    
    if (!this.myCommentsData[id]) this.myCommentsData[id] = [];
    this.myCommentsData[id].unshift(newComment);
    
    const item = this.myContentList.find(i => i.id === id);
    if (item) item.comments++;

    this.newCommentText[id] = '';
    this.CommunityService.addComment(id, text).subscribe();
  }

  // Comment Actions (Edit/Delete)
  
  openEditComment(comment: Comment, parentId: number) {
    this.editingCommentId = comment.id;
    this.editingCommentParentId = parentId;
    this.editingCommentText = comment.text;
    this.showEditCommentModal = true;
  }

  saveEditComment() {
    if (!this.editingCommentId || !this.editingCommentText.trim()) return;

    const parentId = this.editingCommentParentId;
    const commentId = this.editingCommentId;
    const newText = this.editingCommentText;

    const comments = this.myCommentsData[parentId!];
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      comments[commentIndex].text = newText;
    }
    this.cdr.detectChanges();
    this.closeEditCommentModal();

    this.CommunityService.updateComment(commentId, newText).subscribe({
      next: () => console.log('Comment Updated'),
      error: (err) => console.error(err)
    });
  }

  closeEditCommentModal() {
    this.showEditCommentModal = false;
    this.editingCommentId = null;
    this.editingCommentParentId = null;
    this.editingCommentText = '';
  }

  
  openDeleteComment(comment: Comment, parentId: number) {
    this.commentToDeleteId = comment.id;
    this.commentToDeleteParentId = parentId;
    this.showDeleteCommentModal = true;
  }

  confirmDeleteComment() {
    if (!this.commentToDeleteId) return;
    
    const parentId = this.commentToDeleteParentId;
    const commentId = this.commentToDeleteId;

    
    if (parentId) {
      this.myCommentsData[parentId] = this.myCommentsData[parentId].filter(c => c.id !== commentId);
      
      
      const item = this.myContentList.find(i => i.id === parentId);
      if (item && item.comments > 0) item.comments--;
      
      this.cdr.detectChanges();
    }

    this.closeDeleteCommentModal();

    
    this.CommunityService.deleteComment(commentId).subscribe({
      next: () => console.log('Comment Deleted'),
      error: (err) => console.error(err)
    });
  }

  closeDeleteCommentModal() {
    this.showDeleteCommentModal = false;
    this.commentToDeleteId = null;
    this.commentToDeleteParentId = null;
  }

  // --- End Comment Actions ---

  deleteMyItem(item: MyContentItem) {
    this.itemToDelete = item;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    const item = this.itemToDelete;
    const itemId = item.id;
    const itemType = item.type;

    if (itemType === 'post') {
      this.CommunityService.deleteFeed(itemId).subscribe({
        next: () => {
          this.feedPosts = this.feedPosts.filter(p => p.id !== itemId);
          this.updateMyContentList();
          this.showDeleteConfirmModal = false;
          this.itemToDelete = null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.CommunityService.deleteArticle(itemId).subscribe({
        next: () => {
          this.allPublications = this.allPublications.filter(a => a.id !== itemId);
          this.updateMyContentList();
          this.showDeleteConfirmModal = false;
          this.itemToDelete = null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteConfirmModal = false;
    this.itemToDelete = null;
  }

  startEdit(item: MyContentItem) {
    this.editingItem = { ...item };
    this.newPostContent = item.content;
    
    if (item.type === 'article') {
      this.editPostTitle = item.title || '';
    } else {
      this.editPostTitle = '';
    }
    
    this.showPostModal = true;
  }

  saveEdit() {
    if (!this.editingItem) return;

    if (!this.newPostContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    if (this.editingItem.type === 'article' && !this.editPostTitle.trim()) {
      alert('Title is required for articles');
      return;
    }

    const itemId = this.editingItem.id;
    const itemType = this.editingItem.type;

    const index = this.myContentList.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.myContentList[index].content = this.newPostContent;
      if (itemType === 'article') {
        this.myContentList[index].title = this.editPostTitle;
      }
    }

    if (itemType === 'post') {
      const post = this.feedPosts.find(p => p.id === itemId);
      if (post) post.content = this.newPostContent;
    } else {
      const art = this.allPublications.find(a => a.id === itemId);
      if (art) {
        art.content = this.newPostContent;
        art.title = this.editPostTitle;
      }
    }

    this.myContentList = [...this.myContentList]; 
    this.cdr.detectChanges(); 
    this.showPostModal = false;

    if (itemType === 'post') {
      this.CommunityService.updateFeed(itemId, this.newPostContent).subscribe({
        next: () => console.log('Post Updated on Server'),
        error: (err) => console.error(err)
      });
    } else {
      const formData = new FormData();
      formData.append('content', this.newPostContent);
      formData.append('title', this.editPostTitle);

      this.CommunityService.updateArticle(itemId, formData).subscribe({
        next: () => console.log('Article Updated on Server'),
        error: (err) => console.error(err)
      });
    }

    this.newPostContent = '';
    this.editPostTitle = '';
    this.editingItem = null;
  }

  handleNewArticle(article: Article) {
    this.allPublications = [article, ...this.allPublications];
    this.updateMyContentList();
  }

  publishPost() {
    if (this.editingItem) {
      this.saveEdit();
    } else {
      if (!this.newPostContent.trim()) return;
      const content = this.newPostContent;
      const user = this.authService.currentUserValue;

      this.CommunityService.addFeed(content).subscribe({
        next: (res: any) => {
          const newPost: Post = {
            id: res.data.id, user: { id: user?.id, name: user?.name },
            content: res.data.content, created_at: res.data.created_at,
            likes: 0, comments: 0, shares: 0, isLiked: false,
            views_count: res.data.views_count ?? 0,
          };
          this.feedPosts = [newPost, ...this.feedPosts];
          this.updateMyContentList();
          this.closePostModal();
        },
        error: (err) => console.error(err)
      });
    }
  }

  openPostModal() { 
    this.editingItem = null;
    this.showPostModal = true; 
    this.newPostContent = ''; 
    this.editPostTitle = '';
  }
  
  closePostModal() { 
    this.showPostModal = false; 
    this.newPostContent = ''; 
    this.editPostTitle = '';
    this.editingItem = null;
  }
}


