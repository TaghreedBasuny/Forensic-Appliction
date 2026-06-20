export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
}

export interface RegisterResponse {
  msg: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  msg: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}
