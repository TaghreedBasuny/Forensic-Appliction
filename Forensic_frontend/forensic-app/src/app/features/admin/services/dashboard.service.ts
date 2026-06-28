import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; 

export interface TopDoctorApi {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  cases_count: number;
}

export interface ChartDataApi {
  models: string;
  total_used: number;
}

export interface DashboardStatistics {
  total_doctors: number;
  active_cases: number;
  total_feeds_posts: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  top_doctors: TopDoctorApi[];
  chart_data: ChartDataApi[];
}

export interface DashboardResponse {
  status: boolean;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/admin/dashboard`;
  public imageBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/storage/';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.baseUrl);
  }
}