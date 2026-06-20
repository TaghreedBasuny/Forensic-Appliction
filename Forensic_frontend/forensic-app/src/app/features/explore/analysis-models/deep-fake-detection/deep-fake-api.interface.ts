// src/app/features/explore/analysis-models/deep-fake-detection/deep-fake-api.interface.ts

export interface IAnalysisRequest {
  media: File;
}

export interface IAnalysisResponse {
  id: string;
  isReal: boolean;
  confidence: number; // 0-100
  mediaType: 'image' | 'video' | 'audio';
  details: string;
  timestamp: Date;
  fileName?: string;
  imageUrl?: string; // ✅ جديد

}

export interface IAnalysisHistory {
  id: string;
  fileName: string;
  result: 'Real' | 'Fake';
  confidence: number;
  date: Date;
  mediaType: string;
}

export interface ICameraConfig {
  video: boolean;
  audio?: boolean;
}

export interface IBackendError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface IApiErrorResponse {
  error: IBackendError;
  status: number;
  userMessage: string;
  isValidationError?: boolean;  
}

export enum AnalysisStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  SUCCESS = 'success',
  ERROR = 'error'
}