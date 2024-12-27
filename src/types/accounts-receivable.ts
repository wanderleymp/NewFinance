```typescript
import { BaseRecord } from '../components/CRUDBase/types';

export interface AccountReceivable extends BaseRecord {
  installment_id: number;
  movement_id: number;
  payment_id: number;
  installment_number: string;
  due_date: string;
  expected_date: string;
  days_overdue: number;
  value: string;
  status: string;
  person_id: number;
  full_name: string;
  movement_type_id: number;
  type_name: string;
  movement_status: string;
  boleto_url: string | null;
  boleto_status: string | null;
}

export interface AccountReceivableResponse {
  data: AccountReceivable[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface AccountReceivableFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  period?: 'today' | 'week' | 'month' | 'custom';
}
```