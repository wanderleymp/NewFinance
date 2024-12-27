import { BaseRecord } from '../components/CRUDBase/types';

export interface UserLicense {
  id: number;
  name: string;
}

export interface User extends BaseRecord {
  user_id: number;
  username: string;
  person_id: number;
  profile_id: number;
  full_name: string;
  licenses: UserLicense[];
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
}