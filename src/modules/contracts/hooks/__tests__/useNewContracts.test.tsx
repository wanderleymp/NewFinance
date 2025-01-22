import { renderHook, act } from '@testing-library/react-hooks';
import { NewContractService } from '../../services/newContractService';
import { useNewContracts } from '../useNewContracts';
import { Contract } from '../../types/contract';

// Mock do serviço de contratos
jest.mock('../../services/newContractService', () => ({
  NewContractService: {
    getInstance: jest.fn()
  }
}));

// Mock de dados de contrato
const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Contrato Teste 1',
    value: 1000,
    status: 'ativo',
    startDate: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Contrato Teste 2',
    value: 2000,
    status: 'ativo',
    startDate: new Date().toISOString()
  }
];

describe('useNewContracts Hook', () => {
  let mockListRecurring: jest.Mock;
  let mockCreateRecurring: jest.Mock;
  let mockUpdateRecurring: jest.Mock;
  let mockDeleteRecurring: jest.Mock;

  beforeEach(() => {
    // Configurar mocks antes de cada teste
    mockListRecurring = jest.fn().mockResolvedValue({
      data: mockContracts,
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2
      }
    });

    mockCreateRecurring = jest.fn().mockImplementation((data) => ({
      ...data,
      id: '3'
    }));

    mockUpdateRecurring = jest.fn().mockImplementation((id, data) => ({
      ...data,
      id
    }));

    mockDeleteRecurring = jest.fn().mockResolvedValue(undefined);

    (NewContractService.getInstance as jest.Mock).mockReturnValue({
      listRecurring: mockListRecurring,
      createRecurring: mockCreateRecurring,
      updateRecurring: mockUpdateRecurring,
      deleteRecurring: mockDeleteRecurring
    });
  });

  test('Deve buscar contratos inicialmente', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNewContracts());

    // Verificar estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.contracts.length).toBe(0);

    // Aguardar carregamento
    await waitForNextUpdate();

    // Verificar resultado
    expect(result.current.loading).toBe(false);
    expect(result.current.contracts).toEqual(mockContracts);
    expect(mockListRecurring).toHaveBeenCalledWith(1, 10);
  });

  test('Deve criar um contrato válido', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNewContracts());

    const novoContrato = {
      name: 'Novo Contrato',
      value: 3000,
      status: 'ativo'
    };

    await act(async () => {
      const contratoCriado = await result.current.createContract(novoContrato);
      
      expect(mockCreateRecurring).toHaveBeenCalledWith(expect.objectContaining(novoContrato));
      expect(contratoCriado.id).toBe('3');
    });
  });

  test('Deve lançar erro ao criar contrato inválido', async () => {
    const { result } = renderHook(() => useNewContracts());

    const contratoInvalido = {
      name: 'A', // Nome muito curto
      value: -100 // Valor negativo
    };

    await act(async () => {
      await expect(result.current.createContract(contratoInvalido)).rejects.toThrow();
      expect(result.current.error).toContain('Nome do contrato deve ter pelo menos 3 caracteres');
      expect(result.current.error).toContain('Valor do contrato deve ser positivo');
    });
  });

  test('Deve atualizar um contrato existente', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNewContracts());

    // Primeiro buscar contratos
    await waitForNextUpdate();

    const contratoParaAtualizar = {
      name: 'Contrato Atualizado',
      value: 5000
    };

    await act(async () => {
      const contratoAtualizado = await result.current.updateContract('1', contratoParaAtualizar);
      
      expect(mockUpdateRecurring).toHaveBeenCalledWith('1', expect.objectContaining(contratoParaAtualizar));
      expect(contratoAtualizado.id).toBe('1');
    });
  });

  test('Deve deletar um contrato', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNewContracts());

    // Primeiro buscar contratos
    await waitForNextUpdate();

    await act(async () => {
      await result.current.deleteContract('1');
      
      expect(mockDeleteRecurring).toHaveBeenCalledWith('1');
    });
  });

  test('Deve mudar de página', async () => {
    const { result } = renderHook(() => useNewContracts());

    act(() => {
      result.current.changePage(2);
    });

    expect(result.current.page).toBe(2);
  });

  test('Deve limpar erro', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNewContracts());

    // Forçar um erro
    await act(async () => {
      try {
        await result.current.createContract({ name: 'A', value: -100 });
      } catch {}
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
