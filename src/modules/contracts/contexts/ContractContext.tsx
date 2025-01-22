import React, { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useCallback 
} from 'react';
import { Contract, ContractResponse } from '../types/contract';
import { NewContractService } from '../services/newContractService';
import { 
  ContractValidator, 
  ContractValidationError 
} from '../utils/contractValidation';

// Definição do tipo de contexto
interface ContractContextType {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  fetchContracts: (page?: number, limit?: number) => Promise<void>;
  createContract: (contractData: Partial<Contract>) => Promise<Contract>;
  updateContract: (id: string, contractData: Partial<Contract>) => Promise<Contract>;
  deleteContract: (id: string) => Promise<void>;
  changePage: (newPage: number) => void;
  clearError: () => void;
}

// Criação do contexto
const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Provider do contexto
export const ContractProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const contractService = NewContractService.getInstance();

  const fetchContracts = useCallback(async (currentPage = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response: ContractResponse = await contractService.listRecurring(currentPage, limit);
      
      setContracts(response.data);
      setPage(currentPage);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao buscar contratos: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContract = useCallback(async (contractData: Partial<Contract>) => {
    try {
      // Validação antes da criação
      ContractValidator.validateContract(contractData);
      
      // Sanitização dos dados
      const sanitizedData = ContractValidator.sanitizeContract(contractData);
      
      const newContract = await contractService.createRecurring(sanitizedData);
      
      setContracts(prev => [...prev, newContract]);
      
      return newContract;
    } catch (err) {
      if (err instanceof ContractValidationError) {
        setError(err.message);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro ao criar contrato: ${errorMessage}`);
      }
      console.error(err);
      throw err;
    }
  }, []);

  const updateContract = useCallback(async (id: string, contractData: Partial<Contract>) => {
    try {
      // Validação antes da atualização
      ContractValidator.validateContract(contractData);
      
      // Sanitização dos dados
      const sanitizedData = ContractValidator.sanitizeContract(contractData);
      
      const updatedContract = await contractService.updateRecurring(id, sanitizedData);
      
      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      if (err instanceof ContractValidationError) {
        setError(err.message);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro ao atualizar contrato: ${errorMessage}`);
      }
      console.error(err);
      throw err;
    }
  }, []);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await contractService.deleteRecurring(id);
      
      setContracts(prev => prev.filter(contract => contract.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao deletar contrato: ${errorMessage}`);
      console.error(err);
      throw err;
    }
  }, []);

  const changePage = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchContracts(newPage);
    }
  }, [totalPages, fetchContracts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar contratos inicialmente
  React.useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return (
    <ContractContext.Provider 
      value={{
        contracts,
        loading,
        error,
        page,
        totalPages,
        fetchContracts,
        createContract,
        updateContract,
        deleteContract,
        changePage,
        clearError
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useContractContext = () => {
  const context = useContext(ContractContext);
  
  if (context === undefined) {
    throw new Error('useContractContext deve ser usado dentro de um ContractProvider');
  }
  
  return context;
};
