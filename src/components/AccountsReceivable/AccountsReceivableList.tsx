import React, { useState } from 'react';
import { Calendar, Receipt, FileText, Ban, MessageCircle } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useAccountsReceivable } from './hooks/useAccountsReceivable';
import { columns } from './columns';
import { renderAccountReceivableCard } from './renderCard';
import { BoletoModal } from './BoletoModal';
import { AccountReceivable } from '../../types/accounts-receivable';
import { AccountReceivableService } from '../../services/AccountReceivableService';
import { MessagingService } from '../../services/MessagingService';
import { toast } from 'react-hot-toast';

export const AccountsReceivableList: React.FC = () => {
  const {
    accountsReceivable,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics,
    filters,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handlePeriodChange,
    handleDateRangeChange,
    handleStatusChange,
    handleTypeChange,
    loadData,
  } = useAccountsReceivable();

  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const [isGeneratingBoleto, setIsGeneratingBoleto] = useState(false);
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const handleGenerateBoleto = async (dueDate: string) => {
    if (!selectedAccount) return;

    try {
      setIsGeneratingBoleto(true);
      await AccountReceivableService.generateBoleto(selectedAccount.installment_id);
      setIsBoletoModalOpen(false);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    } finally {
      setIsGeneratingBoleto(false);
      setSelectedAccount(null);
    }
  };

  const handleCancelAccount = async (account: AccountReceivable) => {
    try {
      await AccountReceivableService.cancelAccount(account.movement_id);
      loadData(pagination.currentPage);
    } catch (error) {
      // Error is handled by the service
    }
  };

  const handleSendMessage = async (account: AccountReceivable) => {
    try {
      await MessagingService.sendInstallmentMessage(account.installment_id);
      toast.success('Mensagem enviada com sucesso');
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('ID da parcela inválido');
      } else {
        toast.error('Erro ao enviar mensagem');
      }
    }
  };

  const renderCustomActions = (account: AccountReceivable) => {
    const actions = [];

    if (account.movement_status_id !== 19) {
      actions.push(
        <button
          key="cancel"
          onClick={() => handleCancelAccount(account)}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
          title="Cancelar"
        >
          <Ban className="w-4 h-4 text-red-500 group-hover:text-red-600" />
        </button>
      );
    }

    if (account.status === 'Pendente') {
      if (!account.boleto_url) {
        actions.push(
          <button
            key="generate"
            onClick={() => {
              setSelectedAccount(account);
              setIsBoletoModalOpen(true);
            }}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 group"
            title="Gerar Boleto"
          >
            <Receipt className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
          </button>
        );
      } else {
        actions.push(
          <a
            key="view"
            href={account.boleto_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-green-50 rounded-lg transition-colors duration-200 group"
            title="Visualizar Boleto"
          >
            <FileText className="w-4 h-4 text-green-500 group-hover:text-green-600" />
          </a>
        );
      }

      actions.push(
        <button
          key="message"
          onClick={() => handleSendMessage(account)}
          className="p-1.5 hover:bg-[#25D366]/10 rounded-lg transition-colors duration-200 group"
          title="Enviar Mensagem"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#25D366]" />
        </button>
      );
    }

    return <>{actions}</>;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
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
              onClick={() => handleStatusChange('Pendente')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.status === 'Pendente'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => handleStatusChange('Pago')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filters.status === 'Pago'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Pagos
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
              Semana Atual
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
              Mês Atual
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
          title="Contas a Receber"
          subtitle="Gerencie as contas a receber do sistema"
          data={accountsReceivable}
          columns={columns}
          renderCard={renderAccountReceivableCard}
          metrics={metrics}
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

      {selectedAccount && (
        <BoletoModal
          account={selectedAccount}
          isOpen={isBoletoModalOpen}
          onClose={() => {
            setIsBoletoModalOpen(false);
            setSelectedAccount(null);
          }}
          onConfirm={handleGenerateBoleto}
          isLoading={isGeneratingBoleto}
        />
      )}
    </>
  );
};