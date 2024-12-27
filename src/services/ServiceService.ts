import apiService from './ApiService';
import { Service, ServiceResponse, CreateServiceDTO, UpdateServiceDTO } from '../types/service';
import { toast } from 'react-hot-toast';

export class ServiceService {
  private static readonly BASE_URL = '/services';

  private static transformService(data: any): Service {
    return {
      id: data.item_id,
      item_id: data.item_id,
      code: data.code,
      name: data.name,
      description: data.description,
      status: data.status,
      price: data.price,
      created_at: data.created_at,
      updated_at: data.updated_at,
      service_group_id: data.service_group_id,
      active: data.active
    };
  }

  public static async getServices(
    page: number = 1,
    limit: number = 10,
    active?: boolean,
    search?: string
  ): Promise<ServiceResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (typeof active === 'boolean') {
        params.append('active', active.toString());
      }

      if (search) {
        params.append('search', search);
      }

      const response = await apiService.get<any>(`${this.BASE_URL}?${params.toString()}`);
      
      return {
        data: response.data.map(this.transformService),
        pagination: response.pagination
      };
    } catch (error) {
      toast.error('Erro ao carregar serviços');
      throw error;
    }
  }

  public static async getService(id: number): Promise<Service> {
    try {
      const response = await apiService.get<any>(`${this.BASE_URL}/${id}`);
      return this.transformService(response);
    } catch (error) {
      toast.error('Erro ao carregar serviço');
      throw error;
    }
  }

  public static async createService(data: CreateServiceDTO): Promise<Service> {
    try {
      const response = await apiService.post<any>(this.BASE_URL, data);
      toast.success('Serviço criado com sucesso');
      return this.transformService(response);
    } catch (error) {
      toast.error('Erro ao criar serviço');
      throw error;
    }
  }

  public static async updateService(id: number, data: UpdateServiceDTO): Promise<Service> {
    try {
      const response = await apiService.put<any>(`${this.BASE_URL}/${id}`, data);
      toast.success('Serviço atualizado com sucesso');
      return this.transformService(response);
    } catch (error) {
      toast.error('Erro ao atualizar serviço');
      throw error;
    }
  }

  public static async deleteService(id: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
      toast.success('Serviço excluído com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir serviço');
      throw error;
    }
  }

  public static async toggleServiceStatus(id: number): Promise<Service> {
    try {
      const service = await this.getService(id);
      const response = await this.updateService(id, {
        active: !service.active
      });
      toast.success(`Serviço ${response.active ? 'ativado' : 'desativado'} com sucesso`);
      return response;
    } catch (error) {
      toast.error('Erro ao alterar status do serviço');
      throw error;
    }
  }
}