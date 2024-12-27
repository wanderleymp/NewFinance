import apiService from './ApiService';
import { MovementType, MovementTypeResponse } from '../types/movement-type';
import { toast } from 'react-hot-toast';

export class MovementTypeService {
  private static readonly BASE_URL = '/movement-types';

  private static transformMovementType(data: any): MovementType {
    return {
      id: data.movement_type_id,
      movement_type_id: data.movement_type_id,
      type_name: data.type_name,
      _count: data._count || {
        movements: 0,
        movement_statuses: 0
      }
    };
  }

  public static async getMovementTypes(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<MovementTypeResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await apiService.get<any>(`${this.BASE_URL}?${params.toString()}`);
      
      if (!response?.data || !response?.pagination) {
        throw new Error('Invalid response format');
      }

      return {
        data: response.data.map(this.transformMovementType),
        pagination: {
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || 1,
          currentPage: response.pagination.currentPage || 1,
          perPage: response.pagination.perPage || limit,
          hasNext: response.pagination.hasNext || false,
          hasPrevious: response.pagination.hasPrevious || false
        }
      };
    } catch (error) {
      console.error('Error fetching movement types:', error);
      throw error;
    }
  }

  public static async getMovementType(id: number): Promise<MovementType> {
    try {
      const response = await apiService.get<any>(`${this.BASE_URL}/${id}`);
      if (!response) {
        throw new Error('Movement type not found');
      }
      return this.transformMovementType(response);
    } catch (error) {
      console.error('Error fetching movement type:', error);
      throw error;
    }
  }

  public static async createMovementType(type_name: string): Promise<MovementType> {
    try {
      const response = await apiService.post<any>(this.BASE_URL, { type_name });
      if (!response) {
        throw new Error('Error creating movement type');
      }
      toast.success('Tipo de movimento criado com sucesso');
      return this.transformMovementType(response);
    } catch (error) {
      console.error('Error creating movement type:', error);
      throw error;
    }
  }

  public static async updateMovementType(id: number, type_name: string): Promise<MovementType> {
    try {
      const response = await apiService.put<any>(`${this.BASE_URL}/${id}`, { type_name });
      if (!response) {
        throw new Error('Error updating movement type');
      }
      toast.success('Tipo de movimento atualizado com sucesso');
      return this.transformMovementType(response);
    } catch (error) {
      console.error('Error updating movement type:', error);
      throw error;
    }
  }

  public static async deleteMovementType(id: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${id}`);
      toast.success('Tipo de movimento excluído com sucesso');
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast.error('Não é possível excluir este tipo de movimento pois existem registros vinculados');
      } else {
        toast.error('Erro ao excluir tipo de movimento');
      }
      throw error;
    }
  }
}