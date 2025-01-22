import { NewBaseApiService } from './newBaseApiService';
import { Contract, ContractResponse } from '../types/contract';
import mockContractsData from './mockContracts.json' assert { type: 'json' };

export class NewContractService extends NewBaseApiService {
  private static instance: NewContractService;
  private readonly resourceUrl = 'contracts-recurring';

  private constructor() {
    super('contracts');
  }

  public static getInstance(): NewContractService {
    if (!NewContractService.instance) {
      NewContractService.instance = new NewContractService();
    }
    return NewContractService.instance;
  }

  async listRecurring(page = 1, limit = 10): Promise<ContractResponse> {
    try {
      const response = await this.get<ContractResponse>(this.resourceUrl, { page, limit });
      return response;
    } catch (error) {
      console.warn('Usando dados mock devido a erro na API');
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedContracts = mockContractsData.data.slice(startIndex, endIndex);
      
      return {
        data: paginatedContracts,
        meta: {
          currentPage: page,
          itemCount: paginatedContracts.length,
          itemsPerPage: limit,
          totalItems: mockContractsData.data.length,
          totalPages: Math.ceil(mockContractsData.data.length / limit)
        }
      };
    }
  }

  async createRecurring(data: Partial<Contract>): Promise<Contract> {
    return this.post<Contract>(this.resourceUrl, data);
  }

  async updateRecurring(id: string, data: Partial<Contract>): Promise<Contract> {
    return this.put<Contract>(`${this.resourceUrl}/${id}`, data);
  }

  async deleteRecurring(id: string): Promise<void> {
    return this.delete(`${this.resourceUrl}/${id}`);
  }

  async getRecurringById(id: string): Promise<Contract> {
    return this.get<Contract>(`${this.resourceUrl}/${id}`);
  }
}
