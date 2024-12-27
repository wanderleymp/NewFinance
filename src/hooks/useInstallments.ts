import { useState, useCallback } from 'react';
import { InstallmentService } from '../services/InstallmentService';
import { InstallmentData, FetchInstallmentsParams } from '../types/installment';

interface UseInstallmentsReturn {
  installments: InstallmentData[];
  isLoading: boolean;
  error: Error | null;
  fetchInstallments: (params: FetchInstallmentsParams) => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const useInstallments = (): UseInstallmentsReturn => {
  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const fetchInstallments = useCallback(async (params: FetchInstallmentsParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await InstallmentService.fetchAccountsReceivable(params);
      
      setInstallments(response.data);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    installments,
    isLoading,
    error,
    fetchInstallments,
    pagination
  };
};