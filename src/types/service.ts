import { BaseRecord } from '../components/CRUDBase/types';

export interface Service extends BaseRecord {
  item_id: number;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  price: string;
  created_at: string;
  updated_at: string;
  service_group_id: number;
  active: boolean;
}

export interface ServiceResponse {
  data: Service[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CreateServiceDTO {
  code: string;
  name: string;
  description: string;
  price: string;
  service_group_id: number;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {
  active?: boolean;
}