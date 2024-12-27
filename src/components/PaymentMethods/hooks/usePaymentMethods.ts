import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PaymentMethod } from '../../../types/payment-method';
import { PaymentMethodService } from '../../../services/PaymentMethodService';
import { useCRUDBase } from '../../CRUDBase/hooks/useCRUDBase';

export const usePaymentMethods = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0
  });

  const fetchPaymentMethods = useCallback(async (page: number, limit: number, search?: string) => {
    try {
      const response = await PaymentMethodService.getPaymentMethods(page, limit, search);
      
      // Calculate metrics
      const active = response.data.filter(pm => pm.active).length;
      setMetrics({
        total: response.meta.total,
        active
      });

      return response;
    } catch (error) {
      toast.error('Erro ao carregar métodos de pagamento');
      throw error;
    }
  }, []);

  const {
    data: paymentMethods,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    loadData,
  } = useCRUDBase<PaymentMethod>({
    fetchData: fetchPaymentMethods,
    initialState: {
      viewMode: 'table',
      itemsPerPage: 10
    }
  });

  const handleToggleStatus = async (paymentMethod: PaymentMethod) => {
    try {
      await PaymentMethodService.togglePaymentMethodStatus(paymentMethod.id);
      loadData(pagination.currentPage);
    } catch (error) {
      toast.error('Erro ao alterar status do método de pagamento');
    }
  };

  return {
    paymentMethods,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    loadData,
  };
};