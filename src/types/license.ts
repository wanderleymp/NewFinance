import { BaseRecord } from '../components/CRUDBase/types';

export interface LicenseDocument {
  document_value: string;
  document_types: {
    description: string;
  };
}

export interface LicensePerson {
  full_name: string;
  fantasy_name: string | null;
  person_documents: LicenseDocument[];
}

export interface License extends BaseRecord {
  id: number;
  person_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'inactive';
  timezone: string;
  active: boolean;
  persons: LicensePerson;
  created_at: string;
  updated_at: string;
  user_count: number;
}

export interface LicenseResponse {
  data: License[];
  meta: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
}