import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import { ServiceOrder, ServiceOrderStatus } from '../types/serviceOrder';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { ServiceOrderModal } from './ServiceOrderModal';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const columns = [
  { id: 'open', title: 'Aberta' },
  { id: 'in_progress', title: 'Em andamento' },
  { id: 'waiting_approval', title: 'Aguardando aprovação' },
  { id: 'completed', title: 'Concluída' },
];

export function KanbanBoard() {
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () => mockData.getServiceOrders(),
  });

  const handleOpenModal = (order: ServiceOrder | null = null) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeOrder = serviceOrders.find(order => order.id === active.id);
    const overColumn = over.id as ServiceOrderStatus;

    if (activeOrder && activeOrder.status !== overColumn) {
      try {
        // Otimistic update
        queryClient.setQueryData(['service-orders'], (old: ServiceOrder[]) =>
          old.map(order =>
            order.id === activeOrder.id
              ? { ...order, status: overColumn }
              : order
          )
        );

        // Update in backend
        await mockData.updateServiceOrderStatus(activeOrder.id, overColumn);
        
        toast.success('Status atualizado com sucesso!');
      } catch (error) {
        // Rollback on error
        queryClient.invalidateQueries(['service-orders']);
        toast.error('Erro ao atualizar status');
      }
    }
  };

  const getColumnOrders = (status: ServiceOrderStatus) => {
    return serviceOrders.filter(order => order.status === status);
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Quadro Kanban</h2>
          <div className="flex items-center space-x-2">
            {columns.map(column => (
              <div
                key={column.id}
                className="flex items-center space-x-1 text-sm text-gray-500"
              >
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>{getColumnOrders(column.id as ServiceOrderStatus).length}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova OS
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id as ServiceOrderStatus}
              title={column.title}
              orders={getColumnOrders(column.id as ServiceOrderStatus)}
              onOrderClick={handleOpenModal}
            />
          ))}
        </div>
      </DndContext>

      <ServiceOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceOrder={selectedOrder}
      />
    </div>
  );
}