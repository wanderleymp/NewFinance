import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PaymentMethod } from '../../types/payment-method';
import { PaymentMethodService } from '../../services/PaymentMethodService';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  paymentMethod?: PaymentMethod | null;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  isOpen,
  onClose,
  onSave,
  paymentMethod,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    method_name: '',
    description: '',
    has_entry: false,
    installment_count: 1,
    days_between_installments: 30,
    first_due_date_days: 0,
    account_entry_id: 1,
    integration_mapping_id: 1,
    payment_document_type_id: 1,
    credential_id: 1,
    bank_account_id: 1,
    active: true
  });

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        method_name: paymentMethod.name,
        description: paymentMethod.description,
        has_entry: false,
        installment_count: 1,
        days_between_installments: 30,
        first_due_date_days: 0,
        account_entry_id: 1,
        integration_mapping_id: 1,
        payment_document_type_id: 1,
        credential_id: 1,
        bank_account_id: 1,
        active: paymentMethod.active
      });
    } else {
      setFormData({
        method_name: '',
        description: '',
        has_entry: false,
        installment_count: 1,
        days_between_installments: 30,
        first_due_date_days: 0,
        account_entry_id: 1,
        integration_mapping_id: 1,
        payment_document_type_id: 1,
        credential_id: 1,
        bank_account_id: 1,
        active: true
      });
    }
  }, [paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.method_name.trim()) {
      toast.error('Digite o nome do método de pagamento');
      return;
    }

    try {
      setIsLoading(true);
      if (paymentMethod) {
        await PaymentMethodService.updatePaymentMethod(paymentMethod.id, formData);
      } else {
        await PaymentMethodService.createPaymentMethod(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error(paymentMethod ? 'Erro ao atualizar método de pagamento' : 'Erro ao criar método de pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {paymentMethod ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="method_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                id="method_name"
                type="text"
                value={formData.method_name}
                onChange={(e) => setFormData(prev => ({ ...prev, method_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="installment_count" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Parcelas
              </label>
              <input
                id="installment_count"
                type="number"
                min="1"
                value={formData.installment_count}
                onChange={(e) => setFormData(prev => ({ ...prev, installment_count: parseInt(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="days_between_installments" className="block text-sm font-medium text-gray-700 mb-1">
                Dias Entre Parcelas
              </label>
              <input
                id="days_between_installments"
                type="number"
                min="0"
                value={formData.days_between_installments}
                onChange={(e) => setFormData(prev => ({ ...prev, days_between_installments: parseInt(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="first_due_date_days" className="block text-sm font-medium text-gray-700 mb-1">
                Dias para Primeiro Vencimento
              </label>
              <input
                id="first_due_date_days"
                type="number"
                min="0"
                value={formData.first_due_date_days}
                onChange={(e) => setFormData(prev => ({ ...prev, first_due_date_days: parseInt(e.target.value) }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_entry}
                  onChange={(e) => setFormData(prev => ({ ...prev, has_entry: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Possui Entrada</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (paymentMethod ? 'Salvando...' : 'Criando...') : (paymentMethod ? 'Salvar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};