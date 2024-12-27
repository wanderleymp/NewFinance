import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PersonSearch } from './PersonSearch';
import { PaymentMethodSearch } from '../../PaymentMethodSearch';
import { SearchLicense } from '../../SearchLicense';
import { ItemList } from './ItemList';
import { Person } from '../../../types/person';
import { PaymentMethod } from '../../../types/payment-method';
import { License } from '../../../types/license';
import { SaleService } from '../../../services/SaleService';

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState({
    movement_date: new Date().toISOString().split('T')[0],
    movement_status_id: 1,
    description: '',
    discount: '0',
    addition: '0',
    items: [
      {
        item_id: '',
        quantity: '1',
        unit_price: '0',
        salesperson_id: null,
        technician_id: null,
      }
    ]
  });

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return total + (quantity * price);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    const addition = parseFloat(formData.addition) || 0;
    return subtotal - discount + addition;
  };

  const validateForm = () => {
    if (!selectedPerson) {
      toast.error('Selecione um cliente');
      return false;
    }

    if (!selectedLicense) {
      toast.error('Selecione uma licença');
      return false;
    }

    if (!selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento');
      return false;
    }

    if (formData.items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return false;
    }

    if (formData.items.some(item => !item.item_id || !item.quantity || parseFloat(item.unit_price) <= 0)) {
      toast.error('Preencha todos os campos dos itens corretamente');
      return false;
    }

    const total = calculateTotal();
    if (total <= 0) {
      toast.error('O valor total deve ser maior que zero');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const payload = {
        movement_date: formData.movement_date,
        person_id: selectedPerson.id,
        total_amount: calculateTotal(),
        license_id: selectedLicense.id,
        payment_method_id: selectedPaymentMethod.id,
        movement_status_id: formData.movement_status_id,
        description: formData.description,
        items: formData.items.map(item => ({
          item_id: parseInt(item.item_id),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
          salesperson_id: null,
          technician_id: null
        }))
      };

      await SaleService.createSale(payload);
      toast.success('Venda criada com sucesso');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Erro ao criar venda');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Nova Venda</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Venda
            </label>
            <input
              type="date"
              value={formData.movement_date}
              onChange={(e) => setFormData(prev => ({ ...prev, movement_date: e.target.value }))}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              required
            />
          </div>

          <PersonSearch
            selectedPerson={selectedPerson}
            onSelect={setSelectedPerson}
          />

          <SearchLicense
            selectedLicense={selectedLicense}
            onSelect={setSelectedLicense}
          />

          <PaymentMethodSearch
            selectedPaymentMethod={selectedPaymentMethod}
            onSelect={setSelectedPaymentMethod}
          />

          <ItemList
            items={formData.items}
            onChange={(items) => setFormData(prev => ({ ...prev, items }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acréscimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.addition}
                onChange={(e) => setFormData(prev => ({ ...prev, addition: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="Observações sobre a venda..."
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Subtotal: {calculateSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              {parseFloat(formData.discount) > 0 && (
                <p className="text-sm text-red-500">
                  Desconto: -{parseFloat(formData.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              )}
              {parseFloat(formData.addition) > 0 && (
                <p className="text-sm text-green-500">
                  Acréscimo: +{parseFloat(formData.addition).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              )}
              <p className="text-lg font-semibold">
                Total: {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="flex gap-2">
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
                {isLoading ? 'Criando...' : 'Criar Venda'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};