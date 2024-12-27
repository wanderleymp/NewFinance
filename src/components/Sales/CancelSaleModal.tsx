import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Sale } from '../../types/sale';

interface CancelSaleModalProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelSaleModal: React.FC<CancelSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Cancelar Venda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja cancelar esta venda? Esta ação não poderá ser desfeita.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="font-medium">Detalhes da Venda:</p>
            <p>Cliente: {sale.persons.full_name}</p>
            <p>Data: {new Date(sale.movement_date).toLocaleDateString('pt-BR')}</p>
            <p>Valor: {parseFloat(sale.total_amount).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}</p>
          </div>

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
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};