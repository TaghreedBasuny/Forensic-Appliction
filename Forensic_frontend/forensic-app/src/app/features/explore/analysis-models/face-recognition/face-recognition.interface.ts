export interface IFaceRecognitionResponse {
  status: string;
  message: string;
  model_used: string;
  data: {
    phenotypes: {
      name?: string; // جعلناه اختيارياً
      image: string;
      bbox?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  };
}