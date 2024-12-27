import apiService from './ApiService';
import { PaymentMethod, PaymentMethodResponse } from '../types/payment-method';
import { toast } from 'react-hot-toast';

interface CreatePaymentMethodData {
  method_name: string;
  description: string;
  has_entry: boolean;
  installment_count: number;
  days_between_installments: number;
  first_due_date_days: number;
  account_entry_id: number;
  integration_mapping_id: number;
  payment_document_type_id: number;
  credential_id: number;
  bank_account_id: number;
  active: boolean;
}

interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {}

export class PaymentMethodService {
  private static readonly BASE_URL = '/payment-methods';

  private static transformPaymentMethod(data: any): PaymentMethod {
    return {
      id: data.id || 0,
      name: data.method_name || '',
      description: data.description || '',
      active: Boolean(data.active),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  public static async getPaymentMethods(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaymentMethodResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await apiService.get<any>(`${this.BASE_URL}?${params.toString()}`);
      
      return {
        data: (response.data || []).map(this.transformPaymentMethod),
        meta: {
          total: response.pagination.total || 0,
          pages: response.pagination.totalPages || 1,
          current_page: response.pagination.currentPage || 1,
          per_page: response.pagination.perPage || limit
        }
      };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  public static async getPaymentMethod(id: number): Promise<PaymentMethod> {
    try {
      const response = await apiService.get<any>(`${this.BASE_URL}/${id}`);
      return this.transformPaymentMethod(response);
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  }

  public static async createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const response = await apiService.post<any>(this.BASE_URL, {
        ...data,
        active: true // Always create as active
      });
      toast.success('Método de pagamento criado com sucesso');
      return this.transformPaymentMethod(response);
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  public static async updatePaymentMethod(id: number, data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const response = await apiService.put<any>(`${this.BASE_URL}/${id}`, data);
      toast.success('Método de pagamento atualizado com sucesso');
      return this.transformPaymentMethod(response);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  public static async togglePaymentMethodStatus(id: number): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.getPaymentMethod(id);
      const response = await this.updatePaymentMethod(id, {
        active: !paymentMethod.active
      });
      toast.success(`Método de pagamento ${response.active ? 'ativado' : 'desativado'} com sucesso`);
      return response;
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      throw error;
    }
  }
}