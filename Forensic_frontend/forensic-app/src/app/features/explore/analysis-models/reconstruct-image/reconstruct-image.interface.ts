// reconstruct-image.interface.ts
export interface IAgeInfo {
  ageRange: string;
  ageAvg: number;
  ageValues: number[];
  source: string;
  originalAvg: number;
  enhancedAvg: number;
}

export interface IGenderInfo {
  gender: string;
  source: string;
  originalGender: string;
  enhancedGender: string;
}

export interface IFaceRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  leftEye: [number, number];
  rightEye: [number, number];
  nose: [number, number];
  mouthLeft: [number, number];
  mouthRight: [number, number];
}

export interface IReconstructImageResult {
  id: string;
  originalImageUrl: string;
  reconstructedImageUrl: string;
  faceId: number;
  ageInfo: IAgeInfo;
  genderInfo: IGenderInfo;
  region: IFaceRegion;
  /** قيمة عمر واحدة بسيطة جاهزة للعرض مباشرة (بدون original/enhanced) */
  displayAge: number;
  timestamp: string;
  status: 'success' | 'failed';
}