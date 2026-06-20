export interface IReconstructImageResult {
  id: string;
  originalImageUrl: string;
  reconstructedImageUrl: string;
  quality: number; // 0-100
  processingTime: string;
  enhancements: {
    resolution: string;
    clarity: string;
    noiseReduction: string;
  };
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
}