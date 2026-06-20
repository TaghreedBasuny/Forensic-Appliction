import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../models/community.models';
import { CommunityService } from '../services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { OnChanges, SimpleChanges } from '@angular/core';

export interface Comment {
  id: number;
  user_id: number;
  userName: string;
  text: string;
  created_at: string;
}

@Component({
  selector: 'app-public-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-feed.component.html',
  styleUrls: ['./public-feed.component.scss']
})
export class PublicFeedComponent implements OnInit, OnChanges {
  @Input() posts: Post[] = [];
  @Output() postCreated = new EventEmitter<string>(); 
  
  activeTab: string = 'feed';
  searchText: string = '';
  comments: { [postId: number]: Comment[] } = {};
  newCommentText: { [postId: number]: string } = {};
  showCommentSection: { [postId: number]: boolean } = {};
  editingComment: any = null;
  editText: string = '';
  deleteCommentId: number | null = null;
  deletePostId: number | null = null;
  showEditCommentModal: boolean = false;
  showDeleteCommentModal: boolean = false;
  selectedCommentId: number | null = null;
  selectedPostId: number | null = null;
  editingPost: Post | null = null;
  editPostText: string = '';
  showEditPostModal: boolean = false;
  showDeletePostModal: boolean = false;
  
  showToast: boolean = false;
  toastMessage: string = '';

  currentUserId: number | null = null;
  private viewedPosts = new Set<number>();

  constructor(
    private CommunityService: CommunityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['posts'] && this.posts?.length) {
      setTimeout(() => {
        this.observePosts();
      }, 0);
    }
  }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.currentUserId = user?.id || null;
    
    this.refreshPosts();
  }

  get filteredPosts(): Post[] {
    if (!this.searchText.trim()) return this.posts;
    return this.posts.filter(post =>
      post.user?.name?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  //&---------- Posts Likes ---------
  toggleLike(postId: number) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    const oldState = post.isLiked;
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    this.CommunityService.toggleLike(postId).subscribe({
      next: () => {},
      error: () => {
        post.isLiked = oldState;
        post.likes += oldState ? 1 : -1;
      }
    });
  }

  trackById(index: number, post: Post) {
    return post.id;
  }

  //&---------- Posts Details ---------
  openEditPost(post: Post) {
    this.editingPost = post;
    this.editPostText = post.content;
    this.showEditPostModal = true;
  }

saveEditPost() {
  if (!this.editingPost) return;

  const oldText = this.editingPost.content;
  const postRef = this.editingPost;
  const textToSave = this.editPostText;

  postRef.content = textToSave;
  this.closeEditPostModal(); 

  this.CommunityService.updateFeed(postRef.id, textToSave) 
    .subscribe({
      next: () => console.log('Post updated successfully'),
      error: (err) => {
        postRef.content = oldText;
        this.cdr.detectChanges();
      }
    });
}
  openDeletePost(postId: number) {
    this.deletePostId = postId;
    this.showDeletePostModal = true;
  }

  confirmDeletePost() {
    if (!this.deletePostId) return;
    const id = this.deletePostId;

    this.CommunityService.deleteFeed(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.refreshPosts();
        this.cdr.detectChanges();
        this.closeDeletePostModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.closeDeletePostModal();
  }

  refreshPosts() {
    this.CommunityService.getFeed().subscribe(posts => {
      this.posts = posts;
      setTimeout(() => {
        this.observePosts();
      }, 0);
    });
  }

  closeEditPostModal() {
    this.showEditPostModal = false;
    this.editingPost = null;
    this.editPostText = '';
  }

  closeDeletePostModal() {
    this.showDeletePostModal = false;
    this.deletePostId = null;
  }

  incrementView(postId: number) {
    this.CommunityService.incrementView(postId).subscribe({
      next: (res: any) => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.views_count = res.data.views_count;
          this.cdr.detectChanges();
        }
      }
    });
  }

  observePosts() {
    const elements = document.querySelectorAll('.post-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-id'));
          if (!this.viewedPosts.has(id)) {
            this.viewedPosts.add(id);
            this.incrementView(id);
          }
        }
      });
    }, { threshold: 0.5 });

    elements.forEach(el => observer.observe(el));
  }

  //&---------- Posts Comments -------
  toggleComments(postId: number) {
    this.showCommentSection[postId] = !this.showCommentSection[postId];
    if (this.showCommentSection[postId]) {
      this.CommunityService.getPost(postId).subscribe(res => {
        this.comments[postId] = res.comments.map((c: any) => ({
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

  addComment(postId: number) {
    const text = this.newCommentText[postId]?.trim();
    if (!text) return;
    const user = this.authService.currentUserValue;
    const newComment: Comment = {
      id: Date.now(),
      user_id: user?.id || 0,
      userName: user?.name || 'User',
      text: text,
      created_at: new Date().toISOString()
    };
    const currentComments = this.comments[postId] || [];
    this.comments[postId] = [newComment, ...currentComments];
    const post = this.posts.find(p => p.id === postId);
    if (post) post.comments++;
    this.newCommentText[postId] = '';
    this.CommunityService.addComment(postId, text).subscribe({
      next: (res: any) => {
        newComment.id = res.data.id;
      }
    });
  }

  openEditComment(comment: any, postId: number) {
    this.editingComment = comment;
    this.editText = comment.text;
    this.selectedPostId = postId;
    this.showEditCommentModal = true;
  }

  saveEditComment() {
    if (!this.editingComment) return;
    const commentId = this.editingComment.id;
    const oldText = this.editingComment.text;
    this.CommunityService.updateComment(commentId, this.editText)
      .subscribe({
        next: () => {
          this.editingComment!.text = this.editText;
          this.closeEditModal();
        },
        error: () => {
          this.editingComment!.text = oldText;
        }
      });
  }

  closeEditModal() {
    this.showEditCommentModal = false;
    this.editingComment = null;
    this.editText = '';
  }

  openDeleteComment(comment: any, postId: number) {
    this.selectedCommentId = comment.id;
    this.selectedPostId = postId;
    this.showDeleteCommentModal = true;
  }

  confirmDeleteComment() {
    if (!this.selectedCommentId || !this.selectedPostId) return;
    const post = this.posts.find(p => p.id === this.selectedPostId);
    this.comments[this.selectedPostId] =
      this.comments[this.selectedPostId]
        .filter(c => c.id !== this.selectedCommentId);
    if (post) post.comments--;
    this.CommunityService.deleteComment(this.selectedCommentId)
      .subscribe({
        next: () => this.closeDeleteModal()
      });
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteCommentModal = false;
    this.selectedCommentId = null;
    this.selectedPostId = null;
  }

  //&---------- Share Post ---------
  sharePost(postId: number) {
    this.CommunityService.shareFeed(postId).subscribe({
      next: (res: any) => {
        if (res.share_link) {
          navigator.clipboard.writeText(res.share_link).then(() => {
            this.toastMessage = 'Post link copied successfully'; 
            this.showToast = true;
            this.cdr.detectChanges();
            setTimeout(() => {
              this.showToast = false;
              this.cdr.detectChanges();
            }, 2500);
          });
        }
      },
      error: (err: any) => {
        console.error('Error sharing post', err);
      }
    });
  }

  createNewPost(content: string) {
    this.postCreated.emit(content);
  }
}