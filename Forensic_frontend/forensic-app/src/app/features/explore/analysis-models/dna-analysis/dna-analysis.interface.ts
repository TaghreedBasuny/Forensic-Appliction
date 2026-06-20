export interface IDNAAnalysisResult {
  id: string;
  personName: string;
  imageUrl: string;
  confidence: number;
  status: 'Confirmed' | 'Partial' | 'No Match';
  markers: IMarker[];
  sequenceId?: string;
}

export interface IMarker {
  locus: string;     
  sampleValue: string; 
  dbMatch: string;     
  isMatch: boolean;    
}