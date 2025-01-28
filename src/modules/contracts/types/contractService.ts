export interface ContractService {
  id?: number;
  name: string;
  quantity: number;
  unit_value: number;
  total_value: number;
}

export interface ContractAdjustment {
  id: number;
  previous_value: number;
  new_value: number;
  change_date: string;
  change_type: string;
  description: string;
}

export interface ContractBilling {
  id: number;
  total_amount: number;
  movement_date: string;
  description: string;
}

export interface Contract {
  // Dados principais do contrato
  contract_id?: number;
  contract_name: string;
  contract_value: string;
  start_date: string;
  end_date: string | null;
  status: string;
  
  // Dados do cliente e grupo
  person_id: number;
  full_name: string;
  group_name: string;
  contract_group_id: number;
  
  // Dados de recorrência e vencimento
  recurrence_period: 'monthly' | 'yearly';
  due_day: number;
  days_before_due: number;
  billing_reference: string;
  
  // Dados financeiros
  model_movement_id: number;
  representative_person_id: number | null;
  commissioned_value: number | null;
  account_entry_id: number | null;
  payment_method: number;
  
  // Dados de serviços
  items?: ContractService[];
  
  // Datas de faturamento
  last_billing_date: string | null;
  next_billing_date: string | null;
  last_decimo_billing_year: number;
  last_adjustment: string | null;
  
  // Históricos
  contract_adjustments?: ContractAdjustment[];
  billings?: ContractBilling[];
  
  // Dados do sistema
  license_id?: number;
  movement_status_id?: number;
  movement_type_id?: number;
}

export interface ContractServiceFormData {
  name: string;
  description: string;
  value: string;
  quantity: string;
  unit: string;
}
