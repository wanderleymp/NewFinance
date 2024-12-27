import { BaseRecord } from '../components/CRUDBase/types';

export interface MovementType extends BaseRecord {
  movement_type_id: number;
  type_name: string;
  _count?: {
    movements: number;
    movement_statuses: number;
  };
}

export interface MovementTypeResponse {
  data: MovementType[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}