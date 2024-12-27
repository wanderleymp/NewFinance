export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  profile_id: number;
  description: string;
  profile_name: string;
}

export interface User {
  id: number;
  username: string;
  profile_id: number;
  full_name: string;
  role: string;
}

export interface DecodedToken {
  id: number;
  username: string;
  profile_id: number;
  iat: number;
  exp: number;
}