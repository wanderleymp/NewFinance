// Interface para filtros de contratos
export interface ContractFilters {
  // Parâmetros de paginação e busca
  page?: number;
  limit?: number;
  search?: string;
  
  // Filtro por grupo
  group?: string;
  
  // Filtros de data de faturamento
  billingStartDate?: string | null;
  billingEndDate?: string | null;
  
  // Filtros de último reajuste
  lastAdjustmentStartDate?: string | null;
  lastAdjustmentEndDate?: string | null;
  
  // Outros filtros possíveis
  status?: string;
  personId?: number;
  contractGroupId?: number;
}

// Interface para resposta da listagem de contratos
export interface ContractListResponse {
  items: any[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Interface para resposta de contrato individual
export interface ContractResponse {
  items: Array<{
    contract_id: number;
    contract_name: string;
    contract_value: string;
    start_date: string;
    end_date: string | null;
    status: string;
    group_name: string;
    full_name: string;
    person_id: number;
    contract_group_id: number;
    recurrence_period: string;
    due_day: number;
    days_before_due: number;
    billing_reference: string;
    model_movement_id: number;
    representative_person_id: number | null;
    commissioned_value: number | null;
    account_entry_id: number | null;
    last_billing_date: string | null;
    next_billing_date: string | null;
    last_decimo_billing_year: number;
    last_adjustment: string | null;
    [key: string]: any; // Para permitir outras propriedades
  }>;
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
