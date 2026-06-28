import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // عدّلي المسار حسب مكان environment عندك

export interface UserActivityApi {
  name: string;
  role: string;
  updated_at: string;
}

export interface CaseStatisticsApi {
  total: number;
  active: number;
  completed: number;
}

export interface AiPerformanceApi {
  models: string;
  usage_count: number;
}

export interface CommunityEngagementApi {
  articles: number;
  feeds: number;
  comments: number;
}

export interface GlobalReportData {
  user_activity: UserActivityApi[];
  case_statistics: CaseStatisticsApi;
  ai_performance: AiPerformanceApi[];
  community_engagement: CommunityEngagementApi;
}

export interface GlobalReportMetadata {
  period: string;
  generated_at: string;
}

export interface GlobalReportResponse {
  status: boolean;
  metadata: GlobalReportMetadata;
  data: GlobalReportData;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalReportService {
  private baseUrl = `${environment.apiUrl}/admin/get-global-report-data`;

  constructor(private http: HttpClient) {}

  getGlobalReportData(): Observable<GlobalReportResponse> {
    return this.http.get<GlobalReportResponse>(this.baseUrl);
  }
}