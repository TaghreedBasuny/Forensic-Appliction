import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { IDNAAnalysisResult, IMarker } from './dna-analysis.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DNAAnalysisService {
  
  private useMock = true; 
 private apiUrl = 'https://fronsicso-production.up.railway.app/api/dna-analysis';
private baseUrl = 'https://fronsicso-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  saveAsEvidence(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save-as-evidence`, payload).pipe(
      catchError(err => {
        console.error('Failed to save evidence:', err);
        return throwError(() => new Error('Failed to save evidence'));
      })
    );
  }

  analyzeDNA(payload: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  private getMockAnalysisResult(payload: FormData): Observable<IDNAAnalysisResult> {
    const mockMarkers: IMarker[] = [
      { locus: 'D3S1358', sampleValue: '15, 18', dbMatch: '15, 18', isMatch: true },
      { locus: 'vWA', sampleValue: '16, 17', dbMatch: '16, 17', isMatch: true },
      { locus: 'FGA', sampleValue: '22, 24', dbMatch: '22, 24', isMatch: true },
      { locus: 'D8S1179', sampleValue: '12, 13', dbMatch: '12, 15', isMatch: false },
      { locus: 'D21S11', sampleValue: '29, 31', dbMatch: '29, 31', isMatch: true },
      { locus: 'D18S51', sampleValue: '13, 15', dbMatch: '13, 15', isMatch: true },
      { locus: 'D5S818', sampleValue: '11, 12', dbMatch: '11, 12', isMatch: true },
      { locus: 'D13S317', sampleValue: '10, 11', dbMatch: '10, 11', isMatch: true },
      { locus: 'D7S820', sampleValue: '9, 11', dbMatch: '9, 11', isMatch: true },
      { locus: 'D16S539', sampleValue: '11, 12', dbMatch: '11, 12', isMatch: true },
      { locus: 'TH01', sampleValue: '7, 9', dbMatch: '7, 9', isMatch: true },
      { locus: 'TPOX', sampleValue: '8, 11', dbMatch: '8, 11', isMatch: true },
      { locus: 'AMEL', sampleValue: 'X, Y', dbMatch: 'X, Y', isMatch: true },
    ];

    const mockResult: IDNAAnalysisResult = {
      id: `DNA-${Math.floor(Math.random() * 9000) + 1000}`,
      personName: 'Ron Larkin',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      confidence: 94.5,
      status: 'Confirmed',
      markers: mockMarkers,
      sequenceId: `SEQ-${Date.now().toString().slice(-6)}`
    };

    return of(mockResult).pipe(
      delay(2000),
      catchError(err => {
        console.error('Mock Error:', err);
        return throwError(() => err);
      })
    );
  }

  downloadReport(reportId: string): Observable<Blob> {
    if (this.useMock) {
      const content = `DNA Report\nID: ${reportId}\nGenerated: ${new Date()}`;
      return of(new Blob([content], { type: 'text/plain' })).pipe(delay(1000));
    }
    return throwError(() => new Error('Not implemented'));
  }

  saveToCase(reportId: string, caseId: string): Observable<any> {
    if (this.useMock) {
      return of({ success: true }).pipe(delay(500));
    }
    return throwError(() => new Error('Not implemented'));
  }
}