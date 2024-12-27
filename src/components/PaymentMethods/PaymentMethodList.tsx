import React, { useState } from 'react';
import { CreditCard, Edit2 } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { columns } from './columns';
import { renderPaymentMethodCard } from './renderCard';
import { PaymentMethodForm } from './PaymentMethodForm';
import { PaymentMethod } from '../../types/payment-method';

export const PaymentMethodList: React.FC = () => {
  const {
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
  } = usePaymentMethods();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPaymentMethod(null);
  };

  const renderCustomActions = (paymentMethod: PaymentMethod) => (
    <button
      onClick={() => handleEdit(paymentMethod)}
      className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
      title="Editar"
    >
      <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
    </button>
  );

  const metricsData = [
    {
      title: 'Total de Métodos',
      value: metrics.total,
      trend: 0,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    },
    {
      title: 'Métodos Ativos',
      value: metrics.active,
      trend: metrics.total > 0 ? (metrics.active / metrics.total) * 100 : 0,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-white',
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Novo Método de Pagamento</span>
          </button>
        </div>

        <CRUDBase
          title="Métodos de Pagamento"
          subtitle="Gerencie os métodos de pagamento do sistema"
          data={paymentMethods}
          columns={columns}
          renderCard={renderPaymentMethodCard}
          metrics={metricsData}
          onToggleStatus={handleToggleStatus}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          renderCustomActions={renderCustomActions}
        />
      </div>

      <PaymentMethodForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={() => {
          loadData(1);
          handleCloseForm();
        }}
        paymentMethod={selectedPaymentMethod}
      />
    </>
  );
};