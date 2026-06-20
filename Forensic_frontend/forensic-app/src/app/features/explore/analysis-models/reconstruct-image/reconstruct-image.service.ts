// reconstruct-image.service.ts
import { Injectable } from '@angular/core';  
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IReconstructImageResult } from './reconstruct-image.interface';

@Injectable({ providedIn: 'root' })
export class ReconstructImageService { 
  private useMock = true;
  private apiUrl = 'http://localhost:3000/api/reconstruct';

  constructor(private http: HttpClient) {}

  reconstructImage(file: File): Observable<IReconstructImageResult> {
    if (this.useMock) {
      return this.getMockReconstructionResult(file);
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<IReconstructImageResult>(
      `${this.apiUrl}/process`,
      formData
    ).pipe(
      catchError(err => {
        console.error('API Error:', err);
        return throwError(() => new Error('Failed to reconstruct image'));
      })
    );
  }

  downloadReport(reportId: string): Observable<Blob> {
    if (this.useMock) {
      return this.getMockReport(reportId);
    }
    return this.http.get(`${this.apiUrl}/report/${reportId}`, { responseType: 'blob' });
  }

  saveToCase(reportId: string, caseId: string): Observable<any> {
    if (this.useMock) {
      return this.getMockSaveResult(reportId, caseId);
    }
    return this.http.post(`${this.apiUrl}/save`, { reportId, caseId });
  }

  // Mock Methods
  private getMockReconstructionResult(file: File): Observable<IReconstructImageResult> {
    const quality = Math.floor(Math.random() * 30) + 70;
    
    const mockResult: IReconstructImageResult = {
      id: `REC-${Date.now()}`,
      originalImageUrl: URL.createObjectURL(file),
      reconstructedImageUrl: 'https://via.placeholder.com/600x400/1E2A5E/white?text=Reconstructed+Image',
      quality: quality,
      processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
      enhancements: {
        resolution: 'Enhanced 2x',
        clarity: `${quality}% Improved`,
        noiseReduction: 'Applied'
      },
      timestamp: new Date().toISOString(),
      status: quality > 80 ? 'success' : 'partial'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockResult);
        observer.complete();
      }, 3000);
    });
  }

  private getMockReport(id: string): Observable<Blob> {
    const content = `Image Reconstruction Report\nID: ${id}\nDate: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(blob);
        observer.complete();
      }, 1000);
    });
  }

  private getMockSaveResult(reportId: string, caseId: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }
}