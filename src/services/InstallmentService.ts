import { toast } from 'react-hot-toast';
import apiService from './ApiService';
import { DateValidator } from '../utils/dateValidator';
import {
  InstallmentResponse,
  FetchInstallmentsParams
} from '../types/installment';

export class InstallmentService {
  private static readonly BASE_URL = '/installments';

  public static async fetchAccountsReceivable(params: FetchInstallmentsParams): Promise<InstallmentResponse> {
    try {
      // Validate required date parameters
      DateValidator.validateDateRange(params.expected_start_date, params.expected_end_date);

      // Validate optional dates if provided
      DateValidator.validateOptionalDate(params.expected_date);
      DateValidator.validateOptionalDate(params.movement_date_start);
      DateValidator.validateOptionalDate(params.movement_date_end);
      DateValidator.validateOptionalDate(params.due_date_start);
      DateValidator.validateOptionalDate(params.due_date_end);

      // Build query parameters
      const queryParams = new URLSearchParams({
        expected_start_date: params.expected_start_date,
        expected_end_date: params.expected_end_date,
        page: (params.page || 1).toString(),
        per_page: (params.per_page || 10).toString()
      });

      // Add optional parameters if they exist
      if (params.expected_date) queryParams.append('expected_date', params.expected_date);
      if (params.movement_date_start) queryParams.append('movement_date_start', params.movement_date_start);
      if (params.movement_date_end) queryParams.append('movement_date_end', params.movement_date_end);
      if (params.due_date_start) queryParams.append('due_date_start', params.due_date_start);
      if (params.due_date_end) queryParams.append('due_date_end', params.due_date_end);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await apiService.get<InstallmentResponse>(
        `${this.BASE_URL}?${queryParams.toString()}`
      );

      return response;
    } catch (error: any) {
      if (error.message?.includes('Invalid date format')) {
        toast.error(error.message);
      } else if (error.response?.status === 404) {
        toast.error('Nenhum registro encontrado');
      } else {
        toast.error('Erro ao carregar contas a receber');
      }
      throw error;
    }
  }

  public static async getInstallmentById(id: number): Promise<InstallmentResponse> {
    try {
      return await apiService.get<InstallmentResponse>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      toast.error('Erro ao carregar dados da parcela');
      throw error;
    }
  }
}