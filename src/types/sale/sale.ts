import { PersonDocument } from './document';
import { Installment } from './installment';

export interface Sale {
  movement_id: number;
  movement_date: string;
  total_amount: string;
  description: string | null;
  license_id: number;
  full_name: string;
  fantasy_name: string;
  person_documents: PersonDocument[];
  type_name: string;
  status_name: string;
  invoice_url: string | null;
  payment_method: string | null;
  installments: Installment[];
}