import api from '../../../services/api';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { ContractService } from '../types/contractService';
import { contractsApi } from './api'; // Adicionando importação do contractsApi
import mockContractsData from './mockContracts.json' assert { type: 'json' };

type ContractDataSource = 'api' | 'mock';

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}

interface ContractBilling {
  id: number;
  contractNumber: string;
  clientName: string;
  billingDate: Date;
  amount: number;
  status: string;
}

export const contractService = {
  dataSource: 'api' as ContractDataSource,
  
  // Função para normalizar a resposta da API para um formato consistente
  normalizeResponse(data: any): Contract {
    console.log('Normalizando dados de resposta:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Verificar se a resposta é nula ou indefinida
    if (!data) {
      console.warn('Dados de resposta vazios ou nulos');
      return this.createEmptyContract();
    }
    
    try {
      // Se a resposta já estiver no formato esperado, retorna diretamente
      if (data && !data.data && !data.items) {
        // Garante que o objeto tem todas as propriedades necessárias
        return {
          ...data,
          id: data.id || data.contract_id || 0,
          billings: data.billings || [],
          last_adjustment: data.last_adjustment || null
        };
      }
      
      // Se a resposta estiver no formato { data: [...] }
      if (data && data.data) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          return {
            ...data.data[0],
            id: data.data[0].id || data.data[0].contract_id || 0,
            billings: data.data[0].billings || [],
            last_adjustment: data.data[0].last_adjustment || null
          };
        }
        return {
          ...data.data,
          id: data.data.id || data.data.contract_id || 0,
          billings: data.data.billings || [],
          last_adjustment: data.data.last_adjustment || null
        };
      }
      
      // Se a resposta estiver no formato { items: [...] }
      if (data && data.items) {
        if (Array.isArray(data.items) && data.items.length > 0) {
          return {
            ...data.items[0],
            id: data.items[0].id || data.items[0].contract_id || 0,
            billings: data.items[0].billings || [],
            last_adjustment: data.items[0].last_adjustment || null
          };
        }
        return {
          ...data,
          id: data.id || data.contract_id || 0,
          billings: data.billings || [],
          last_adjustment: data.last_adjustment || null
        };
      }
      
      // Se a resposta for um array
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const firstItem = data[0];
          return {
            ...firstItem,
            id: firstItem.id || firstItem.contract_id || 0,
            full_name: firstItem.full_name || '',
            group_name: firstItem.group_name || '',
            contract_name: firstItem.contract_name || '',
            contract_value: firstItem.contract_value || '',
            start_date: firstItem.start_date || '',
            end_date: firstItem.end_date || null,
            recurrence_period: firstItem.recurrence_period || 'monthly',
            due_day: firstItem.due_day || 1,
            days_before_due: firstItem.days_before_due || 0,
            status: firstItem.status || '',
            model_movement_id: firstItem.model_movement_id || 0,
            last_billing_date: firstItem.last_billing_date || null,
            next_billing_date: firstItem.next_billing_date || null,
            contract_id: firstItem.contract_id || 0,
            contract_group_id: firstItem.contract_group_id || 0,
            billing_reference: firstItem.billing_reference || '',
            representative_person_id: firstItem.representative_person_id || null,
            commissioned_value: firstItem.commissioned_value || null,
            account_entry_id: firstItem.account_entry_id || null,
            last_decimo_billing_year: firstItem.last_decimo_billing_year || null,
            last_adjustment: firstItem.last_adjustment || null,
            billings: firstItem.billings || [],
            items: data
          };
        }
        // Cria um objeto Contract com os campos mínimos necessários
        return this.createEmptyContract(data);
      }
      
      // Caso não seja possível normalizar, retorna o dado original com campos mínimos
      return {
        ...data,
        id: data.id || data.contract_id || 0,
        full_name: data.full_name || '',
        group_name: data.group_name || '',
        contract_name: data.contract_name || '',
        contract_value: data.contract_value || '',
        start_date: data.start_date || '',
        end_date: data.end_date || null,
        recurrence_period: data.recurrence_period || 'monthly',
        due_day: data.due_day || 1,
        days_before_due: data.days_before_due || 0,
        status: data.status || '',
        model_movement_id: data.model_movement_id || 0,
        last_billing_date: data.last_billing_date || null,
        next_billing_date: data.next_billing_date || null,
        contract_id: data.contract_id || 0,
        contract_group_id: data.contract_group_id || 0,
        billing_reference: data.billing_reference || '',
        representative_person_id: data.representative_person_id || null,
        commissioned_value: data.commissioned_value || null,
        account_entry_id: data.account_entry_id || null,
        last_decimo_billing_year: data.last_decimo_billing_year || null,
        last_adjustment: data.last_adjustment || null,
        billings: data.billings || [],
      };
    } catch (error) {
      console.error('Erro ao normalizar dados do contrato:', error);
      return this.createEmptyContract();
    }
  },
  
  // Método auxiliar para criar um contrato vazio com valores padrão
  createEmptyContract(items = []): Contract {
    return {
      id: 0,
      full_name: '',
      group_name: '',
      contract_name: '',
      contract_value: '',
      start_date: '',
      end_date: null,
      recurrence_period: 'monthly',
      due_day: 1,
      days_before_due: 0,
      status: '',
      model_movement_id: 0,
      last_billing_date: null,
      next_billing_date: null,
      contract_id: 0,
      contract_group_id: 0,
      billing_reference: '',
      representative_person_id: null,
      commissioned_value: null,
      account_entry_id: null,
      last_decimo_billing_year: null,
      last_adjustment: null,
      billings: [],
      items: items
    };
  },
  
  // Função para buscar um contrato nos dados mock pelo ID
  findMockContractById(id: number): Contract | null {
    console.log('Buscando contrato nos dados mock com ID:', id);
    try {
      // Verifica se os dados mock existem e têm a propriedade data
      if (mockContractsData && mockContractsData.data) {
        // Busca o contrato pelo ID
        const contract = mockContractsData.data.find(c => c.contract_id === id);
        
        if (contract) {
          // Adiciona a propriedade items para compatibilidade com o formato esperado
          return {
            ...contract,
            items: [], // Inicializa com array vazio, já que os mocks não têm itens
            billings: contract.billings || [], // Garante que billings existe
            last_adjustment: contract.last_adjustment || null // Garante que last_adjustment existe
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar contrato nos dados mock:', error);
      return null;
    }
  },

  setDataSource(source: ContractDataSource) {
    this.dataSource = source;
  },

  async getContracts(
    page = 1, 
    limit = 10, 
    search?: string
  ): Promise<{
    contracts: Contract[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      console.log('🔍 ContractService - Buscando contratos:', { page, limit, search });
      
      const response = await contractsApi.listRecurring(page, limit, search);
      console.log('🔍 ContractService - Resposta da API:', response);

      return {
        contracts: response.data,
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page
      };
    } catch (error) {
      console.error('🚨 ContractService - Erro ao buscar contratos:', error);
      throw error;
    }
  },

  async getContractById(id: number): Promise<Contract> {
    // Array com todas as rotas possíveis para buscar o contrato
    const routes = [
      { path: `/contracts/${id}`, name: 'principal' },
      { path: `/contracts-regular/${id}`, name: 'contracts-regular' },
      { path: `/regular/${id}`, name: 'regular' },
      { path: `/contracts-regular/regular/${id}`, name: 'contracts-regular/regular' },
      // Adicionando mais rotas alternativas
      { path: `/contract/${id}`, name: 'contract singular' },
      { path: `/contract-regular/${id}`, name: 'contract-regular singular' }
    ];

    let lastError = null;
    let responseData = null;

    // Tentar cada rota sequencialmente
    for (const route of routes) {
      try {
        console.log(`Tentando buscar contrato com ID ${id} na rota ${route.name}: ${route.path}`);
        
        // Adicionar parâmetros para ignorar cache e forçar atualização
        const timestamp = new Date().getTime();
        const response = await api.get(route.path, {
          params: {
            _t: timestamp, // Parâmetro para evitar cache
            force_refresh: true
          },
          // Aumentar o timeout para esta requisição específica
          timeout: 20000
        });

        console.log(`Resposta da rota ${route.name}:`, response.data);
        
        // Se a resposta for vazia ou null, continuar para a próxima rota
        if (!response.data) {
          console.warn(`Resposta vazia na rota ${route.name}, tentando próxima rota...`);
          continue;
        }

        // Verificar se a resposta contém um erro
        if (response.data.error || (response.data.statusCode && response.data.statusCode >= 400)) {
          console.warn(`Erro na resposta da rota ${route.name}:`, response.data);
          continue;
        }

        // Armazenar a resposta e sair do loop
        responseData = response.data;
        console.log(`Contrato encontrado com sucesso na rota ${route.name}`);
        break;
      } catch (error: any) {
        lastError = error;
        console.error(`Erro ao buscar contrato na rota ${route.name}:`, error);
        
        // Verificar se o erro é 404 (não encontrado) ou outro erro
        const status = error.response?.status;
        if (status && status !== 404 && status !== 500) {
          // Se for um erro diferente de 404 ou 500, pode ser um problema de autorização ou outro
          // que não seria resolvido tentando outra rota
          console.warn(`Erro ${status} na rota ${route.name}, pode indicar um problema que não será resolvido tentando outras rotas`);
        }
      }
    }

    // Se encontrou dados em alguma rota, normalizar e retornar
    if (responseData) {
      try {
        const normalizedData = this.normalizeResponse(responseData);
        return normalizedData;
      } catch (normalizationError) {
        console.error('Erro ao normalizar dados do contrato:', normalizationError);
        // Se falhar na normalização, tentar retornar os dados brutos
        return responseData;
      }
    }

    // Se chegou aqui, todas as rotas falharam, tentar usar mock como último recurso
    console.log('Todas as rotas falharam, tentando usar dados mock como último recurso');
    const mockContract = this.findMockContractById(id);
    if (mockContract) {
      console.log('Contrato mock encontrado:', mockContract);
      return mockContract;
    }

    // Se não encontrou nem nos mocks, lançar o último erro
    console.error('Não foi possível encontrar o contrato em nenhuma rota e não há dados mock disponíveis');
    throw lastError || new Error(`Não foi possível encontrar o contrato com ID ${id}`);
  },

  async getRecurringContractById(id: string): Promise<Contract> {
    // Array com todas as rotas possíveis para buscar o contrato recorrente
    const routes = [
      { path: `/contracts-recurring/${id}`, name: 'principal' },
      { path: `/contracts-recurring/recurring/${id}`, name: 'recurring aninhado' },
      { path: `/recurring/${id}`, name: 'recurring direto' },
      { path: `/contract-recurring/${id}`, name: 'contract-recurring singular' }
    ];

    let lastError = null;
    let responseData = null;

    // Tentar cada rota sequencialmente
    for (const route of routes) {
      try {
        console.log(`Tentando buscar contrato recorrente com ID ${id} na rota ${route.name}: ${route.path}`);
        
        // Adicionar parâmetros para ignorar cache e forçar atualização
        const timestamp = new Date().getTime();
        const response = await api.get(route.path, {
          params: {
            _t: timestamp, // Parâmetro para evitar cache
            force_refresh: true
          },
          // Aumentar o timeout para esta requisição específica
          timeout: 20000
        });

        console.log(`Resposta da rota ${route.name}:`, response.data);
        
        // Se a resposta for vazia ou null, continuar para a próxima rota
        if (!response.data) {
          console.warn(`Resposta vazia na rota ${route.name}, tentando próxima rota...`);
          continue;
        }

        // Verificar se a resposta contém um erro
        if (response.data.error || (response.data.statusCode && response.data.statusCode >= 400)) {
          console.warn(`Erro na resposta da rota ${route.name}:`, response.data);
          continue;
        }

        // Armazenar a resposta e sair do loop
        responseData = response.data;
        console.log(`Contrato recorrente encontrado com sucesso na rota ${route.name}`);
        break;
      } catch (error: any) {
        lastError = error;
        console.error(`Erro ao buscar contrato recorrente na rota ${route.name}:`, error);
        
        // Verificar se o erro é 404 (não encontrado) ou outro erro
        const status = error.response?.status;
        if (status && status !== 404 && status !== 500) {
          // Se for um erro diferente de 404 ou 500, pode ser um problema de autorização ou outro
          // que não seria resolvido tentando outra rota
          console.warn(`Erro ${status} na rota ${route.name}, pode indicar um problema que não será resolvido tentando outras rotas`);
        }
      }
    }

    // Se encontrou dados em alguma rota, normalizar e retornar
    if (responseData) {
      try {
        const normalizedData = this.normalizeResponse(responseData);
        return normalizedData;
      } catch (normalizationError) {
        console.error('Erro ao normalizar dados do contrato recorrente:', normalizationError);
        // Se falhar na normalização, tentar retornar os dados brutos
        return responseData;
      }
    }

    // Se chegou aqui, todas as rotas falharam, tentar usar mock como último recurso
    console.log('Todas as rotas falharam, tentando usar dados mock como último recurso');
    const mockContract = this.findMockContractById(Number(id));
    if (mockContract) {
      console.log('Contrato mock encontrado:', mockContract);
      return mockContract;
    }

    // Se não encontrou nem nos mocks, lançar o último erro
    console.error('Não foi possível encontrar o contrato recorrente em nenhuma rota e não há dados mock disponíveis');
    throw lastError || new Error(`Não foi possível encontrar o contrato recorrente com ID ${id}`);
  },

  async createOrUpdateContract(contractData: Partial<Contract>, id?: number): Promise<Contract> {
    try {
      const endpoint = id ? `/contracts-recurring/${id}` : '/contracts-recurring';
      const method = id ? 'PUT' : 'POST';

      // Calcula o valor total do contrato baseado nos serviços
      if (contractData.services) {
        contractData.contract_value = String(
          contractData.services.reduce((total, service) => total + service.total_value, 0)
        );
      }

      const response = await api.request({
        url: endpoint,
        method,
        data: contractData,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      throw error;
    }
  },

  async addServiceToContract(contractId: number, service: Omit<ContractService, 'id' | 'contract_id'>): Promise<ContractService> {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/services`, service);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar serviço ao contrato:', error);
      throw error;
    }
  },

  async removeServiceFromContract(contractId: number, serviceId: number): Promise<void> {
    try {
      await api.delete(`/contracts-recurring/${contractId}/services/${serviceId}`);
    } catch (error) {
      console.error('Erro ao remover serviço do contrato:', error);
      throw error;
    }
  },

  async updateContractService(contractId: number, serviceId: number, service: Partial<ContractService>): Promise<ContractService> {
    try {
      const response = await api.put(`/contracts-recurring/${contractId}/services/${serviceId}`, service);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar serviço do contrato:', error);
      throw error;
    }
  },

  async deleteContract(id: number): Promise<void> {
    try {
      if (this.dataSource === 'api') {
        await api.delete(`/contracts-recurring/${id}`);
      } else {
        // Remover contrato dos dados mock
        const contractIndex = mockContractsData.data.findIndex(
          contract => contract.contract_id === id
        );

        if (contractIndex === -1) {
          throw new Error('Contrato não encontrado');
        }

        mockContractsData.data.splice(contractIndex, 1);
      }
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  },

  async getPendingBillings(page = 1, limit = 10, contractId?: string | number, search?: string) {
    try {
      console.log('🔍 Buscando faturas pendentes', { page, limit, contractId, search });
      
      const endpoint = contractId 
        ? `/contracts-recurring/${contractId}/billing` 
        : '/contracts-recurring/billing';

      const response = await api.get(endpoint, {
        params: { 
          page, 
          limit,
          ...(search ? { search } : {})
        }
      });

      // Mapeia os dados do contrato
      const items = response.data.items.map(item => ({
        id: item.contract_id,
        contract_id: item.contract_id,
        client_name: item.full_name,
        next_billing_date: item.next_billing_date,
        last_billing_date: item.last_billing_date,
        contract_value: Number(item.contract_value || 0),
        status: item.status === 'active' ? 'pending' : item.status,
        billings: (item.billings || []).map(billing => ({
          id: billing.movement_id,
          date: billing.movement_date,
          amount: Number(billing.total_amount || 0)
        }))
      }));

      return {
        items,
        meta: response.data.meta || {
          currentPage: page,
          totalItems: items.length,
          totalPages: Math.ceil(items.length / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar faturas:', error);
      throw error;
    }
  },

  async processBilling(contractId: string) {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/billing`);
      console.log('✅ Fatura processada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error);
      throw error;
    }
  },

  async processBulkBilling(contractIds: number[]) {
    try {
      console.log('🔄 Processando contratos em lote:', contractIds);
      
      // Monta o corpo da requisição com o array de IDs
      const requestBody = {
        body: contractIds
      };
      
      console.log('📦 Corpo da requisição:', requestBody);
      
      const response = await api.post('/contracts-recurring/billing', requestBody);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao processar faturas em lote:', error);
      throw error;
    }
  },

  async processBillingOld(billingId: string): Promise<void> {
    try {
      await api.post(`/contracts-recurring/billings/${billingId}/process`);
    } catch (error) {
      console.error('Erro ao processar fatura:', error);
      throw error;
    }
  },

  async generateBilling(contractId: string | number): Promise<any> {
    try {
      const response = await api.post(`/contracts-recurring/${contractId}/billings`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      throw error;
    }
  },

  async cancelBilling(billingId: string): Promise<void> {
    try {
      await api.post(`/contracts-recurring/billings/${billingId}/cancel`);
    } catch (error) {
      console.error('Erro ao cancelar fatura:', error);
      throw error;
    }
  },

  async updateContractItem(
    contractId: number, 
    movementItemId: number, 
    data: { 
      quantity: number;
      unit_price: number;
      total_price: number;
      item_id: number;
    }
  ): Promise<any> {
    try {
      console.log('ContractService - Atualizando item:', {
        url: `/contracts-recurring/${contractId}/items/${movementItemId}`,
        data
      });

      const response = await api.put(
        `/contracts-recurring/${contractId}/items/${movementItemId}`,
        data
      );

      console.log('ContractService - Resposta da atualização:', response.data);
      return response.data;
    } catch (error) {
      console.error('ContractService - Erro ao atualizar item do contrato:', error);
      throw error;
    }
  },

  async searchMovementItems(params: { query?: string; type?: string }): Promise<any> {
    try {
      console.log('Buscando itens com query:', params.query);
      const response = await api.get('/items', {
        params: {
          ...(params.query ? { search: params.query } : {}),
          limit: 10,
          page: 1,
          type: params.type || 'service'
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      console.log('Resposta da API de itens:', response.data);
      const items = (response.data.data || []).map((item: any) => this.processItemData(item));
      console.log('Items processados:', items);
      return {
        items,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Erro ao buscar itens:', error.response || error);
      // Se o erro for 500, retornar lista vazia em vez de propagar o erro
      if (error.response?.status === 500) {
        return { items: [], pagination: { total: 0, page: 1, limit: 10 } };
      }
      throw {
        message: error.response?.data?.message || 'Erro ao buscar itens',
        originalError: error
      };
    }
  },

  async createExtraService(payload: {
    contractId: string | number; // Permitindo tanto string quanto number
    serviceId: number;
    itemDescription: string;
    itemValue: number;
    serviceDate: string;
    movementId?: number | null;
    amount?: number; // Adicionando o campo amount que está sendo usado
  }): Promise<any> {
    try {
      console.log('Payload enviado:', JSON.stringify(payload, null, 2));
      const response = await api.post('/contract-extra-services/', payload);
      return response.data;
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro detalhado ao adicionar serviço extra:', {
        responseData: error.response?.data ? JSON.stringify(error.response.data) : 'Sem dados de resposta',
        errorMessage: error.message,
        status: error.response?.status,
        payload: JSON.stringify(payload)
      });

      // Capturar mensagem de erro específica do servidor
      const errorMessage = 
        (error.response?.data?.details && error.response.data.details[0]) || 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Erro desconhecido ao adicionar serviço extra';
      
      // Lançar erro com mensagem específica
      throw new Error(errorMessage);
    }
  },

  async terminateRecurring(id: string, data: { endDate: string; reason: string }): Promise<any> {
    try {
      console.log('Encerrando contrato recorrente:', { id, data });
      
      // Chamada para a API para encerrar o contrato
      const response = await api.post(`/contracts-recurring/${id}/terminate`, data);
      
      console.log('Contrato encerrado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro ao encerrar contrato recorrente:', {
        responseData: error.response?.data ? JSON.stringify(error.response.data) : 'Sem dados de resposta',
        errorMessage: error.message,
        status: error.response?.status,
        contractId: id,
        payload: JSON.stringify(data)
      });

      // Capturar mensagem de erro específica do servidor
      const errorMessage = 
        (error.response?.data?.details && error.response.data.details[0]) || 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Erro desconhecido ao encerrar contrato';
      
      // Lançar erro com mensagem específica
      throw new Error(errorMessage);
    }
  },

  async createRecurring(data: ContractFormData): Promise<any> {
    try {
      console.log('Criando contrato recorrente:', data);
      
      // Chamada para a API para criar o contrato recorrente
      const response = await api.post('/contracts-recurring', data);
      
      console.log('Contrato recorrente criado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro ao criar contrato recorrente:', {
        responseData: error.response?.data ? JSON.stringify(error.response.data) : 'Sem dados de resposta',
        errorMessage: error.message,
        status: error.response?.status,
        payload: JSON.stringify(data)
      });

      // Capturar mensagem de erro específica do servidor
      const errorMessage = 
        (error.response?.data?.details && error.response.data.details[0]) || 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Erro desconhecido ao criar contrato recorrente';
      
      // Lançar erro com mensagem específica
      throw new Error(errorMessage);
    }
  },

  async updateRecurring(id: string | number, data: Partial<Contract>): Promise<any> {
    try {
      const contractId = typeof id === 'string' ? id : id.toString();
      console.log('Atualizando contrato recorrente:', { contractId, data });
      
      // Chamada para a API para atualizar o contrato recorrente
      const response = await api.put(`/contracts-recurring/${contractId}`, data);
      
      console.log('Contrato recorrente atualizado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      // Log detalhado do erro
      console.error('Erro ao atualizar contrato recorrente:', {
        responseData: error.response?.data ? JSON.stringify(error.response.data) : 'Sem dados de resposta',
        errorMessage: error.message,
        status: error.response?.status,
        contractId: id,
        payload: JSON.stringify(data)
      });

      // Capturar mensagem de erro específica do servidor
      const errorMessage = 
        (error.response?.data?.details && error.response.data.details[0]) || 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Erro desconhecido ao atualizar contrato recorrente';
      
      // Lançar erro com mensagem específica
      throw new Error(errorMessage);
    }
  },
  
  // Funções auxiliares para processamento de dados
  
  // Processa um item de movimento/serviço para formato padronizado
  processItemData(item: any): any {
    return {
      id: item.item_id || item.id || 0,
      name: item.name || item.item_name || '',
      value: item.value || parseFloat(item.price || '0'),
      description: item.description || '',
      type: item.type || 'service'
    };
  },
  
  // Processa um faturamento para formato padronizado
  processBillingData(billing: any): any {
    return {
      id: billing.id || 0,
      movement_id: billing.movement_id || 0,
      movement_date: billing.movement_date || '',
      total_amount: billing.total_amount || 0,
      description: billing.description || ''
    };
  }
};
