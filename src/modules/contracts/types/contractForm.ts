// Interface para os dados do formulário de contrato
import { Contract } from './contract';

export interface ContractFormData {
  // Dados básicos do contrato
  name?: string;
  contract_name: string;
  contract_value: string;
  currentValue?: number;
  start_date: string | Date;
  end_date?: string | Date | null;
  recurrence_period: 'monthly' | 'yearly';
  due_day: number;
  days_before_due: number;
  billing_reference: string;
  
  // Dados adicionais
  group?: string;
  group_name?: string;
  personId?: number | string;
  representativePersonId?: number | string | null;
  representativeName?: string;
  initialValue?: number | string;
  full_name?: string;
  
  // Campos opcionais para edição
  id?: number | string;
  contract_id?: number;
  status?: string;
  
  // Outros campos que podem ser necessários
  model_movement_id?: number;
  contract_group_id?: number;
  representative_person_id?: number | null;
  commissioned_value?: number | null;
  account_entry_id?: number | null;
  last_decimo_billing_year?: number | null;
  last_adjustment?: string | null;
  
  // Campos para compatibilidade com o código existente
  value?: string | number;
  startDate?: string | Date;
  endDate?: string | Date | null;
  recurrencePeriod?: string;
  dueDay?: number;
  daysBefore?: number;
  billingReference?: string;
}

// Função para converter ContractFormData para Contract
export function contractFormToContract(formData: ContractFormData): Contract {
  return {
    contract_name: formData.contract_name || formData.name || '',
    contract_value: String(formData.contract_value || formData.value || '0'),
    start_date: formData.start_date ? (typeof formData.start_date === 'string' ? formData.start_date : formData.start_date.toISOString()) : '',
    end_date: formData.end_date ? (typeof formData.end_date === 'string' ? formData.end_date : formData.end_date.toISOString()) : null,
    recurrence_period: formData.recurrence_period || formData.recurrencePeriod || 'monthly',
    due_day: formData.due_day || formData.dueDay || 1,
    days_before_due: formData.days_before_due || formData.daysBefore || 0,
    billing_reference: formData.billing_reference || formData.billingReference || '',
    status: formData.status || 'active',
    model_movement_id: formData.model_movement_id || 0,
    contract_id: formData.contract_id || 0,
    contract_group_id: formData.contract_group_id || 0,
    representative_person_id: formData.representative_person_id || (formData.representativePersonId ? Number(formData.representativePersonId) : null),
    commissioned_value: formData.commissioned_value || null,
    account_entry_id: formData.account_entry_id || null,
    last_decimo_billing_year: formData.last_decimo_billing_year || null,
    last_adjustment: formData.last_adjustment || null,
    last_billing_date: null,
    next_billing_date: null,
    billings: [],
    full_name: '',
    group_name: formData.group_name || formData.group || '',
    
    // Aliases para compatibilidade
    id: formData.id || formData.contract_id,
    name: formData.contract_name || formData.name,
    value: formData.contract_value || formData.value,
    startDate: formData.start_date || formData.startDate,
    endDate: formData.end_date || formData.endDate,
    recurrencePeriod: formData.recurrence_period || formData.recurrencePeriod,
    dueDay: formData.due_day || formData.dueDay,
    daysBefore: formData.days_before_due || formData.daysBefore,
    billingReference: formData.billing_reference || formData.billingReference,
    group: formData.group || formData.group_name,
    personId: formData.personId,
    initialValue: formData.initialValue
  };
}
