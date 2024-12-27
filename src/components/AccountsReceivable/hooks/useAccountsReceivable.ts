import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AccountReceivable, AccountReceivableFilters } from '../../../types/accounts-receivable';
import { AccountReceivableService } from '../../../services/AccountReceivableService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';
import { dateRangeUtils } from '../../../utils/dateRangeUtils';

export const useAccountsReceivable = () => {
  const [filters, setFilters] = useState<AccountReceivableFilters>({
    period: 'month',
    ...dateRangeUtils.getDateRangeForPeriod('month')
  });

  const [metrics, setMetrics] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });

  const fetchAccountsReceivable = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const response = await AccountReceivableService.getAccountsReceivable(page, limit, filters, search);
      
      // Calculate metrics
      const totalAmount = response.data.reduce((sum, item) => sum + parseFloat(item.value), 0);
      const pendingAmount = response.data
        .filter(item => item.status === 'Pendente')
        .reduce((sum, item) => sum + parseFloat(item.value), 0);
      const overdueAmount = response.data
        .filter(item => item.days_overdue > 0)
        .reduce((sum, item) => sum + parseFloat(item.value), 0);

      setMetrics({
        totalAmount,
        pendingAmount,
        overdueAmount
      });

      return {
        data: response.data,
        meta: {
          total: response.pagination.total,
          pages: response.pagination.totalPages,
          current_page: response.pagination.currentPage,
          per_page: response.pagination.perPage
        }
      };
    } catch (error) {
      console.error('Error loading accounts receivable:', error);
      toast.error('Erro ao carregar contas a receber');
      throw error;
    }
  }, [filters]);

  const {
    data: accountsReceivable,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<AccountReceivable>({
    fetchData: fetchAccountsReceivable,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'custom') => {
    if (period === 'custom') {
      setFilters(prev => ({ ...prev, period }));
    } else {
      const dateRange = dateRangeUtils.getDateRangeForPeriod(period);
      setFilters({
        ...filters,
        period,
        ...dateRange
      });
      loadData(1);
    }
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      period: 'custom',
      startDate,
      endDate
    }));
    loadData(1);
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    loadData(1);
  };

  const handleTypeChange = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
    loadData(1);
  };

  const metricsData = [
    {
      title: 'Total a Receber',
      value: metrics.totalAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Pendente',
      value: metrics.pendingAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      textColor: 'text-white',
    },
    {
      title: 'Vencido',
      value: metrics.overdueAmount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-white',
    },
  ];

  return {
    accountsReceivable,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics: metricsData,
    filters,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handlePeriodChange,
    handleDateRangeChange,
    handleStatusChange,
    handleTypeChange,
    loadData,
  };
};