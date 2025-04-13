// Adicionar ao arquivo existente

export const ModificationType = {
  DESCONTO: 'DESCONTO',
  ACRESCIMO: 'ACRESCIMO',
  SERVICO_ADD: 'SERVICO_ADD',
  SERVICO_REMOVE: 'SERVICO_REMOVE',
} as const;

export type ModificationType = keyof typeof ModificationType;

export interface ContractBilling {
  id?: number | string; // Adicionando id que está sendo usado no ContractCard
  movement_id: number;
  movement_date: string;
  total_amount: number;
  description?: string; // Adicionando description para compatibilidade
}

export interface Contract {
  // Propriedades originais
  full_name: string;
  group_name: string;
  contract_name: string;
  contract_value: string;
  start_date: string;
  end_date: string | null;
  recurrence_period: 'monthly' | 'yearly';
  due_day: number;
  days_before_due: number;
  status: string;
  model_movement_id: number;
  last_billing_date: string | null;
  next_billing_date: string | null;
  contract_id: number;
  contract_group_id: number;
  billing_reference: string;
  representative_person_id: number | null;
  commissioned_value: number | null;
  account_entry_id: number | null;
  last_decimo_billing_year: number | null;
  last_adjustment: string | null;
  billings: ContractBilling[];
  
  // Propriedade para itens/serviços do contrato
  items?: Array<{
    item_id?: number;
    movement_item_id?: number;
    item_name?: string;
    quantity?: number;
    unit_price?: number;
    total_price?: number;
    [key: string]: any; // Para permitir outras propriedades que possam vir da API
  }>;
  
  // Aliases para compatibilidade com o código existente
  id?: number | string; // Alias para contract_id, permitindo tanto number quanto string
  name?: string; // Alias para contract_name
  value?: string | number; // Alias para contract_value
  groupName?: string; // Alias para group_name
  fullName?: string; // Alias para full_name
  dueDay?: number; // Alias para due_day
  nextBillingDate?: string | null; // Alias para next_billing_date
  startDate?: string | Date; // Alias para start_date, permitindo Date
  endDate?: string | Date | null; // Alias para end_date, permitindo Date
  recurrencePeriod?: string; // Alias para recurrence_period
  daysBefore?: number; // Alias para days_before_due
  lastBillingDate?: string | Date | null; // Alias para last_billing_date, permitindo Date
  billingReference?: string; // Alias para billing_reference
  contractGroupId?: number; // Alias para contract_group_id
  modelMovementId?: number; // Alias para model_movement_id
  total_amount?: string | number; // Propriedade adicional usada no ContractCard
  company_name?: string; // Propriedade usada no ContractSummary
  address?: string; // Propriedade usada no ContractSummary
  active?: boolean; // Propriedade usada para indicar se o contrato está ativo
  created_at?: string; // Data de criação do contrato
  // Estas propriedades já estão definidas acima
  
  // Propriedades adicionais usadas em várias partes do código
  group?: string; // Usado em ContractForm e NewContractForm
  personId?: number | string; // Usado em NewContractForm
  representativePersonId?: number | string; // Usado em NewContractForm
  initialValue?: number | string; // Usado em ContractForm
  services?: any[]; // Usado em contractService
  currentValue?: number; // Usado em vários componentes
}

export interface ExtraService {
  id: string;
  name: string;
  value: number;
  contractId: string;
  createdAt?: string;
}

export interface Adjustment {
  id: string;
  type: ModificationType;
  value: number;
  description: string;
  contractId: string;
  createdAt?: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  description: string;
  contractId: string;
  createdAt: string;
  userId: string;
}

export interface ContractModification {
  id: string;
  type: ModificationType;
  value: number;
  description: string;
  contractId: string;
  createdAt?: string;
  modificationType?: 'DESCONTO' | 'ACRESCIMO'; // Propriedade usada no ContractSummary
}

export interface ContractSummary {
  originalValue: number;
  currentValue: number;
  totalAdjustments: number;
  totalExtraServices: number;
  lastModification?: string;
}

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
    recurrence_period: string;
    due_day: number;
    days_before_due: number;
    last_billing_date: string | null;
    next_billing_date: string | null;
    billing_reference: string;
    contract_group_id: number;
    model_movement_id: number;
    representative_person_id: number | null;
    commissioned_value: number | null;
    account_entry_id: number | null;
    last_decimo_billing_year: number | null;
  }>;
  meta: {
    currentPage: number;
    itemCount: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  links: {
    first: string;
    previous: string | null;
    next: string | null;
    last: string;
  };
}

export interface ContractListResponse {
  data: Contract[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ContractFilters {
  groupName?: string | null;
  billingStartDate?: string | null;
  billingEndDate?: string | null;
  lastAdjustmentStartDate?: string | null;
  lastAdjustmentEndDate?: string | null;
}