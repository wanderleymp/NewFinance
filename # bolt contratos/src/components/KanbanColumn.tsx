import React from 'react';
import { ServiceOrder, ServiceOrderStatus } from '../types/serviceOrder';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ServiceOrderCard } from './ServiceOrderCard';

interface KanbanColumnProps {
  id: ServiceOrderStatus;
  title: string;
  orders: ServiceOrder[];
  onOrderClick: (order: ServiceOrder) => void;
}

export function KanbanColumn({ id, title, orders, onOrderClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
    >
      <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
        <span>{title}</span>
        <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
          {orders.length}
        </span>
      </h3>

      <SortableContext items={orders} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {orders.map(order => (
            <ServiceOrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}