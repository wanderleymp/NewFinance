import { useQuery } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Phone, Monitor, Mail, Calendar, Clock, User } from 'lucide-react';
import { ServiceOrderModal } from './ServiceOrderModal';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function ServiceOrderGrid() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: serviceOrders = [] } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () => mockData.getServiceOrders(),
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">{order.title}</h4>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                priorityColors[order.priority]
              )}>
                {order.priority}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {order.description}
            </p>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{order.customer.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(order.openedAt), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{order.serviceType}</span>
                <span className="font-medium text-indigo-600 uppercase">{order.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ServiceOrderModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        serviceOrder={selectedOrder}
      />
    </>
  );
}