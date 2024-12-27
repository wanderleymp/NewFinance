import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, KanbanSquare, Ban, MessageCircle, Receipt, Edit } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useSales } from './hooks/useSales';
import { columns } from './columns';
import { renderSaleCard } from './renderCard';
import { SaleForm } from './SaleForm';
import { CancelSaleModal } from './CancelSaleModal';
import { Sale } from '../../types/sale';
import { SaleService } from '../../services/SaleService';
import { MessagingService } from '../../services/MessagingService';
import { toast } from 'react-hot-toast';

export const SaleList: React.FC = () => {
  const navigate = useNavigate();
  const {
    sales,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    filters,
    kanbanColumns,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handlePeriodChange,
    handleDateRangeChange,
    handleStatusChange,
    loadData,
  } = useSales();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isGeneratingBoleto, setIsGeneratingBoleto] = useState(false);

  const handleEdit = (sale: Sale) => {
    navigate(`/sales/edit/${sale.movement_id}`, { state: { sale } });
  };

  const handleCancelClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSale) return;

    try {
      setIsCanceling(true);
      await SaleService.cancelSale(selectedSale.movement_id);
      setIsCancelModalOpen(false);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    } finally {
      setIsCanceling(false);
      setSelectedSale(null);
    }
  };

  const handleSendMessage = async (sale: Sale) => {
    try {
      await MessagingService.sendInvoiceMessage(sale.movement_id);
      toast.success('Mensagem enviada com sucesso');
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('ID da venda inválido');
      } else {
        toast.error('Erro ao enviar mensagem');
      }
    }
  };

  const handleGenerateBoleto = async (sale: Sale) => {
    try {
      setIsGeneratingBoleto(true);
      await SaleService.generateBoleto(sale.movement_id);
      loadData(pagination.currentPage);
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('ID da venda inválido');
      } else {
        toast.error('Erro ao gerar boleto');
      }
    } finally {
      setIsGeneratingBoleto(false);
    }
  };

  const renderCustomActions = (sale: Sale) => (
    <>
      <button
        onClick={() => handleEdit(sale)}
        className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
        title="Editar Venda"
      >
        <Edit className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
      </button>
      <button
        onClick={() => handleGenerateBoleto(sale)}
        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
        title="Gerar Boleto"
        disabled={isGeneratingBoleto}
      >
        <Receipt className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
      </button>
      <button
        onClick={() => handleSendMessage(sale)}
        className="p-1.5 hover:bg-[#25D366]/10 rounded-lg transition-colors duration-200 group"
        title="Enviar Mensagem da Venda"
      >
        <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#25D366]" />
      </button>
      <button
        onClick={() => handleCancelClick(sale)}
        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
        title="Cancelar Venda"
      >
        <Ban className="w-4 h-4 text-red-500 group-hover:text-red-600" />
      </button>
    </>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Venda</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                handlePeriodChange('today');
                setShowCustomDateRange(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filters.period === 'today' && !showCustomDateRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Hoje</span>
            </button>
            <button
              onClick={() => {
                handlePeriodChange('week');
                setShowCustomDateRange(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.period === 'week' && !showCustomDateRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Última Semana
            </button>
            <button
              onClick={() => {
                handlePeriodChange('month');
                setShowCustomDateRange(false);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.period === 'month' && !showCustomDateRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Último Mês
            </button>
            <button
              onClick={() => setShowCustomDateRange(!showCustomDateRange)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showCustomDateRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Período Personalizado
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleStatusChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleStatusChange('23')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === '23'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => handleStatusChange('24')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === '24'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Aprovados
          </button>
          <button
            onClick={() => handleStatusChange('25')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === '25'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Concluídos
          </button>
          <button
            onClick={() => handleStatusChange('26')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === '26'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Cancelados
          </button>
        </div>

        {showCustomDateRange && (
          <div className="flex items-center gap-2 mb-4 p-4 bg-white rounded-lg border border-gray-200">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate!)}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateRangeChange(filters.startDate!, e.target.value)}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        <CRUDBase
          title="Vendas"
          subtitle="Gerencie as vendas do sistema"
          data={sales}
          columns={columns}
          renderCard={renderSaleCard}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          kanbanColumns={kanbanColumns}
          viewModeOptions={[
            { mode: 'table', icon: 'table', label: 'Tabela' },
            { mode: 'grid', icon: 'grid', label: 'Cards' },
            { mode: 'kanban', icon: KanbanSquare, label: 'Kanban' }
          ]}
          renderCustomActions={renderCustomActions}
        />
      </div>

      <SaleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          loadData(1);
          setIsFormOpen(false);
        }}
      />

      {selectedSale && (
        <CancelSaleModal
          sale={selectedSale}
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedSale(null);
          }}
          onConfirm={handleConfirmCancel}
          isLoading={isCanceling}
        />
      )}
    </>
  );
};