import React from 'react';
import { X, AlertCircle, Receipt, Calendar } from 'lucide-react';
import { Contract } from '../types/contract';
import { format } from 'date-fns';
import { contractService } from '../../modules/contracts/services/contractService';
import toast from 'react-hot-toast';

interface BillingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contract: Contract;
  onRefresh?: () => void;
}

export function BillingConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  contract,
  onRefresh
}: BillingConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirmBilling = async () => {
    if (!contract) return;

    try {
      // Identifica o ID da fatura ou do contrato
      const billingId = contract.billings?.[0]?.id || String(contract.id);
      
      if (!billingId) {
        toast.error('Não foi possível identificar a fatura para processamento.');
        return;
      }

      // Log detalhado
      console.log('Processando faturamento', {
        billingId,
        contractId: contract.id,
        contractName: contract.name,
        contractStatus: contract.status
      });

      // Usa o método de processamento de fatura
      await contractService.processBilling(String(billingId));
      
      // Notificação de sucesso
      toast.success('Fatura processada com sucesso', { 
        duration: 3000,
        position: 'bottom-right'
      });

      // Fecha o modal
      onClose();
      
      // Atualiza a lista se o callback de refresh estiver disponível
      if (onRefresh) onRefresh();
    } catch (error) {
      // Log e tratamento de erro
      console.error('Erro no processamento de fatura:', error);
      
      toast.error('Erro ao processar fatura. Tente novamente.', {
        duration: 4000,
        position: 'bottom-right'
      });
    }
  };

  // Log para debug
  console.log('BillingConfirmationModal - Detalhes:', {
    contractName: contract.name,
    contractNumber: contract.number || 'N/A',
    billingValue: contract.currentValue || contract.value || 0,
    contractStartDate: contract.startDate ? new Date(contract.startDate) : new Date(),
    contractEndDate: contract.endDate ? new Date(contract.endDate) : new Date(),
    contract
  });

  const safeContractName = contract.name || 'Cliente não identificado';
  const safeContractValue = contract.currentValue || contract.value || 0;
  const safeNextBillingDate = contract.nextBillingDate 
    ? new Date(contract.nextBillingDate) 
    : new Date();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Faturamento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900">
                Deseja faturar este contrato agora?
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Esta ação irá gerar uma nova fatura para o contrato selecionado.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contrato:</span>
              <span className="font-medium text-gray-900">{safeContractName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(safeContractValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Data de Vencimento:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {format(safeNextBillingDate, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmBilling}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
          >
            Confirmar Faturamento
          </button>
        </div>
      </div>
    </div>
  );
}