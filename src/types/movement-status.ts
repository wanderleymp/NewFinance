```typescript
import { BaseRecord } from '../components/CRUDBase/types';

export interface MovementStatus extends BaseRecord {
  movement_status_id: number;
  status_name: string;
  description: string | null;
  status_category_id: number;
  movement_type_id: number;
  is_final: boolean;
  display_order: number | null;
  active: boolean;
  movement_types: {
    type_name: string;
  };
  movement_status_categories: {
    category_name: string;
  };
}

export interface MovementStatusResponse {
  data: MovementStatus[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```