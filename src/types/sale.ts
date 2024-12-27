import { BaseRecord } from '../components/CRUDBase/types';

export interface SaleItem {
  movement_item_id: number;
  item_id: number;
  quantity: string;
  unit_price: string;
  total_price: string;
  salesperson_id: number | null;
  technician_id: number | null;
  description: string | null;
}

export interface Sale extends BaseRecord {
  movement_id: number;
  movement_type: string;
  movement_date: string;
  person_id: number;
  total_amount: string;
  license_id: number;
  created_at: string;
  discount: string;
  addition: string;
  total_items: string;
  status_id: number;
  payment_method_id: number;
  description: string;
  movement_type_id: number;
  movement_status_id: number | null;
  is_template: boolean;
  persons: {
    person_id: number;
    full_name: string;
    birth_date: string | null;
    person_type_id: number | null;
    created_at: string;
    fantasy_name: string;
    social_capital: string;
  };
  licenses: {
    license_id: number;
    person_id: number;
    license_name: string;
    start_date: string;
    end_date: string | null;
    status: string;
    timezone: string | null;
    active: boolean;
  };
  movement_statuses: {
    status_name: string;
    color?: string;
  } | null;
  movement_items: SaleItem[];
}

export interface SaleResponse {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  period?: 'today' | 'week' | 'month' | 'custom';
  status?: string;
}