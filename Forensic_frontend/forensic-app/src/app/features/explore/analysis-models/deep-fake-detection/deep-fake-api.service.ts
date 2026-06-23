import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, delay } from 'rxjs/operators';
import { 
  IAnalysisResponse, 
  IAnalysisHistory,
  IApiErrorResponse
} from './deep-fake-api.interface';
import { environment } from '../../../../../environments/environment';

export interface SaveEvidencePayload {
  name: string;
  model_used: string;
  case_id: number;
  data: {
    phenotypes: {
      model_used: string;
      message: string;
      status: string;
      image?: string;
      confidence?: number;
      [key: string]: any;
    };
  };
}

export interface CaseItem {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class DeepFakeApiService {

  private readonly BASE_URL = environment.apiUrl;
  
  private readonly ENDPOINTS = {
    analyze: '/deep-fake',
    report: (id: string) => `/deep-fake/report/${id}`,
    saveEvidence: '/save-as-evidence', 
    cases: '/all-cases',               
    history: '/deep-fake/history'
  } as const;

  constructor(private http: HttpClient) {}

  analyzeMedia(file: File): Observable<IAnalysisResponse> {
    if (environment.useMockData) {
      return this.getMockResponse(file);
    }

    const formData = new FormData();
    formData.append('image', file, file.name); 

    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    return this.http.post<any>(
      `${this.BASE_URL}${this.ENDPOINTS.analyze}`, 
      formData, 
      { headers }
    ).pipe(
      timeout(environment.apiTimeoutMs), 
      map(res => this.convertResponse(res, file)),
      catchError(err => this.handleAnalyzeError(err, file))
    );
  }

  private convertResponse(backend: any, file: File): IAnalysisResponse {
    if (!backend || typeof backend !== 'object') {
      throw new Error('Invalid response from backend');
    }

    const phenotypes = backend.data?.phenotypes;

    return {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isReal: phenotypes?.status?.toLowerCase() === 'real',
      confidence: 85, 
      mediaType: this.detectMediaType(file.type, phenotypes?.image),
      details: `${phenotypes?.model_used} - ${phenotypes?.message?.trim()}`,
      timestamp: new Date(),
      fileName: phenotypes?.image || file.name
    };
  }

  private detectMediaType(mimeType: string, fileName?: string): 'image' | 'video' | 'audio' {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType?.startsWith('video/')) return 'video';
    if (mimeType?.startsWith('audio/')) return 'audio';
    
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a'];
    
    if (ext && imageExts.includes(ext)) return 'image';
    if (ext && videoExts.includes(ext)) return 'video';
    if (ext && audioExts.includes(ext)) return 'audio';
    
    return 'image';
  }

  private handleAnalyzeError(error: HttpErrorResponse, file: File): Observable<IAnalysisResponse> {
    console.error('API Error:', error);

    const backendMessage = error.error?.error?.error 
                      || error.error?.message 
                      || error.error?.errors?.image?.[0]
                      || 'Analysis failed';

    const validationKeywords = [
      'no face detected', 'face not found', 'invalid file',
      'unsupported format', 'file too large', 'please upload'
    ];

    const isValidationError = validationKeywords.some(keyword => 
      backendMessage.toLowerCase().includes(keyword)
    );

    if (isValidationError || error.status === 422) {
      return throwError(() => ({
        error: error.error,
        status: error.status,
        userMessage: backendMessage,
        isValidationError: true,
      } as IApiErrorResponse));
    }

    const canFallback = [0, 408, 500, 502, 503, 504].includes(error.status);
    
    if (canFallback) {
      console.warn('Falling back to mock response');
      return this.getMockResponse(file, true);
    }

    return throwError(() => ({
      error: error.error,
      status: error.status,
      userMessage: this.getUserErrorMessage(error),
      isValidationError: true
    } as IApiErrorResponse));
  }

  private getUserErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0: return 'Cannot connect to server.';
      case 400: return 'Invalid request.';
      case 401: return 'Authentication required.';
      case 403: return 'Access denied.';
      case 404: return 'Endpoint not found.';
      case 413: return 'File too large.';
      case 422: return 'Invalid file format.';
      case 500: return 'Server error.';
      default: return 'Analysis failed.';
    }
  }

  private getMockResponse(file: File, isFallback = false): Observable<IAnalysisResponse> {
    const mediaType = this.detectMediaType(file.type);
    const isReal = Math.random() > 0.3;
    
    return of({
      id: `${isFallback ? 'fallback' : 'mock'}_${Date.now()}`,
      isReal,
      confidence: Math.floor(Math.random() * 30) + 70,
      mediaType,
      details: isFallback ? 'Fallback mode' : 'Mock analysis',
      timestamp: new Date(),
      fileName: file.name
    }).pipe(delay(environment.mockDelayMs));
  }

  downloadReport(analysisId: string): Observable<Blob> {
    return this.http.get(
      `${this.BASE_URL}${this.ENDPOINTS.report(analysisId)}`,
      { responseType: 'blob' }
    ).pipe(
      catchError(err => throwError(() => new Error('Failed to download report')))
    );
  }

  getCases(): Observable<CaseItem[]> {
    return this.http.get<any>(`${this.BASE_URL}${this.ENDPOINTS.cases}`).pipe(
      map(res => res.cases || []),
      catchError(err => {
        console.error('Failed to fetch cases:', err);
        return of([]);
      })
    );
  }

  saveAsEvidence(payload: SaveEvidencePayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}${this.ENDPOINTS.saveEvidence}`, payload).pipe(
      catchError(err => {
        console.error('Failed to save evidence:', err);
        return throwError(() => new Error('Failed to save evidence'));
      })
    );
  }

  getAnalysisHistory(): Observable<IAnalysisHistory[]> {
    return this.http.get<IAnalysisHistory[]>(
      `${this.BASE_URL}${this.ENDPOINTS.history}`
    ).pipe(
      catchError(err => of([]))
    );
  }


  saveAsEvidenceWithImage(payload: any, imageFile?: File): Observable<any> {
    const formData = new FormData();
    
    formData.append('data', JSON.stringify(payload));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post(`${this.BASE_URL}/save-as-evidence`, formData).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to save evidence with image:', err);
        return throwError(() => new Error('Failed to save evidence'));
      })
    );
  }
}