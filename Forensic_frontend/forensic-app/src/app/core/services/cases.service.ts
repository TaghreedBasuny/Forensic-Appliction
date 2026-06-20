import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateCaseRequest, CreateCaseResponse, Case } from '../models/models_auth/case.model';

@Injectable({
  providedIn: 'root',
})
export class CasesService {
  private apiUrl = environment.apiUrl;
  
  private casesSubject = new BehaviorSubject<Case[]>([]);
  cases$ = this.casesSubject.asObservable();

  constructor(private http: HttpClient) {}

  createCase(data: CreateCaseRequest): Observable<CreateCaseResponse> {
    return this.http.post<CreateCaseResponse>(
      `${this.apiUrl}/add/use-case`,
      data
    ).pipe(
      catchError((error) => {
        console.error('Error creating case:', error);
        return throwError(() => error);
      })
    );
  }

  getCases(): Observable<Case[]> {
    return this.cases$;
  }

  loadCasesFromApi(): void {
    this.http.get<any>(`${this.apiUrl}/all-cases`).subscribe({
      next: (res) => {
        const mappedCases = res.cases.map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          caseNumber: `CS-${item.id.toString().padStart(6, '0')}`,
          date: item.created_at,
          status: item.status,
          duration: ''
        }));
        this.casesSubject.next(mappedCases);
      },
      error: (err) => {
        console.error('Error loading cases:', err);
      }
    });
  }

  addCaseToState(caseData: CreateCaseResponse): void {
    const currentCases = this.casesSubject.value;
    const newCase: Case = this.mapApiResponseToCase(caseData);
    const updatedCases = [newCase, ...currentCases];
    this.casesSubject.next(updatedCases);
  }

  updateCaseInState(updatedCase: Case): void {
    const currentCases = this.casesSubject.value;
    const updatedCases = currentCases.map(c => 
      c.id === updatedCase.id ? updatedCase : c
    );
    this.casesSubject.next(updatedCases);
  }

  updateCase(id: number, payload: { name: string; description: string }) {
    return this.http.put<any>(
      `${this.apiUrl}/update/use-case/${id}`,
      payload
    );
  }

  deleteCaseFromState(caseId: number | string): void {
    const currentCases = this.casesSubject.value;
    const filteredCases = currentCases.filter(c => c.id !== caseId);
    this.casesSubject.next(filteredCases);
  }

  private mapApiResponseToCase(apiData: CreateCaseResponse): Case {
    return {
      id: apiData.data.id,
      title: apiData.data.name,
      description: apiData.data.description,
      caseNumber: `CS-${apiData.data.id.toString().padStart(6, '0')}`,
      date: new Date(apiData.data.created_at).toISOString().split('T')[0],
     status: apiData.data.status,
      duration: '' 
    };
  }

  loadInitialCases(): void {
    const mockCases: Case[] = [];
  }

  getCasesValue(): Case[] {
    return this.casesSubject.value;
  }

  getCaseDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/show/use-case/${id}`);
  }

  deleteCase(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/use-case/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    }).pipe(
      catchError((error) => {
        console.error('Error deleting case:', error);
        return throwError(() => error);
      })
    );
  }

  restoreCases(cases: Case[]): void {
    this.casesSubject.next(cases);
  }

  refreshCaseDetails(caseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/show/use-case/${caseId}`);
  }

  getCaseById(id: number): Observable<CreateCaseResponse> {
    return this.http.get<CreateCaseResponse>(
      `${this.apiUrl}/use-case/${id}`
    );
  }

  toggleCaseStatus(caseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/toggle-active/use-case/${caseId}`).pipe(
      catchError((error) => {
        console.error('Error toggling case status:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEvidence(evidenceId: number, caseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-evidence/${evidenceId}/use-case/${caseId}`).pipe(
      catchError((error) => {
        console.error('Error deleting evidence:', error);
        return throwError(() => error);
      })
    );
  }
}