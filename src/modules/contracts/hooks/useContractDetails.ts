import { useState, useEffect } from 'react';
import { Contract, HistoryEntry, ExtraService, Adjustment } from '../types/contract';
import { contractsApi } from '../services/api';
import { mockData } from '../services/mockData';

export function useContractDetails(contractId?: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContractDetails = async () => {
    if (!contractId) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Remover mock quando a API estiver pronta
      const contractData = await contractsApi.get(contractId).catch(() => 
        mockData.contracts.find(c => c.id === contractId)
      );

      const historyData = await contractsApi.getHistory(contractId).catch(() => []);
      const servicesData = await contractsApi.getExtraServices(contractId).catch(() => []);
      const adjustmentsData = await contractsApi.getAdjustments(contractId).catch(() => []);

      // Convertendo o objeto retornado pela API para o tipo Contract
      if (contractData) {
        // Extraindo valores com segurança, usando operador de acesso opcional e valores padrão
        const id = 'id' in contractData ? contractData.id : 0;
        const name = 'name' in contractData ? contractData.name : '';
        const currentValue = 'currentValue' in contractData ? contractData.currentValue : 0;
        const startDateRaw = 'startDate' in contractData ? contractData.startDate : '';
        const endDateRaw = 'endDate' in contractData ? contractData.endDate : null;
        const status = 'status' in contractData ? contractData.status : 'inactive';
        
        // Convertendo valores para os tipos esperados
        const contract_id = typeof id === 'string' ? parseInt(id, 10) : (id || 0);
        const contract_value = String(currentValue || 0);
        const start_date = typeof startDateRaw === 'object' && startDateRaw instanceof Date ? 
          startDateRaw.toISOString() : (typeof startDateRaw === 'string' ? startDateRaw : '');
        const end_date = typeof endDateRaw === 'object' && endDateRaw instanceof Date ? 
          endDateRaw.toISOString() : (typeof endDateRaw === 'string' ? endDateRaw : null);
        
        // Criando o objeto Contract formatado
        const formattedContract: Contract = {
          contract_id,
          contract_name: name,
          contract_value,
          start_date,
          end_date,
          recurrence_period: 'monthly',
          full_name: '',
          group_name: '',
          due_day: 1,
          days_before_due: 0,
          billing_reference: '',
          contract_group_id: 0,
          model_movement_id: 0,
          representative_person_id: null,
          last_billing_date: null,
          next_billing_date: null,
          status,
          billings: [],
          commissioned_value: null,
          account_entry_id: null,
          last_decimo_billing_year: null,
          last_adjustment: null
        };
        
        setContract(formattedContract);
      } else {
        setContract(null);
      }
      setHistory(historyData);
      setExtraServices(servicesData);
      setAdjustments(adjustmentsData);
    } catch (err) {
      console.error('Erro ao carregar detalhes do contrato', err);
      setError('Não foi possível carregar os detalhes do contrato');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractDetails();
  }, [contractId]);

  return {
    contract,
    history,
    extraServices,
    adjustments,
    loading,
    error,
    reloadDetails: loadContractDetails
  };
}
