import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ServiceSearch } from '../../ServiceSearch';
import { Service } from '../../../types/service';

interface Item {
  item_id: string;
  quantity: string;
  unit_price: string;
  salesperson_id: number | null;
  technician_id: number | null;
  service?: Service | null;
}

interface ItemListProps {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export const ItemList: React.FC<ItemListProps> = ({ items, onChange }) => {
  const handleAddItem = () => {
    onChange([
      ...items,
      {
        item_id: '',
        quantity: '1',
        unit_price: '0',
        salesperson_id: null,
        technician_id: null,
        service: null,
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    onChange(newItems);
  };

  const handleServiceSelect = (index: number, service: Service | null) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      item_id: service ? service.item_id.toString() : '',
      unit_price: service ? service.price : '0',
      service
    };
    onChange(newItems);
  };

  const calculateItemTotal = (item: Item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return quantity * price;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Itens</h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Item</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <ServiceSearch
                  selectedService={item.service}
                  onSelect={(service) => handleServiceSelect(index, service)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Unitário
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-lg font-medium">
                Total: {calculateItemTotal(item).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Remover Item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};