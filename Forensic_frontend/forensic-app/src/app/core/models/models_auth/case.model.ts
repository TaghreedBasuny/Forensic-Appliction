export interface CreateCaseRequest {
  name: string;
  description: string;
  status: string;
  // user_id: number;
}

export interface CaseData {
  id: number;
  name: string;
  description: string;
  // user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseResponse {
  status: boolean;
  message: string;
  data: CaseData;
}

export interface Case {
  id: number;
  title: string;
  description: string;
  caseNumber: string;
  date: string;
status: string;
  duration?: string;
}