import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import { X, Search } from 'lucide-react';
import { format } from 'date-fns';

interface LinkServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceOrderId: string) => void;
}

export function LinkServiceOrderModal({ isOpen, onClose, onSubmit }: LinkServiceOrderModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () => mockData.getServiceOrders(),
  });

  const filteredOrders = serviceOrders.filter(order => 
    order.status !== 'completed' &&
    (order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.id.toString().includes(searchTerm))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Vincular a OS Existente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar OS por número ou título..."
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhuma OS encontrada
              </p>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        OS #{order.id} - {order.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.openedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cliente: {order.customer.name}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSubmit(order.id);
                        onClose();
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Vincular
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}