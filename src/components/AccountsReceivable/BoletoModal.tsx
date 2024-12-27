import React, { useState } from 'react';
import { X, FileText, AlertTriangle } from 'lucide-react';
import { AccountReceivable } from '../../types/accounts-receivable';
import { dateUtils } from '../../utils/dateUtils';

interface BoletoModalProps {
  account: AccountReceivable;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dueDate: string) => Promise<void>;
  isLoading: boolean;
}

export const BoletoModal: React.FC<BoletoModalProps> = ({
  account,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [dueDate, setDueDate] = useState(account.due_date.split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(dueDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600">
            <FileText className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Gerar Boleto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="font-medium">Detalhes da Conta:</p>
            <p>Cliente: {account.full_name}</p>
            <p>Valor: {parseFloat(account.value).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}</p>
            <p>Vencimento Original: {dateUtils.formatBrazilianDate(account.due_date)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento do Boleto
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {account.days_overdue > 0 && (
            <div className="flex items-start gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Esta conta está vencida há {account.days_overdue} dias. Certifique-se de ajustar a data de vencimento adequadamente.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                'Gerar Boleto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoletoModal;