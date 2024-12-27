import apiService from './ApiService';
import { Sale, GetSalesResponse, GetSalesParams, CreateSaleDTO, CreateSaleResponse } from '../types/sale';
import { dateRangeUtils, DateRange } from '../utils/dateRangeUtils';
import { toast } from 'react-hot-toast';

export class SaleService {
  private static readonly BASE_URL = '/sales';

  public static getDateRangeForPeriod(period: 'today' | 'week' | 'month'): DateRange {
    return dateRangeUtils.getDateRangeForPeriod(period);
  }

  public static async getSales(params: GetSalesParams): Promise<GetSalesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.status) queryParams.append('status', params.status);

      const response = await apiService.get<GetSalesResponse>(`${this.BASE_URL}?${queryParams.toString()}`);
      
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      return {
        data: response.data,
        pagination: {
          total: response.pagination?.total || 0,
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          totalPages: response.pagination?.totalPages || 1
        }
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar vendas';
      toast.error(errorMessage);
      throw error;
    }
  }

  public static async createSale(data: CreateSaleDTO): Promise<CreateSaleResponse> {
    try {
      const response = await apiService.post<CreateSaleResponse>(this.BASE_URL, data);
      toast.success('Venda criada com sucesso');
      return response;
    } catch (error: any) {
      let errorMessage = 'Erro ao criar venda';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações fornecidas.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Erro de validação. Verifique os dados enviados.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  public static async cancelSale(movementId: number): Promise<void> {
    try {
      await apiService.post(`${this.BASE_URL}/${movementId}/cancel`);
      toast.success('Venda cancelada com sucesso');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao cancelar venda';
      toast.error(errorMessage);
      throw error;
    }
  }

  public static async generateBoleto(movementId: number): Promise<void> {
    try {
      await apiService.post(`${this.BASE_URL}/${movementId}/boleto`);
      toast.success('Boleto gerado com sucesso');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao gerar boleto';
      toast.error(errorMessage);
      throw error;
    }
  }

  public static async sendInvoiceMessage(movementId: number): Promise<void> {
    try {
      await apiService.post('/messaging/invoice', { movement_id: movementId });
      toast.success('Mensagem enviada com sucesso');
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('ID da venda inválido');
      } else {
        toast.error('Erro ao enviar mensagem');
      }
      throw error;
    }
  }
}

export default SaleService;