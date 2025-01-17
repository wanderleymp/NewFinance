import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract } from '../types/contract';
import { mockData } from '../lib/mockData';
import { format } from 'date-fns';
import { Edit2, Trash2, Eye, LayoutGrid, LayoutList, Plus } from 'lucide-react';
import { ContractCard } from './ContractCard';
import { ContractTable } from './ContractTable';
import { ServiceModal } from './ServiceModal';
import { EditContractModal } from './EditContractModal';
import { ContractDetails } from './ContractDetails';
import { ContractFilters } from './ContractFilters';

export function ContractList() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => mockData.getContracts(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['billing-metrics'],
    queryFn: () => mockData.getBillingMetrics(),
  });

  const handleFilterChange = (filters: any) => {
    console.log('Applied filters:', filters);
    // Here you would typically update the contracts query with the new filters
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (data: Partial<Contract>) => {
    console.log('Contrato atualizado:', data);
    setIsEditModalOpen(false);
    setSelectedContract(null);
  };

  const handleDelete = (contract: Contract) => {
    console.log('Excluir contrato:', contract);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
  };

  const handleManageServices = (contract: Contract) => {
    setSelectedContract(contract);
    setIsServiceModalOpen(true);
  };

  const handleManageAdjustments = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <ContractFilters
        onFilterChange={handleFilterChange}
        metrics={metrics || {
          totalContracts: 0,
          totalBilled: 0,
          totalPending: 0,
          averagePayment: 0,
        }}
      />

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setViewMode('table')}
          className={`p-2 rounded-md ${
            viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutList className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`p-2 rounded-md ${
            viewMode === 'cards' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onManageServices={() => handleManageServices(contract)}
              onManageAdjustments={() => handleManageAdjustments(contract)}
              onEdit={() => handleEdit(contract)}
              onDelete={() => handleDelete(contract)}
              onView={() => handleView(contract)}
            />
          ))}
        </div>
      ) : (
        <ContractTable
          contracts={contracts}
          onManageServices={handleManageServices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {selectedContract && (
        <>
          <ServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => {
              setIsServiceModalOpen(false);
              setSelectedContract(null);
            }}
            contract={selectedContract}
          />

          <EditContractModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedContract(null);
            }}
            onSubmit={handleEditSubmit}
            contract={selectedContract}
          />

          {isDetailsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
              <div className="bg-white rounded-lg w-full max-w-6xl mx-4 h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <ContractDetails contract={selectedContract} />
                </div>
                <div className="sticky bottom-0 bg-white p-4 border-t">
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      setSelectedContract(null);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}