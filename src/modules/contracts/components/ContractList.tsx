import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';
import { ContractFilters } from './ContractFilters';
import { ContractCard } from './ContractCard';
import { ContractTable } from './ContractTable';
import { LayoutList, LayoutGrid } from 'lucide-react';
import { EditContractModal } from './EditContractModal';
import ReactDOM from 'react-dom';

export function ContractList() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => mockData.contracts,
  });

  const handleEdit = (contract: Contract) => {
    console.warn('🖊️ EDIT INICIADO:', contract);
    setEditingContract(contract);
  };

  const handleEditClose = () => {
    console.warn('🔙 EDIT FECHADO');
    setEditingContract(null);
  };

  const handleEditSubmit = (data: Partial<Contract>) => {
    console.warn('💾 EDIT SUBMETIDO:', data);
    handleEditClose();
  };

  // Renderização do modal em portal para garantir sobreposição total
  const renderEditModal = () => {
    if (!editingContract) return null;

    return ReactDOM.createPortal(
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1000, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <div 
          style={{ 
            width: '90%', 
            maxWidth: '600px', 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px' 
          }}
        >
          <EditContractModal
            isOpen={true}
            onClose={handleEditClose}
            onSubmit={handleEditSubmit}
            contract={editingContract}
          />
        </div>
      </div>,
      document.body
    );
  };

  useEffect(() => {
    console.group('🔍 ContractList - Estado Atual');
    console.log('Modo de Visualização:', viewMode);
    console.log('Contrato em Edição:', editingContract?.id);
    console.log('Total de Contratos:', contracts.length);
    console.groupEnd();
  }, [viewMode, editingContract, contracts]);

  // Log de renderização
  console.log('🌟 ContractList Renderizando - Editando:', !!editingContract);

  return (
    <>
      <div className="space-y-6">
        <ContractFilters
          onFilterChange={() => {}}
          metrics={{
            totalContracts: contracts.length,
            totalBilled: 0,
            totalPending: 0,
            averagePayment: 0,
          }}
          onNewContract={() => {}}
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
                onEdit={() => handleEdit(contract)}
              />
            ))}
          </div>
        ) : (
          <ContractTable
            contracts={contracts}
            onEdit={handleEdit}
          />
        )}
      </div>

      {renderEditModal()}
    </>
  );
}