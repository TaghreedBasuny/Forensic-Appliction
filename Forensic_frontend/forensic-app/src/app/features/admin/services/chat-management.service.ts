import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatResponse {
  status: boolean;
  msg: string;
  data: {
    Conversation: {
      current_page: number;
      data: ChatItem[];
      last_page: number;
      total: number;
      per_page: number;
    };
  };
}

export interface ChatItem {
  id: number;
  title: string;
  created_at: string;
  messages_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatManagementService {
  private apiUrl = 'https://fronsicso-production.up.railway.app/api/admin/chat-mangement';

  constructor(private http: HttpClient) {}

  getChats(page: number = 1): Observable<ChatResponse> {
    return this.http.get<ChatResponse>(`${this.apiUrl}?chat_page=${page}`);
  }
}