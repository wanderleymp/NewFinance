import apiService from './ApiService';
import { License, LicenseResponse } from '../types/license';

export class LicenseService {
  private static readonly BASE_URL = '/licenses';

  private static transformLicenseData(item: any): License {
    return {
      id: item.license_id,
      person_id: item.person_id,
      name: item.license_name,
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.active ? 'active' : 'inactive',
      timezone: item.timezone,
      active: item.active,
      persons: {
        full_name: item.persons?.full_name || '',
        fantasy_name: item.persons?.fantasy_name || null,
        person_documents: item.persons?.person_documents?.map((doc: any) => ({
          document_value: doc.document_value,
          document_types: {
            description: doc.document_types.description
          }
        })) || []
      },
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_count: item.user_count || 0
    };
  }

  public static async getLicenses(
    page: number = 1,
    limit: number = 10,
    active: 'true' | 'false' | 'all' = 'true',
    search?: string
  ): Promise<LicenseResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (active !== 'all') {
        params.append('active', active);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await apiService.get<any>(`${this.BASE_URL}?${params.toString()}`);
      
      if (!response.data || !response.pagination) {
        throw new Error('Invalid response format');
      }

      return {
        data: response.data.map((item: any) => this.transformLicenseData(item)),
        meta: {
          total: response.pagination.total || 0,
          pages: response.pagination.totalPages || 1,
          current_page: response.pagination.currentPage || 1,
          per_page: response.pagination.perPage || limit
        }
      };
    } catch (error) {
      console.error('Error fetching licenses:', error);
      throw error;
    }
  }
}