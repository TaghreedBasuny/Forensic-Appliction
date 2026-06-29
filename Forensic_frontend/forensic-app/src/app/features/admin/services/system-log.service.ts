import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemLogResponse {
  status: boolean;
  data: {
    current_page: number;
    data: LogItem[];
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface LogItem {
  id: number;
  name: string;       
  created_at: string; 
  massage: string;    
}

@Injectable({
  providedIn: 'root'
})
export class SystemLogService {
  private apiUrl = 'https://fronsicso-production.up.railway.app/api/admin/system-log';

  constructor(private http: HttpClient) {}

 getLogs(page: number = 1, perPage: number = 10): Observable<SystemLogResponse> {
  return this.http.get<SystemLogResponse>(`${this.apiUrl}?page=${page}&per_page=${perPage}`);
}
}