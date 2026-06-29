import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactResponse {
  success: boolean;
  msg: string;
  data: ContactItem[];
}

export interface ContactItem {
  id: number;
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://fronsicso-production.up.railway.app/api/contacts';

  constructor(private http: HttpClient) {}

  getContacts(): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(this.apiUrl);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}