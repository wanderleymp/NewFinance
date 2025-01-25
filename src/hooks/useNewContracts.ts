import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import api from '../services/api';

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

interface UseContractsSearchProps {
  initialSearch?: string;
  delay?: number;
}

export function useNewContracts({ 
  initialSearch = '', 
  delay = 500 
}: UseContractsSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0
  });

  useEffect(() => {
    async function fetchContracts() {
      // Só busca se o termo tiver pelo menos 2 caracteres
      if (debouncedSearchTerm.length < 2 && debouncedSearchTerm !== '') return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/contracts-recurring', {
          params: {
            page: 1,
            limit: 10,
            search: debouncedSearchTerm
          }
        });

        setContracts(response.data.items || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          totalPages: response.data.totalPages || 0,
          total: response.data.total || 0
        });
      } catch (err) {
        console.error('Erro na busca de contratos:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
        setContracts([]);
        setPagination({
          page: 1,
          limit: 10,
          totalPages: 0,
          total: 0
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContracts();
  }, [debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    contracts,
    loading,
    error,
    pagination
  };
}
