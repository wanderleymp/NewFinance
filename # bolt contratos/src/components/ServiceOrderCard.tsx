import React from 'react';
import { ServiceOrder } from '../types/serviceOrder';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Clock, User, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onClick: () => void;
}

export function ServiceOrderCard({ order, onClick }: ServiceOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1" {...listeners} {...attributes}>
          <h4 className="font-medium text-gray-900">{order.title}</h4>
          <span className={cn(
            'inline-block mt-1 text-xs px-2 py-1 rounded-full',
            priorityColors[order.priority]
          )}>
            {order.priority}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Ver detalhes"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div {...listeners} {...attributes}>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {order.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{order.customer.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(order.openedAt), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}