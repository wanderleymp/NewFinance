import React, { useState } from 'react';
import { ArrowDownUp, Edit2 } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useMovementTypes } from './hooks/useMovementTypes';
import { columns } from './columns';
import { renderMovementTypeCard } from './renderCard';
import { MovementTypeForm } from './MovementTypeForm';
import { MovementType } from '../../types/movement-type';

export const MovementTypeList: React.FC = () => {
  const {
    movementTypes,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleDelete,
    loadData,
  } = useMovementTypes();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | null>(null);

  const handleEdit = (movementType: MovementType) => {
    setSelectedMovementType(movementType);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMovementType(null);
  };

  const renderCustomActions = (movementType: MovementType) => (
    <button
      onClick={() => handleEdit(movementType)}
      className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
      title="Editar"
    >
      <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
    </button>
  );

  const metricsData = [
    {
      title: 'Total de Tipos',
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
            <span>Novo Tipo de Movimento</span>
          </button>
        </div>

        <CRUDBase
          title="Tipos de Movimento"
          subtitle="Gerencie os tipos de movimento do sistema"
          data={movementTypes}
          columns={columns}
          renderCard={renderMovementTypeCard}
          metrics={metricsData}
          onDelete={handleDelete}
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

      <MovementTypeForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={() => {
          loadData(1);
          handleCloseForm();
        }}
        movementType={selectedMovementType}
      />
    </>
  );
};