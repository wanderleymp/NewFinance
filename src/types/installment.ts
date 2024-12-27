export interface PersonDocument {
  document_type: string;
  document_value: string;
}

export interface InstallmentData {
  movement_id: number;
  movement_date: string;
  movement_type_id: number;
  installment_id: number;
  due_date: string;
  balance: string;
  full_name: string;
  fantasy_name: string;
  installment_number: string;
  amount: string;
  status: string;
  expected_date: string;
  boleto_url: string;
  person_documents: PersonDocument[];
}

export interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InstallmentResponse {
  data: InstallmentData[];
  pagination: PaginationData;
}

export interface FetchInstallmentsParams {
  expected_start_date: string;
  expected_end_date: string;
  expected_date?: string;
  movement_date_start?: string;
  movement_date_end?: string;
  due_date_start?: string;
  due_date_end?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}