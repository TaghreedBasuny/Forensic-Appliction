import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: Message[];
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private base = 'https://fronsicso-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getChatHistory(): Observable<ChatSession[]> {
    return this.http.get<any>(`${this.base}/chat`).pipe(
      map(res => res.data.map((c: any) => ({
        id: String(c.id),
        title: c.title,
        date: new Date(c.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        preview: c.title,
        messages: []
      })))
    );
  }

  getChatSession(sessionId: string): Observable<Message[]> {
    return this.http.get<any>(`${this.base}/conversations/${sessionId}/messages`).pipe(
      map(res => res.data.map((m: any) => ({
        id: String(m.id),
        text: m.content,
        sender: m.sender === 'assistant' ? 'bot' : 'user',
        timestamp: new Date(m.created_at)
      })))
    );
  }

  sendMessage(message: string, sessionId?: string): Observable<any> {
    const body: any = { query: message };
    if (sessionId) body.conversation_id = Number(sessionId);
    return this.http.post<any>(`${this.base}/chat/send`, body);
  }

  sendFile(file: File, message: string, sessionId?: string): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('query', message);
    if (sessionId) fd.append('conversation_id', sessionId);
    return this.http.post<any>(`${this.base}/chat/send`, fd);
  }
}