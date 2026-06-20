import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Post } from '../models/community.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommunityService {

private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getMyFeed(): Observable<Post[]> {
  return this.http.get<any>(`${this.baseUrl}/feed`).pipe(
     map(res => {
       return res.data["public feed"].data.map((item: any) => ({
        id: item.id,
        user: item.user,
        content: item.content,
        created_at: item.created_at,
        likes: item.likes_count,
        comments: item.comments_count,
        isLiked: item.is_liked,
        views_count: item.views_count ?? 0,
        type: 'post' 
      }));
     })
  );
}
getFeed(): Observable<Post[]> {
  return this.http.get<any>(`${this.baseUrl}/feed`).pipe(
    map(res => {
      const feed = res.data?.public_feed?.data ?? []; 

      return feed.map((item: any) => ({
        id: item.id,
        user: item.user,
        content: item.content,
        created_at: item.created_at,
        likes: item.likes_count,
        comments: item.comments_count,
        isLiked: item.is_liked,
        views_count: item.views_count ?? 0,
        shares: item.shares_count ?? 0,
        type: 'post'
      }));
    })
  );
}
addFeed(content: string) {
  return this.http.post<any>(`${this.baseUrl}/add/new-feed`, {
    title: content.slice(0, 30),
    content: content,
    type: 'feeds'
  });
}


updateFeed(id: number, content: string) {
  return this.http.post(`${this.baseUrl}/update-feed/${id}`, {
    content: content,
    title: content.slice(0, 50),
    type: 'feeds'
  });
}
deleteFeed(id: number) {
  return this.http.delete(`${this.baseUrl}/delete-feed/${id}`);
}

toggleLike(postId: number) {
  return this.http.post<any>(
    `${this.baseUrl}/toggle-like/feed/${postId}`,
    {}
  );
}


addComment(postId: number, text: string) {
  // This endpoint works for both feeds and articles based on your API structure
  return this.http.post<any>(`${this.baseUrl}/add-comments-article/${postId}`, { 
    comment: text
  });
}
updateComment(id: number, comment: string) {
  return this.http.put(`${this.baseUrl}/update-comment/${id}`, {
    comment
  });
}

deleteComment(id: number) {
  return this.http.delete(`${this.baseUrl}/delete-comment/${id}`);
}

incrementView(id: number) {
  return this.http.get<any>(`${this.baseUrl}/view-feed/${id}`, {});
}
getPost(postId: number) {
  return this.http.get<any>(`${this.baseUrl}/view-feed/${postId}`, {});
}
shareFeed(id: number) {
  return this.http.get<any>(`${this.baseUrl}/share-feed/${id}`);
}

addArticle(data: FormData) {
  return this.http.post(`${this.baseUrl}/add/new-article`, data);
}

getPublications() {
  return this.http.get<any>(`${this.baseUrl}/feed`).pipe(
    map(res => res.data.publication.data)
  );
}
toggleArticleLike(articleId: number) {
  return this.http.post<any>(
    `${this.baseUrl}/toggle-like/article/${articleId}`,
    {}
  );
}
updateArticle(id: number, data: FormData) {
  return this.http.post<any>(
    `${this.baseUrl}/update-article/${id}`,
    data
  );
}

deleteArticle(id: number) {
  return this.http.delete<any>(
    `${this.baseUrl}/delete-article/${id}`
  );
} 

shareArticle(id: number) {
  return this.http.get<any>(`${this.baseUrl}/share-article/${id}`);
}

incrementArticleView(id: number) {
  return this.http.get<any>(
    `${this.baseUrl}/view-article/${id}`
  );
}
getComments(postId: number) {
  return this.http.get<any>(`${this.baseUrl}/comments-feed/${postId}`);
}

}