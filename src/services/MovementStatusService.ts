import apiService from './ApiService';
import { MovementStatus, MovementStatusResponse } from '../types/movement-status';
import { toast } from 'react-hot-toast';

export class MovementStatusService {
  private static readonly BASE_URL = '/movement-statuses';

  private static transformMovementStatus(data: any): MovementStatus {
    return {
      id: data.movement_status_id,
      movement_status_id: data.movement_status_id,
      status_name: data.status_name,
      description: data.description,
      status_category_id: data.status_category_id,
      movement_type_id: data.movement_type_id,
      is_final: data.is_final,
      display_order: data.display_order,
      active: data.active,
      movement_types: {
        type_name: data.movement_types?.type_name || ''
      },
      movement_status_categories: {
        category_name: data.movement_status_categories?.category_name || ''
      }
    };
  }

  public static async getMovementStatuses(
    page: number = 1,
    limit: number = 10,
    active?: 'true' | 'false' | 'all',
    search?: string
  ): Promise<MovementStatusResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (active && active !== 'all') {
        params.append('active', active);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await apiService.get<any>(`${this.BASE_URL}?${params.toString()}`);
      
      return {
        data: response.data.map(this.transformMovementStatus),
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Error fetching movement statuses:', error);
      throw error;
    }
  }

  public static async getMovementStatus(id: number): Promise<MovementStatus> {
    try {
      const response = await apiService.get<any>(`${this.BASE_URL}/${id}`);
      return this.transformMovementStatus(response);
    } catch (error) {
      console.error('Error fetching movement status:', error);
      throw error;
    }
  }

  public static async createMovementStatus(data: Partial<MovementStatus>): Promise<MovementStatus> {
    try {
      const response = await apiService.post<any>(this.BASE_URL, data);
      toast.success('Status de movimento criado com sucesso');
      return this.transformMovementStatus(response);
    } catch (error) {
      console.error('Error creating movement status:', error);
      throw error;
    }
  }

  public static async updateMovementStatus(id: number, data: Partial<MovementStatus>): Promise<MovementStatus> {
    try {
      const response = await apiService.put<any>(`${this.BASE_URL}/${id}`, data);
      toast.success('Status de movimento atualizado com sucesso');
      return this.transformMovementStatus(response);
    } catch (error) {
      console.error('Error updating movement status:', error);
      throw error;
    }
  }

  public static async toggleMovementStatus(id: number): Promise<MovementStatus> {
    try {
      const status = await this.getMovementStatus(id);
      const response = await this.updateMovementStatus(id, {
        active: !status.active
      });
      toast.success(`Status ${response.active ? 'ativado' : 'desativado'} com sucesso`);
      return response;
    } catch (error) {
      console.error('Error toggling movement status:', error);
      throw error;
    }
  }

  public static async deleteMovementStatus(id: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
      toast.success('Status de movimento excluído com sucesso');
    } catch (error) {
      console.error('Error deleting movement status:', error);
      throw error;
    }
  }
}