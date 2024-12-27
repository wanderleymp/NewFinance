import { Sale } from './sale';

export interface GetSalesResponse {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}