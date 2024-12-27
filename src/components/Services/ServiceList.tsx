import React, { useState } from 'react';
import { Package2, Edit2 } from 'lucide-react';
import { CRUDBase } from '../CRUDBase';
import { useServices } from './hooks/useServices';
import { columns } from './columns';
import { renderServiceCard } from './renderCard';
import { ServiceForm } from './ServiceForm';
import { Service } from '../../types/service';

export const ServiceList: React.FC = () => {
  const {
    services,
    isLoading,
    viewMode,
    searchTerm,
    pagination,
    metrics,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleViewModeChange,
    handleToggleStatus,
    handleDelete,
    handleActiveFilterChange,
    loadData,
  } = useServices();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  const renderCustomActions = (service: Service) => (
    <button
      onClick={() => handleEdit(service)}
      className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
      title="Editar"
    >
      <Edit2 className="w-4 h-4 text-orange-500 group-hover:text-orange-600" />
    </button>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Package2 className="w-4 h-4" />
            <span>Novo Serviço</span>
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
          title="Serviços"
          subtitle="Gerencie os serviços do sistema"
          data={services}
          columns={columns}
          renderCard={renderServiceCard}
          metrics={metrics}
          onDelete={handleDelete}
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

      <ServiceForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={() => {
          loadData(1);
          handleCloseForm();
        }}
        service={selectedService}
      />
    </>
  );
};