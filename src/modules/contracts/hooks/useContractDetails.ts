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

      setContract(contractData || null);
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
