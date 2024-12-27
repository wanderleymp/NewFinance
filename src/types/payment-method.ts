import { BaseRecord } from '../components/CRUDBase/types';

export interface PaymentMethod extends BaseRecord {
  id: number;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodResponse {
  data: PaymentMethod[];
  meta: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  };
}