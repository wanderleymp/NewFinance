import React, { useState } from 'react';
import { ArrowDownUp, Edit2 } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useMovementStatuses } from './hooks/useMovementStatuses';
import { columns } from './columns';
import { renderMovementStatusCard } from './renderCard';
import { MovementStatusForm } from './MovementStatusForm';
import { MovementStatus } from '../../types/movement-status';

export const MovementStatusList: React.FC = () => {
  const {
    movementStatuses,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleActiveFilterChange,
    loadData,
  } = useMovementStatuses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MovementStatus | null>(null);

  const handleEdit = (status: MovementStatus) => {
    setSelectedStatus(status);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStatus(null);
  };

  const renderCustomActions = (status: MovementStatus) => (
    <button
      onClick={() => handleEdit(status)}
      className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
      title="Editar"
    >
      <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
    </button>
  );

  const metricsData = [
    {
      title: 'Total de Status',
      value: pagination.totalItems,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
    }
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ArrowDownUp className="w-4 h-4" />
            <span>Novo Status</span>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleActiveFilterChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => handleActiveFilterChange('true')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'true'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => handleActiveFilterChange('false')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'false'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Inativos
          </button>
        </div>

        <CRUDBase
          title="Status de Movimento"
          subtitle="Gerencie os status de movimento do sistema"
          data={movementStatuses}
          columns={columns}
          renderCard={renderMovementStatusCard}
          metrics={metricsData}
          onToggleStatus={handleToggleStatus}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          renderCustomActions={renderCustomActions}
        />
      </div>

      <MovementStatusForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={() => {
          loadData(1);
          handleCloseForm();
        }}
        movementStatus={selectedStatus}
      />
    </>
  );
};