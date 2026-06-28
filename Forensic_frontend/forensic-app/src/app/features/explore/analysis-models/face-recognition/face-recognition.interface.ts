export interface IFaceMatch {
  face_index: number;
  person_name: string;
  distance: number;
  image?: string;
  model_used: string;
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface IFaceRecognitionResponse {
  status: string;
  message: string;
  model_used: string;
  data: {
    phenotypes: {
      name?: string; 
      image: string;
      bbox?: any; 
      'fake recognation analysis'?: { 
        matches: IFaceMatch[];
      };
    };
  };
}