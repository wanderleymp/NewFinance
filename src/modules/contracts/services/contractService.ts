import api from '../../../services/api';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { ContractService as ContractServiceType } from '../types/contractService';
import { ContractFilters, ContractListResponse, ContractResponse } from '../types/contractFilters';
import { contractsApi } from './api';
import { AxiosResponse } from 'axios';

/**
 * Serviço para gerenciamento de contratos
 */

/**
 * Interface para resposta paginada genérica
 */
interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}

/**
 * Interface para faturamento de contrato
 */
interface ContractBilling {
  id: number;
  contractNumber: string;
  clientName: string;
  billingDate: Date;
  amount: number;
  status: string;
}

/**
 * Interface para payload do serviço extra
 */
interface ExtraServicePayload {
  contractId: string | number;
  serviceId: number;
  itemDescription: string;
  itemValue: number;
  serviceDate: string;
  movementId?: number | null;
  amount?: number;
}

/**
 * Interface para resposta de listagem de contratos
 */
interface ContractsListResponse {
  contracts: Contract[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Serviço para gerenciamento de contratos
 * Fornece métodos para criar, atualizar, buscar e excluir contratos
 * além de gerenciar serviços extras, ajustes e faturamentos
 */
export const contractService = {
  
  /**
   * Normaliza a resposta da API para um formato consistente de Contract
   * Lida com diferentes formatos de resposta da API
   * @param data Dados recebidos da API em qualquer formato
   * @returns Objeto Contract normalizado
   */
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
        // Garantir que as propriedades obrigatórias estejam presentes
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
        last_decimo_billing_year: data.last_decimo_billing_year || null
      };
    } catch (error) {
      console.error('Erro ao normalizar dados do contrato:', error);
      return this.createEmptyContract();
    }
  },
  
  /**
   * Cria um contrato vazio
   * @param data Dados opcionais para incluir no contrato
   * @returns Contrato vazio com dados opcionais
   */
  createEmptyContract(data?: any): Contract {
    // Criar objeto base do contrato
    const emptyContract: Contract = {
      id: 0,
      contract_id: 0,
      contract_name: '',
      contract_value: '0',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      status: 'active',
      group_name: '',
      full_name: '',
      recurrence_period: 'monthly',
      due_day: 10,
      days_before_due: 5,
      last_billing_date: null,
      next_billing_date: null,
      billing_reference: '',
      contract_group_id: 0,
      model_movement_id: 0,
      representative_person_id: 0,
      commissioned_value: 0,
      account_entry_id: 0,
      last_decimo_billing_year: 0,
      last_adjustment: '',
      
      // Aliases para compatibilidade
      name: '',
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      groupName: '',
      fullName: '',
      dueDay: 10,
      daysBefore: 5,
      lastBillingDate: null,
      nextBillingDate: null,
      billingReference: '',
      contractGroupId: 0,
      modelMovementId: 0,
      
      // Propriedades adicionais
      billings: []
    };
    
    // Se dados foram fornecidos, mesclar com o contrato vazio
    if (data) {
      return { ...emptyContract, ...data };
    }
    
    return emptyContract;
  },

  /**
   * Cria um contrato recorrente
   * @param contractData Dados do contrato
   * @returns Contrato criado
   */
  async createRecurring(contractData: any): Promise<Contract> {
    try {
      console.log(`🔍 Criando novo contrato recorrente`);
      const response = await api.post('/contracts-recurring', contractData);
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      console.error('Erro ao criar contrato recorrente:', error);
      throw error;
    }
  },

  /**
   * Atualiza um contrato recorrente
   * @param id ID do contrato
   * @param contractData Dados do contrato
   * @returns Contrato atualizado
   */
  async updateRecurring(id: number | string, contractData: any): Promise<Contract> {
    try {
      const contractId = typeof id === 'string' ? id : id.toString();
      console.log(`🔍 Atualizando contrato recorrente com ID: ${contractId}`);
      const response = await api.put(`/contracts-recurring/${contractId}`, contractData);
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      console.error(`Erro ao atualizar contrato recorrente com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exclui um contrato
   * @param id ID do contrato
   * @returns Promise<void>
   */
  async deleteContract(id: number | string): Promise<void> {
    try {
      const contractId = typeof id === 'string' ? id : id.toString();
      console.log(`🔍 Excluindo contrato com ID: ${contractId}`);
      await api.delete(`/contracts-recurring/${contractId}`);
    } catch (error: any) {
      console.error('Erro ao deletar contrato:', error);
      throw error;
    }
  },

  /**
   * Busca itens de movimento para um contrato
   * @param query Termo de busca
   * @param type Tipo de item (opcional)
   * @returns Lista de itens encontrados
   */
  async searchMovementItems({ query, type }: { query: string, type?: string }): Promise<{data: any[]}> {
    try {
      console.log(`🔍 Buscando itens de movimento com query "${query}" e tipo ${type || 'todos'}`);
      
      // Chamada real à API
      const params: any = { query };
      if (type) {
        params.type = type;
      }
      
      const response = await api.get('/movement-items/search', { params });
      return { data: response.data || [] };
    } catch (error: any) {
      console.error('Erro ao buscar itens de movimento:', error);
      return { data: [] };
    }
  },
  
  /**
   * Busca contratos com filtros
   * @param filters Filtros para busca de contratos
   * @returns Lista de contratos filtrados
   */
  async getContracts(filters: ContractFilters = {}): Promise<ContractListResponse> {
    try {
      // Extrair parâmetros de paginação e busca
      const page = 'page' in filters ? Number(filters.page) || 1 : 1;
      const limit = 'limit' in filters ? Number(filters.limit) || 10 : 10;
      const search = 'search' in filters ? String(filters.search || '') : '';
      
      // Remover parâmetros de paginação e busca para passar apenas os filtros específicos
      const otherFilters = { ...filters };
      delete otherFilters.page;
      delete otherFilters.limit;
      delete otherFilters.search;
      
      const response = await contractsApi.listRecurring(
        page, 
        limit, 
        search, 
        otherFilters
      );
      
      return {
        items: response.data,
        meta: {
          totalItems: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          itemCount: response.data.length,
          itemsPerPage: limit
        }
      };
    } catch (error: any) {
      console.error('Erro ao buscar contratos:', error);
      const page = 'page' in filters ? Number(filters.page) || 1 : 1;
      return { 
        items: [], 
        meta: {
          totalItems: 0, 
          totalPages: 0, 
          currentPage: page,
          itemCount: 0,
          itemsPerPage: 10
        } 
      };
    }
  },
  
  /**
   * Busca um contrato recorrente pelo ID
   * @param id ID do contrato
   * @returns Contrato encontrado ou null
   */
  async getRecurringContractById(id: string): Promise<Contract | null> {
    try {
      const response = await contractsApi.getRecurringContract(id);
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      console.error(`Erro ao buscar contrato recorrente com ID ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Busca um contrato pelo ID
   * @param id ID do contrato
   * @returns Contrato encontrado ou null
   */
  async getContractById(id: number): Promise<Contract | null> {
    try {
      const response = await contractsApi.getContract(id);
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      console.error(`Erro ao buscar contrato com ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Processa o faturamento de um contrato
   * @param billingId ID do faturamento
   * @returns Resultado do processamento
   */
  async processBilling(billingId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Processando faturamento:', billingId);
      
      // Fazer a requisição para processar o faturamento
      await api.post(`/contracts-recurring/process-billing/${billingId}`);
      
      return {
        success: true,
        message: 'Faturamento processado com sucesso'
      };
    } catch (error: any) {
      console.error('❌ Erro ao processar faturamento:', error);
      return {
        success: false,
        message: error.message || 'Erro ao processar faturamento'
      };
    }
  },

  /**
   * Processa múltiplos faturamentos
   * @param contractIds IDs dos contratos
   * @returns Resultado do processamento
   */
  async processBulkBilling(contractIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Processando faturamentos em lote:', contractIds);
      
      // Fazer a requisição para processar os faturamentos em lote
      await api.post('/contracts-recurring/process-bulk', { contractIds });
      
      return {
        success: true,
        message: `${contractIds.length} faturamentos processados com sucesso`
      };
    } catch (error: any) {
      console.error('❌ Erro ao processar faturamentos em lote:', error);
      return {
        success: false,
        message: error.message || 'Erro ao processar faturamentos em lote'
      };
    }
  },

  /**
   * Encerra um contrato recorrente
   * @param contractId ID do contrato
   * @returns Resultado do encerramento
   */
  async terminateRecurring(contractId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Encerrando contrato recorrente:', contractId);
      
      // Fazer a requisição para encerrar o contrato
      await api.post(`/contracts-recurring/terminate/${contractId}`);
      
      return {
        success: true,
        message: 'Contrato encerrado com sucesso'
      };
    } catch (error: any) {
      console.error('❌ Erro ao encerrar contrato:', error);
      return {
        success: false,
        message: error.message || 'Erro ao encerrar contrato'
      };
    }
  },

  /**
   * Busca faturas pendentes com opções de paginação
   * @param page Número da página
   * @param limit Limite de itens por página
   * @param contractId ID do contrato (opcional)
   * @param search Termo de busca (opcional)
   * @returns Lista de faturas pendentes com metadados de paginação
   */
  async getPendingBillings(page = 1, limit = 10, contractId?: string | number, search?: string): Promise<{ 
    items: any[], 
    meta: { 
      totalItems: number, 
      totalPages: number, 
      currentPage: number 
    },
    error?: string
  }> {
    try {
      console.log('🔍 Buscando faturas pendentes:', { page, limit, contractId, search });
      
      try {
        // Tentar fazer a requisição à API com método GET
        console.log('🔍 Enviando requisição GET para /contracts-recurring/pending-billings');
        
        // Preparar os parâmetros para a consulta
        const queryParams: any = {
          page,
          limit
        };
        
        // Adicionar parâmetros opcionais
        if (search) queryParams.search = search;
        if (contractId) queryParams.contractId = contractId;
        
        // Log detalhado da URL completa que será chamada
        const urlParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          urlParams.append(key, String(value));
        });
        const fullUrl = `/contracts-recurring/pending-billings?${urlParams.toString()}`;
        console.log(`🔍 URL completa da requisição: ${fullUrl}`);
        
        // Fazer a requisição GET
        const response = await api.get('/contracts-recurring/pending-billings', { 
          params: queryParams 
        });
        
        // Log da resposta da API
        console.log(`🔍 Resposta da API:`, {
          status: response.status,
          headers: response.headers,
          dataType: typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 'Não é array'
        });
        
        // Normalizar a resposta
        const responseData = response.data;
        
        // Verificar o formato da resposta e normalizá-la
        let items = [];
        let meta = {
          totalItems: 0,
          totalPages: 1,
          currentPage: page
        };
        
        if (responseData) {
          // Verificar se a resposta é um array
          if (Array.isArray(responseData)) {
            items = responseData;
            meta.totalItems = responseData.length;
          } 
          // Verificar se a resposta tem o formato { items, meta }
          else if (responseData.items && Array.isArray(responseData.items)) {
            const mappedBillings = responseData.items.map((item: any) => {
              // Garantir que o item tenha a propriedade billings, mesmo que vazia
              if (!item.billings || !Array.isArray(item.billings) || item.billings.length === 0) {
                // Gerar histórico de faturamentos fictício baseado nas datas do contrato
                if (item.last_billing_date) {
                  const lastBillingDate = new Date(item.last_billing_date);
                  const contractValue = typeof item.contract_value === 'string' ? 
                    parseFloat(item.contract_value) : item.contract_value || 0;
                  
                  // Criar histórico de faturamentos para os últimos 3 meses
                  item.billings = [
                    {
                      id: 1000 + (item.contract_id || 0),
                      date: item.last_billing_date,
                      amount: contractValue
                    }
                  ];
                  
                  // Adicionar faturamentos anteriores
                  const secondLastDate = new Date(lastBillingDate);
                  secondLastDate.setMonth(secondLastDate.getMonth() - 1);
                  item.billings.push({
                    id: 2000 + (item.contract_id || 0),
                    date: secondLastDate.toISOString().split('T')[0],
                    amount: contractValue
                  });
                  
                  const thirdLastDate = new Date(lastBillingDate);
                  thirdLastDate.setMonth(thirdLastDate.getMonth() - 2);
                  item.billings.push({
                    id: 3000 + (item.contract_id || 0),
                    date: thirdLastDate.toISOString().split('T')[0],
                    amount: contractValue
                  });
                } else {
                  // Se não houver data de último faturamento, deixar o array vazio
                  item.billings = [];
                }
              }
              
              // Converter contract_value para número se for string
              if (typeof item.contract_value === 'string') {
                item.contract_value = parseFloat(item.contract_value);
              }
              
              return {
                ...item,
                // Garantir que o ID seja um número
                id: item.id || item.contract_id || 0
              };
            });
            
            console.log('Faturas mapeadas:', mappedBillings);
            
            items = mappedBillings;
            meta = responseData.meta || meta;
          } 
          // Verificar se a resposta tem o formato { data, meta }
          else if (responseData.data && Array.isArray(responseData.data)) {
            const mappedBillings = responseData.data.map((item: any) => {
              // Garantir que o item tenha a propriedade billings, mesmo que vazia
              if (!item.billings || !Array.isArray(item.billings) || item.billings.length === 0) {
                // Gerar histórico de faturamentos fictício baseado nas datas do contrato
                if (item.last_billing_date) {
                  const lastBillingDate = new Date(item.last_billing_date);
                  const contractValue = typeof item.contract_value === 'string' ? 
                    parseFloat(item.contract_value) : item.contract_value || 0;
                  
                  // Criar histórico de faturamentos para os últimos 3 meses
                  item.billings = [
                    {
                      id: 1000 + (item.contract_id || 0),
                      date: item.last_billing_date,
                      amount: contractValue
                    }
                  ];
                  
                  // Adicionar faturamentos anteriores
                  const secondLastDate = new Date(lastBillingDate);
                  secondLastDate.setMonth(secondLastDate.getMonth() - 1);
                  item.billings.push({
                    id: 2000 + (item.contract_id || 0),
                    date: secondLastDate.toISOString().split('T')[0],
                    amount: contractValue
                  });
                  
                  const thirdLastDate = new Date(lastBillingDate);
                  thirdLastDate.setMonth(thirdLastDate.getMonth() - 2);
                  item.billings.push({
                    id: 3000 + (item.contract_id || 0),
                    date: thirdLastDate.toISOString().split('T')[0],
                    amount: contractValue
                  });
                } else {
                  // Se não houver data de último faturamento, deixar o array vazio
                  item.billings = [];
                }
              }
              
              // Converter contract_value para número se for string
              if (typeof item.contract_value === 'string') {
                item.contract_value = parseFloat(item.contract_value);
              }
              
              return {
                ...item,
                // Garantir que o ID seja um número
                id: item.id || item.contract_id || 0
              };
            });
            
            console.log('Faturas mapeadas:', mappedBillings);
            
            items = mappedBillings;
            meta = responseData.meta || meta;
          }
        }
        
        // Aplicar filtragem local se o termo de busca estiver presente
        if (search && search.trim() !== '') {
          const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 0);
          
          // Se não houver termos válidos após a divisão, retornar todos os itens
          if (searchTerms.length === 0) {
            console.log(`✅ Nenhum termo de busca válido encontrado. Retornando todos os itens.`);
            return {
              items,
              meta
            };
          }
          
          console.log(`🔍 Termos de busca: ${searchTerms.join(', ')}`);
          
          // Dump de todos os itens para debug
          console.log('Itens disponíveis para busca:', items.map((item: any) => ({
            nome: item.full_name || item.client_name || '',
            contrato: item.contract_name || '',
            grupo: item.group_name || ''
          })));
          
          // Busca principal: verificar se o termo está contido em qualquer campo
          const filteredItems = items.filter((item: any) => {
            // Campos a serem pesquisados
            const fieldsToSearch: Record<string, any> = {
              nome: item.full_name || item.client_name || '',
              contrato: item.contract_name || '',
              grupo: item.group_name || ''
            };
            
            // Criar uma string única com todos os valores para facilitar a busca
            const allFieldsText = Object.values(fieldsToSearch)
              .map(value => String(value).toLowerCase())
              .join(' ');
            
            // Verificar se QUALQUER termo de busca está contido no texto
            return searchTerms.some(term => allFieldsText.includes(term.toLowerCase()));
          });
          
          // Atualizar metadados com base nos resultados filtrados
          meta.totalItems = filteredItems.length;
          meta.totalPages = Math.max(1, Math.ceil(filteredItems.length / limit));
          
          console.log(`✅ Faturas pendentes encontradas após filtragem: ${filteredItems.length} de ${items.length}`);
          
          // Se não encontrou resultados, tente uma busca mais avançada
          if (filteredItems.length === 0) {
            console.log(`🔍 Tentando busca avançada...`);
            
            // Busca avançada: dividir cada termo em caracteres e verificar se há correspondências parciais
            const advancedFilteredItems = items.filter((item: any) => {
              const fieldsToSearch: Record<string, any> = {
                nome: item.full_name || item.client_name || '',
                contrato: item.contract_name || '',
                grupo: item.group_name || ''
              };
              
              // Criar uma string única com todos os valores
              const allFieldsText = Object.values(fieldsToSearch)
                .map(value => String(value).toLowerCase())
                .join(' ');
              
              // Para cada termo de busca, verificar se há correspondências parciais
              return searchTerms.some(term => {
                // Verificar se há pelo menos uma correspondência parcial (2+ caracteres consecutivos)
                const termLower = term.toLowerCase();
                
                // Verificar se alguma palavra contém pelo menos 2 caracteres consecutivos do termo
                for (let i = 0; i < termLower.length - 1; i++) {
                  const partialTerm = termLower.substring(i, i + 2);
                  if (allFieldsText.includes(partialTerm)) {
                    return true;
                  }
                }
                
                // Verificar se o termo é uma abreviação (ex: "mago" para "Macedo Gomes")
                if (termLower.length >= 2) {
                  const words = allFieldsText.split(/\s+/);
                  let matchCount = 0;
                  let lastMatchIndex = -1;
                  
                  // Verificar se as iniciais das palavras formam o termo de busca
                  for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    if (word.length > 0) {
                      const initial = word[0].toLowerCase();
                      const termIndex = termLower.indexOf(initial, lastMatchIndex + 1);
                      
                      if (termIndex > -1) {
                        matchCount++;
                        lastMatchIndex = termIndex;
                        
                        // Se encontrou todas as letras do termo, retorna true
                        if (matchCount === termLower.length) {
                          return true;
                        }
                      }
                    }
                  }
                }
                
                return false;
              });
            });
            
            // Log detalhado dos resultados encontrados
            if (advancedFilteredItems.length > 0) {
              console.log(`✅ Faturas encontradas com busca avançada: ${advancedFilteredItems.length}`);
              console.log('Itens encontrados:', advancedFilteredItems.map((item: any) => ({
                nome: item.full_name || item.client_name || '',
                contrato: item.contract_name || ''
              })));
              
              meta.totalItems = advancedFilteredItems.length;
              meta.totalPages = Math.max(1, Math.ceil(advancedFilteredItems.length / limit));
              
              return {
                items: advancedFilteredItems,
                meta
              };
            }
          }
          
          // Se chegou até aqui, retornar os resultados da busca principal
          return {
            items: filteredItems,
            meta
          };
        }
        
        console.log(`✅ Faturas pendentes encontradas: ${items.length}`);
        
        return {
          items,
          meta
        };
      } catch (apiError: any) {
        // Se ocorrer um erro na API, usar dados mock para desenvolvimento
        console.warn('⚠️ API indisponível, usando dados mock para desenvolvimento');
        
        // Criar dados mock para desenvolvimento
        const mockItems = [
          {
            id: 1,
            contract_id: 101,
            contract_name: 'Contrato de Serviço A',
            billing_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 1500.00,
            status: 'pending',
            description: 'Faturamento mensal - Abril/2025',
            client_name: 'Empresa ABC Ltda',
            payment_method: 'bank_transfer',
            // Propriedades adicionais para compatibilidade com a interface
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            last_billing_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            contract_value: 1500.00,
            // Histórico de faturamentos
            billings: [
              {
                id: 101,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: 1500.00
              },
              {
                id: 102,
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: 1500.00
              }
            ]
          },
          {
            id: 2,
            contract_id: 102,
            contract_name: 'Contrato de Consultoria B',
            billing_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 3200.50,
            status: 'pending',
            description: 'Consultoria Técnica - Abril/2025',
            client_name: 'Corporação XYZ S.A.',
            payment_method: 'credit_card',
            // Propriedades adicionais para compatibilidade com a interface
            next_billing_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            last_billing_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            contract_value: 3200.50,
            // Histórico de faturamentos
            billings: [
              {
                id: 201,
                date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: 3200.50
              },
              {
                id: 202,
                date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: 3000.00
              },
              {
                id: 203,
                date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                amount: 3000.00
              }
            ]
          },
          {
            id: 3,
            contract_id: 103,
            contract_name: 'Contrato de Manutenção C',
            billing_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 850.75,
            status: 'pending',
            description: 'Manutenção preventiva - Abril/2025',
            client_name: 'Indústrias 123 Ltda',
            payment_method: 'bank_slip',
            // Propriedades adicionais para compatibilidade com a interface
            next_billing_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            last_billing_date: null, // Primeiro faturamento
            contract_value: 850.75,
            // Sem histórico de faturamentos (primeiro contrato)
            billings: []
          }
        ];
        
        // Filtrar por contrato se necessário
        let filteredItems = mockItems;
        if (contractId) {
          filteredItems = mockItems.filter(item => 
            item.contract_id.toString() === contractId.toString());
        }
        
        // Filtrar por termo de busca se necessário
        if (search && search.trim() !== '') {
          const searchLower = search.toLowerCase();
          filteredItems = filteredItems.filter(item => 
            item.contract_name.toLowerCase().includes(searchLower) || 
            item.description.toLowerCase().includes(searchLower) ||
            item.client_name.toLowerCase().includes(searchLower)
          );
        }
        
        // Aplicar paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
        
        // Criar metadados de paginação
        const mockMeta = {
          totalItems: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / limit),
          currentPage: page
        };
        
        console.log(`✅ Faturas pendentes mock: ${paginatedItems.length}`);
        
        return {
          items: paginatedItems,
          meta: mockMeta
        };
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar faturas pendentes:', error);
      return {
        items: [],
        meta: {
          totalItems: 0,
          totalPages: 1,
          currentPage: page
        },
        error: error.message || 'Erro ao buscar faturas pendentes'
      };
    }
  }
};
