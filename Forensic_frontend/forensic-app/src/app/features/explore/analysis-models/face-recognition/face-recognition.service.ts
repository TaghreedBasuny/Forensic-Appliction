import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { IFaceRecognitionResponse } from './face-recognition.interface';
import { environment } from '../../../../../environments/environment';

export interface SaveEvidencePayload {
  name: string;
  model_used: string;
  case_id: number;
  data: {
    phenotypes: {
      name: string;
      image?: string;
      message: string;
      status: string;
    };
  };
}

export interface CaseItem {
  id: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class FaceRecognitionService {

  private readonly API_URL = `${environment.apiUrl}/face-recognation`;
  private readonly BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  analyzeFace(file: File): Observable<IFaceRecognitionResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<any>(this.API_URL, formData).pipe(
      timeout(30000),
      map(res => {
        if (res.status === 'success') {
          return res as IFaceRecognitionResponse;
        }
        throw new Error(res.message || 'Analysis failed');
      }),
      catchError(err => this.handleError(err))
    );
  }

  getCases(): Observable<CaseItem[]> {
    return this.http.get<any>(`${this.BASE_URL}/all-cases`).pipe(
      map(res => res.cases || []),
      catchError(err => {
        console.error('Failed to fetch cases:', err);
        return of([]);
      })
    );
  }

  saveAsEvidence(payload: SaveEvidencePayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/save-as-evidence`, payload).pipe(
      catchError(err => {
        console.error('Failed to save evidence:', err);
        return throwError(() => new Error('Failed to save evidence'));
      })
    );
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/report/${id}`, { responseType: 'blob' });
  }

  private handleError(error: HttpErrorResponse) {
    let userMessage = 'Face recognition failed. Please try again.';
    if (error.error?.message?.includes('Undefined array key')) {
      userMessage = 'Person not recognized in database.';
    } else if (error.status === 0) {
      userMessage = 'Cannot connect to server.';
    } else if (error.error?.error?.error) {
      userMessage = error.error.error.error;
    } else if (error.error?.message) {
      userMessage = error.error.message;
    }
    return throwError(() => new Error(userMessage));
  }
}