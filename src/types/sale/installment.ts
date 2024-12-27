export interface Installment {
  installment_id: number;
  installment_number: string;
  due_date: string;
  amount: string;
  status: string;
  boleto_url: string | null;
  boleto_status: string | null;
}