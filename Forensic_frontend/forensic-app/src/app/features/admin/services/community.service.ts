import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommunityResponse {
  status: boolean;
  data: {
    articles: PaginationData<ArticleItem>;
    feeds: PaginationData<FeedItem>;
    comments: PaginationData<CommentItem>;
  };
}

interface PaginationData<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

export interface ArticleItem {
  id: number;
  title: string;
  user: { name: string };
}

export interface FeedItem {
  id: number;
  content: string;
  user: { name: string };
}

export interface CommentItem {
  id: number;
  comment: string;
  user: { name: string };
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = 'https://fronsicso-production.up.railway.app/api/admin/community';
  private deleteFeedUrl = 'https://fronsicso-production.up.railway.app/api/delete-feed';
  private deleteArticleUrl = 'https://fronsicso-production.up.railway.app/api/delete-article';
  private deleteCommentUrl = 'https://fronsicso-production.up.railway.app/api/delete-comment';

  constructor(private http: HttpClient) {}

  getData(type: 'articles' | 'feeds' | 'comments', page: number = 1): Observable<CommunityResponse> {
    const pageParam = `${type}_page`; 
    return this.http.get<CommunityResponse>(`${this.apiUrl}?${pageParam}=${page}`);
  }

  deleteFeed(id: number): Observable<any> {
    return this.http.delete(`${this.deleteFeedUrl}/${id}`);
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.deleteArticleUrl}/${id}`);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.deleteCommentUrl}/${id}`);
  }
}