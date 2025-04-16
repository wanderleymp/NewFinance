
import { NewContractList } from './NewContractList';
import { NewContractService } from '../services/newContractService';
import { Contract } from '../types/contract';




// Mock de dados para o // Story // Removido para buildbook
const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Contrato de Serviço A',
    value: 5000,
    status: 'ativo',
    startDate: new Date().toISOString(),
    // Campos obrigatórios da interface Contract
    contract_name: 'Contrato de Serviço A',
    contract_value: '5000',
    start_date: new Date().toISOString(),
    end_date: null,
    full_name: 'Cliente A',
    group_name: 'Serviços',
    billings: [],
    recurrence_period: 'monthly',
    due_day: 10,
    days_before_due: 5,
    model_movement_id: 1,
    contract_group_id: 1,
    billing_reference: 'Referência A',
    last_billing_date: null,
    next_billing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    contract_id: 1,
    representative_person_id: 1,
    personId: 1,
    active: true,
    created_at: new Date().toISOString(),
    commissioned_value: null,
    account_entry_id: null,
    last_decimo_billing_year: null,
    last_adjustment: null
  },
  {
    id: '2',
    name: 'Contrato de Consultoria B',
    value: 7500,
    status: 'ativo',
    startDate: new Date().toISOString(),
    // Campos obrigatórios da interface Contract
    contract_name: 'Contrato de Consultoria B',
    contract_value: '7500',
    start_date: new Date().toISOString(),
    end_date: null,
    full_name: 'Cliente B',
    group_name: 'Consultoria',
    billings: [],
    recurrence_period: 'monthly',
    due_day: 15,
    days_before_due: 5,
    model_movement_id: 2,
    contract_group_id: 2,
    billing_reference: 'Referência B',
    last_billing_date: null,
    next_billing_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    contract_id: 2,
    representative_person_id: 2,
    personId: 2,
    active: true,
    created_at: new Date().toISOString(),
    commissioned_value: null,
    account_entry_id: null,
    last_decimo_billing_year: null,
    last_adjustment: null
  },
  {
    id: '3',
    name: 'Contrato de Manutenção C',
    value: 3000,
    status: 'inativo',
    startDate: new Date().toISOString(),
    // Campos obrigatórios da interface Contract
    contract_name: 'Contrato de Manutenção C',
    contract_value: '3000',
    start_date: new Date().toISOString(),
    end_date: null,
    full_name: 'Cliente C',
    group_name: 'Manutenção',
    billings: [],
    recurrence_period: 'yearly',
    due_day: 20,
    days_before_due: 10,
    model_movement_id: 3,
    contract_group_id: 3,
    billing_reference: 'Referência C',
    last_billing_date: null,
    next_billing_date: new Date(new Date().setDate(new Date().getDate() + 365)).toISOString(),
    contract_id: 3,
    representative_person_id: 3,
    personId: 3,
    active: false,
    created_at: new Date().toISOString(),
    commissioned_value: null,
    account_entry_id: null,
    last_decimo_billing_year: null,
    last_adjustment: null
  }
];

// Mock do serviço de contratos
const mockContractService = NewContractService.getInstance();
jest.spyOn(mockContractService, 'listRecurring').mockResolvedValue({
  items: mockContracts,
  meta: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 3,
    itemsPerPage: 10,
    itemCount: 3
  },
  links: {
    first: '',
    previous: null,
    next: null,
    last: ''
  }
});

// export const Default // Removido para build: // Story // Removido para build


// export const Loading // Removido para build: // Story // Removido para build

// export const Error // Removido para build: // Story // Removido para build

// export const EmptyState // Removido para build: // Story // Removido para build
