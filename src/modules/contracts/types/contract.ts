// Adicionar ao arquivo existente

export const ModificationType = {
  DESCONTO: 'DESCONTO',
  ACRESCIMO: 'ACRESCIMO',
  SERVICO_ADD: 'SERVICO_ADD',
  SERVICO_REMOVE: 'SERVICO_REMOVE',
} as const;

export type ModificationType = keyof typeof ModificationType;

export interface Contract {
  id: number;
  name: string;
  value: number;
  startDate: Date;
  endDate: Date | null;
  status: string;
  groupName: string;
  fullName: string;
  recurrencePeriod: 'monthly' | 'yearly';
  dueDay: number;
  daysBefore: number;
  lastBillingDate: Date | null;
  nextBillingDate: Date | null;
  billingReference: string;
  contractGroupId: number;
  modelMovementId: number;
  representativePersonId: number | null;
  commissionedValue: number | null;
  accountEntryId: number | null;
  lastDecimoBillingYear: number | null;
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