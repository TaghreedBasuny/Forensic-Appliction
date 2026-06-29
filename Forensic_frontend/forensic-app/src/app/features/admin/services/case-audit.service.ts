import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiPaginatedResponse, CaseRecord } from '../models/case-audit.model';

@Injectable({
  providedIn: 'root'
})
export class CaseAuditService {

  private baseUrl = 'https://fronsicso-production.up.railway.app/api/admin/cases';

  constructor(private http: HttpClient) {}

  getCases(page: number = 1): Observable<{ cases: CaseRecord[]; total: number; lastPage: number }> {
    return this.http.get<ApiPaginatedResponse>(`${this.baseUrl}?page=${page}`).pipe(
      map(res => ({
        cases: res.data.data.map(c => this.mapToCaseRecord(c)),
        total: res.data.total,
        lastPage: res.data.last_page
      }))
    );
  }

  private mapToCaseRecord(apiCase: ApiPaginatedResponse['data']['data'][0]): CaseRecord {
    return {
      id: apiCase.id,
      caseId: `CS-${apiCase.id.toString().padStart(4, '0')}`, 
      title: apiCase.name,
      leadDoctor: apiCase.user?.name ?? 'N/A',
      evidenceCount: apiCase.evidences_count,
      status: apiCase.status === 'active' ? 'Active' : 'Complete'
    };
  }
}