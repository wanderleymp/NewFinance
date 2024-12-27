import { BaseRecord } from '../components/CRUDBase/types';

export type PersonType = 'PF' | 'PJ';

export interface Document {
  id?: number;
  type_id: number;
  value: string;
}

export interface Contact {
  id?: number;
  type_id: number;
  value: string;
  name?: string;
}

export interface Address {
  postal_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
  reference?: string;
}

export interface Person extends BaseRecord {
  full_name: string;
  fantasy_name?: string;
  person_type_id: number;
  documents: Document[];
  address?: Address;
  contacts: Contact[];
  user_count?: number;
}

export interface PersonsResponse {
  data: Person[];
  meta: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
}