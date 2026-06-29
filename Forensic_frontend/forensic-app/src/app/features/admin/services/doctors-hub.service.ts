import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DoctorsAndAdminsResponse,
  DoctorProfileResponse,
  ToggleResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorsHubService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDoctorsAndAdmins(
    doctorsPage: number = 1,
    adminsPage: number = 1
  ): Observable<DoctorsAndAdminsResponse> {
    let params = new HttpParams()
      .set('doctors_page', doctorsPage)
      .set('admins_page', adminsPage);

    return this.http.get<DoctorsAndAdminsResponse>(`${this.baseUrl}/doctors`, { params });
  }

  // GET api/admin/profile/doctors/{id}
  getDoctorProfile(id: number): Observable<DoctorProfileResponse> {
    return this.http.get<DoctorProfileResponse>(`${this.baseUrl}/profile/doctors/${id}`);
  }

  // GET api/admin/toggle/active/{id}
  toggleActive(id: number): Observable<ToggleResponse> {
    return this.http.get<ToggleResponse>(`${this.baseUrl}/toggle/active/${id}`);
  }

  assignAdmin(doctorId: number): Observable<{ status: boolean; message: string }> {
  return this.http.get<{ status: boolean; message: string }>(
    `${this.baseUrl}/doctors/assign/admin/${doctorId}`
  );
}
}