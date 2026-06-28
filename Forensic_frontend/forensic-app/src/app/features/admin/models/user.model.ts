export interface DoctorApi {
  id: number;
  name: string;
  national_id: string | null;
  created_at: string;
  status: 'active' | 'block';
}

export interface AdminApi {
  id: number;
  name: string;
  email: string;
  created_at: string;
  status: 'active' | 'block';
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface DoctorsAndAdminsResponse {
  status: boolean;
  doctors: PaginatedResponse<DoctorApi>;
  admins: PaginatedResponse<AdminApi>;
}

export interface DoctorProfileResponse {
  status: boolean;
  data: {
    doctor_info: {
      id: number;
      name: string;
      image: string | null;
      email: string;
      national_id: string | null;
      status: 'active' | 'block';
      total_cases: number;
      total_articles: number;
      created_at?: string;
    };
    modals_data: {
      cases_modal: PaginatedResponse<any>;
      articles_modal: PaginatedResponse<any>;
    };
  };
}export interface DoctorProfileResponse {
  status: boolean;
  data: {
    doctor_info: {
      id: number;
      name: string;
      image: string | null;
      email: string;
      national_id: string | null;
      status: 'active' | 'block';
      total_cases: number;
      total_articles: number;
      created_at?: string; 
    };
    modals_data: {
      cases_modal: PaginatedResponse<any>;
      articles_modal: PaginatedResponse<any>;
    };
  };
}
export interface ToggleResponse {
  success: boolean;
  status: 'active' | 'block';
  message: string;
}

export interface UserViewModel {
  id: number;
  name: string;
  nationalId?: string;
  email?: string;
  registerDate: string;
  status: 'Active' | 'Blocked';
}