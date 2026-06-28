// reconstruct-image.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IReconstructImageResult } from './reconstruct-image.interface';

@Injectable({ providedIn: 'root' })
export class ReconstructImageService {
  private useMock = false;

  private apiUrl = 'https://fronsicso-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  reconstructImage(file: File): Observable<IReconstructImageResult> {
    if (this.useMock) {
      return this.getMockReconstructionResult(file);
    }

    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<any>(
      `${this.apiUrl}/face-reconstructs`,
      formData
    ).pipe(
      map(res => this.convertResponse(res, file)),
      catchError(err => {
        console.error('Reconstruction API Error:', err);
        const userMessage =
          err?.error?.message ||
          (err.status === 0 ? 'Cannot connect to server.' :
           err.status === 422 ? 'No face detected in this image. Please upload another image.' :
           'Failed to reconstruct image. Please try another image.');
        return throwError(() => new Error(userMessage));
      })
    );
  }

 
  private convertResponse(backend: any, file: File): IReconstructImageResult {
    if (!backend || backend.status !== 'success' || !backend.data) {
      throw new Error('Invalid response from server');
    }

    const phenotypes = backend.data.phenotypes;
    const analysis = phenotypes?.['face reconstruction analysis'];
    const imageUrl: string | undefined = phenotypes?.image_url;

    if (!analysis || !imageUrl) {
      throw new Error('No reconstructed image returned');
    }

    return {
      id: `REC-${analysis.face_id}-${Date.now()}`,
      originalImageUrl: URL.createObjectURL(file),
      reconstructedImageUrl: imageUrl,
      faceId: analysis.face_id,
      ageInfo: {
        ageRange: analysis.age_info?.age_range,
        ageAvg: analysis.age_info?.age_avg,
        ageValues: analysis.age_info?.age_values ?? [],
        source: analysis.age_info?.source,
        originalAvg: analysis.age_info?.original_avg,
        enhancedAvg: analysis.age_info?.enhanced_avg
      },
      genderInfo: {
        gender: analysis.gender_info?.gender,
        source: analysis.gender_info?.source,
        originalGender: analysis.gender_info?.original_gender,
        enhancedGender: analysis.gender_info?.enhanced_gender
      },
      region: {
        x: analysis.region?.x,
        y: analysis.region?.y,
        w: analysis.region?.w,
        h: analysis.region?.h,
        leftEye: analysis.region?.left_eye,
        rightEye: analysis.region?.right_eye,
        nose: analysis.region?.nose,
        mouthLeft: analysis.region?.mouth_left,
        mouthRight: analysis.region?.mouth_right
      },
      displayAge: analysis.age_info?.enhanced_avg ?? analysis.age_info?.age_avg,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  }


  downloadReconstructedImageBlob(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' }).pipe(
      catchError(err => {
        console.error('Download error (likely CORS):', err);
        return throwError(() => err);
      })
    );
  }

 saveToCase(
  result: IReconstructImageResult,
  caseId: string,
  evidenceName: string
): Observable<any> {
  if (this.useMock) {
    return this.getMockSaveResult(result.id, caseId);
  }

  return this.http.post(`${this.apiUrl}/save-as-evidence`, {
    name: evidenceName,
    case_id: Number(caseId),
    data: {
      model_used: 'face reconstruction',
      phenotypes: {
        image_url: result.reconstructedImageUrl,
        'face reconstruction analysis': {
          face_id: result.faceId,
          gender_info: {
            gender: result.genderInfo?.gender,
            source: result.genderInfo?.source
          },
          age_info: {
            age_range: result.ageInfo?.ageRange,
            enhanced_avg: result.ageInfo?.enhancedAvg,
            age_values: result.ageInfo?.ageValues
          },
          region: result.region
        }
      }
    }
  });
}
  // ---------- Mock (لو useMock = true) ----------
  private getMockReconstructionResult(file: File): Observable<IReconstructImageResult> {
    const mockResult: IReconstructImageResult = {
      id: `REC-${Date.now()}`,
      originalImageUrl: URL.createObjectURL(file),
      reconstructedImageUrl: 'https://via.placeholder.com/600x400/1E2A5E/white?text=Reconstructed+Image',
      faceId: 1,
      ageInfo: {
        ageRange: '0-5',
        ageAvg: 3,
        ageValues: [22, 22, 22],
        source: 'original',
        originalAvg: 22,
        enhancedAvg: 25
      },
      genderInfo: {
        gender: 'Man',
        source: 'original',
        originalGender: 'Man',
        enhancedGender: 'Man'
      },
      region: {
        x: 549, y: 203, w: 178, h: 237,
        leftEye: [689, 298],
        rightEye: [605, 291],
        nose: [649, 336],
        mouthLeft: [682, 369],
        mouthRight: [599, 363]
      },
      displayAge: 25,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockResult);
        observer.complete();
      }, 2000);
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