import { useCallback, useState } from 'react';
import { Sale } from '../../../types/sale';
import { SaleService } from '../../../services/SaleService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';
import { useSalesData } from '../../../hooks/useSalesData';
import { formatSaleMetrics } from '../../../utils/metricsFormatter';

export const useSales = () => {
  const [filters, setFilters] = useState({
    period: 'month',
    status: 'all',
    ...SaleService.getDateRangeForPeriod('month')
  });

  const {
    sales,
    isLoading: isLoadingSales,
    pagination,
    fetchSales
  } = useSalesData();

  const {
    viewMode,
    searchTerm,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
    isLoading: isLoadingCRUD
  } = useCRUDBase<Sale>({
    fetchData: fetchSales,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handlePeriodChange = (period: 'today' | 'week' | 'month' | 'custom') => {
    if (period === 'custom') {
      setFilters(prev => ({ ...prev, period }));
    } else {
      const dateRange = SaleService.getDateRangeForPeriod(period);
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

  const metrics = formatSaleMetrics(sales || [], pagination.total);

  return {
    sales,
    isLoading: isLoadingSales || isLoadingCRUD,
    viewMode,
    searchTerm,
    pagination,
    filters,
    metrics,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handlePeriodChange,
    handleDateRangeChange,
    handleStatusChange,
    loadData,
  };
};