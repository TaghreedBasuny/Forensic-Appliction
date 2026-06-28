export interface IAnalysisRequest {
  media: File;
}
export interface IFaceDetection {
  is_real: boolean;
  score: number;
  facial_area: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
export interface IAnalysisResponse {
  id: string;
  isReal: boolean;
  confidence: number;
  mediaType: 'image' | 'video' | 'audio';
  details: string;
  timestamp: Date;
  fileName?: string;
  imageUrl?: string; 
  faces?: IFaceDetection[]; 

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