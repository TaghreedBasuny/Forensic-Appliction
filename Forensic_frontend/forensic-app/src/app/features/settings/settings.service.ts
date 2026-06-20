import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class SettingsService {
private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/setting`);
  }

  updateProfile(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save-change`, payload);
  }

  changePassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, payload);
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file); 
    return this.http.post(`${this.baseUrl}/upload/image-user`, formData);
  }
}