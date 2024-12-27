import { useState, useCallback } from 'react';
import { Sale, GetSalesParams, GetSalesResponse } from '../types/sale';
import { SaleService } from '../services/SaleService';

export const useSalesData = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const fetchSales = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: GetSalesParams = {
        page,
        limit,
        search
      };
      
      const response = await SaleService.getSales(params);
      
      setSales(response.data);
      setPagination(response.pagination);

      return {
        data: response.data,
        meta: {
          total: response.pagination.total,
          pages: response.pagination.totalPages,
          current_page: response.pagination.page,
          per_page: response.pagination.limit
        }
      };
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to fetch sales'));
      setSales([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sales,
    isLoading,
    error,
    pagination,
    fetchSales
  };
};