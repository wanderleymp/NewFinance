import React from 'react';
import { X, Send, AlertCircle, Receipt, Calendar } from 'lucide-react';
import { Billing } from '../types/contract';
import { format } from 'date-fns';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billing: Billing | null;
}

export function NotificationModal({
  isOpen,
  onClose,
  onConfirm,
  billing,
}: NotificationModalProps) {
  if (!isOpen || !billing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Enviar Notificação</h2>
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
                Deseja enviar esta fatura ao cliente?
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Uma notificação será enviada ao cliente com os detalhes da fatura.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Número da Fatura:</span>
              <div className="flex items-center space-x-1">
                <Receipt className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{billing.number}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor:</span>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(billing.value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vencimento:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {format(new Date(billing.dueDate), 'dd/MM/yyyy')}
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
            onClick={onConfirm}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Notificação
          </button>
        </div>
      </div>
    </div>
  );
}