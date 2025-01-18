import { renderHook, act } from '@testing-library/react-hooks';
import { useContracts, useContractDetails } from '../hooks';
import { contractsApi } from '../services/api';
import { mockData } from '../services/mockData';

jest.mock('../services/api');
jest.mock('../services/mockData');

describe('Hooks de Contratos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useContracts', () => {
    it('deve carregar contratos corretamente', async () => {
      const mockContracts = [
        { id: '1', name: 'Contrato Teste', status: 'ativo' },
        { id: '2', name: 'Outro Contrato', status: 'pendente' }
      ];

      (contractsApi.list as jest.Mock).mockResolvedValue(mockContracts);

      const { result, waitForNextUpdate } = renderHook(() => useContracts());

      expect(result.current.loading).toBe(true);
      
      await waitForNextUpdate();

      expect(result.current.contracts).toEqual(mockContracts);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('deve usar dados mock quando a API falhar', async () => {
      const mockFallbackContracts = [
        { id: '3', name: 'Contrato Mock', status: 'inativo' }
      ];

      (contractsApi.list as jest.Mock).mockRejectedValue(new Error('Erro de API'));
      (mockData.contracts as jest.Mock).mockReturnValue(mockFallbackContracts);

      const { result, waitForNextUpdate } = renderHook(() => useContracts());

      await waitForNextUpdate();

      expect(result.current.contracts).toEqual(mockFallbackContracts);
      expect(result.current.error).toBe('Não foi possível carregar os contratos');
    });

    it('deve lidar com lista de contratos vazia', async () => {
      (contractsApi.list as jest.Mock).mockResolvedValue([]);

      const { result, waitForNextUpdate } = renderHook(() => useContracts());

      await waitForNextUpdate();

      expect(result.current.contracts).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useContractDetails', () => {
    const mockContractId = '1';
    const mockContract = { 
      id: mockContractId, 
      name: 'Contrato Detalhado',
      startDate: '2023-01-01',
      endDate: '2024-01-01'
    };

    it('deve carregar detalhes do contrato corretamente', async () => {
      (contractsApi.get as jest.Mock).mockResolvedValue(mockContract);
      (contractsApi.getHistory as jest.Mock).mockResolvedValue([]);
      (contractsApi.getExtraServices as jest.Mock).mockResolvedValue([]);
      (contractsApi.getAdjustments as jest.Mock).mockResolvedValue([]);

      const { result, waitForNextUpdate } = renderHook(() => useContractDetails(mockContractId));

      expect(result.current.loading).toBe(true);
      
      await waitForNextUpdate();

      expect(result.current.contract).toEqual(mockContract);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('deve usar dados mock quando detalhes do contrato falharem', async () => {
      (contractsApi.get as jest.Mock).mockRejectedValue(new Error('Erro ao buscar contrato'));
      (mockData.contracts as jest.Mock).mockReturnValue([mockContract]);

      const { result, waitForNextUpdate } = renderHook(() => useContractDetails(mockContractId));

      await waitForNextUpdate();

      expect(result.current.contract).toEqual(mockContract);
      expect(result.current.error).toBe('Não foi possível carregar os detalhes do contrato');
    });

    it('não deve carregar detalhes se nenhum ID for fornecido', async () => {
      const { result } = renderHook(() => useContractDetails());

      expect(result.current.contract).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
