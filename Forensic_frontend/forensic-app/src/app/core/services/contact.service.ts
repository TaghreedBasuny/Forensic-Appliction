// src/app/core/services/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactRequest {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  msg: string;
  data: {
    id: number;
    name: string;
    email: string;
    message: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl = 'https://fronsicso-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  submitContact(data: ContactRequest): Observable<ContactResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ContactResponse>(
      `${this.baseUrl}/contacts`,
      data,
      { headers }
    );
  }
}