export interface SaleItem {
  item_id: number;
  quantity: number;
  unit_price: number;
  salesperson_id: number | null;
  technician_id: number | null;
}

export interface CreateSaleDTO {
  movement_date: string;
  person_id: number;
  total_amount: number;
  license_id: number;
  payment_method_id: number;
  movement_status_id: number;
  description?: string;
  items: SaleItem[];
}

export interface CreateSaleResponse {
  movement_id: number;
  message: string;
}