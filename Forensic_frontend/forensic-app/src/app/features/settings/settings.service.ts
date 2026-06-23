import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/setting`);
  }

  updateProfile(payload: any, imageFile?: File | null): Observable<any> {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user?.id && !payload.id) {
      payload.id = user.id;
    }

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    formData.append('_method', 'PUT');
    return this.http.post(`${this.baseUrl}/save-change`, formData);
  }

  changePassword(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, payload);
  }
}