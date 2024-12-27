import apiService from './ApiService';
import { AccountReceivable, AccountReceivableResponse, AccountReceivableFilters } from '../types/accounts-receivable';
import { toast } from 'react-hot-toast';

export class AccountReceivableService {
  private static readonly BASE_URL = '/accounts-receivable';

  public static async getAccountsReceivable(
    page: number = 1,
    limit: number = 10,
    filters?: AccountReceivableFilters,
    search?: string
  ): Promise<AccountReceivableResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (filters) {
        if (filters.startDate) params.append('expectedStartDate', filters.startDate);
        if (filters.endDate) params.append('expectedEndDate', filters.endDate);
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
      }

      const response = await apiService.get<AccountReceivableResponse>(
        `${this.BASE_URL}?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching accounts receivable:', error);
      throw error;
    }
  }

  public static async generateBoleto(installmentId: number): Promise<void> {
    try {
      await apiService.post('/boleto', {
        installment_id: installmentId
      });
      toast.success('Boleto gerado com sucesso');
    } catch (error) {
      console.error('Error generating boleto:', error);
      throw error;
    }
  }

  public static async cancelAccount(movementId: number): Promise<void> {
    try {
      await apiService.post(`/sales/${movementId}/cancel`);
      toast.success('Conta cancelada com sucesso');
    } catch (error) {
      console.error('Error canceling account:', error);
      throw error;
    }
  }
}