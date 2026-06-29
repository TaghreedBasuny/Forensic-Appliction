export interface ApiUser {
  id: number;
  name: string;
}

export interface ApiCase {
  id: number;
  user_id: number;
  name: string;
  status: 'active' | 'complete';
  evidences_count: number;
  user: ApiUser;
}

export interface ApiPaginatedResponse {
  status: boolean;
  data: {
    current_page: number;
    data: ApiCase[];
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface CaseRecord {
  id: number;
  caseId: string;
  title: string;
  leadDoctor: string;
  evidenceCount: number;
  status: 'Active' | 'Complete';
}