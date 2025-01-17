import React, { useState } from 'react';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import { Edit2, Trash2, Eye, Plus, ArrowUpDown, Receipt, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { BillingConfirmationModal } from './BillingConfirmationModal';
import { mockData } from '../lib/mockData';

interface ContractCardProps {
  contract: Contract;
  onManageServices: () => void;
  onManageAdjustments: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function ContractCard({ 
  contract, 
  onManageServices, 
  onManageAdjustments,
  onEdit,
  onDelete,
  onView 
}: ContractCardProps) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleBillContract = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Faturamento realizado com sucesso!');
      setIsConfirmationOpen(false);
    } catch (error) {
      toast.error('Erro ao realizar faturamento. Tente novamente.');
    }
  };

  const canBill = contract.status === 'ativo';
  const person = mockData.people.find(p => p.id === contract.personId);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <span>{person?.name || 'N/A'}</span>
              </div>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                contract.status === 'ativo'
                  ? 'bg-green-100 text-green-800'
                  : contract.status === 'inativo'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {contract.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Valor Atual:</span>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(contract.currentValue)}
            </p>
            <p>
              <span className="font-medium">Próximo Faturamento:</span>{' '}
              {format(new Date(contract.nextBillingDate), 'dd/MM/yyyy')}
            </p>
            <p>
              <span className="font-medium">Grupo:</span> {contract.group}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onManageServices}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4 mr-1 flex-shrink-0" />
                  Serviços
                </button>
                <button
                  onClick={onManageAdjustments}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded hover:bg-indigo-50"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1 flex-shrink-0" />
                  Ajustes
                </button>
                <button
                  onClick={() => canBill && setIsConfirmationOpen(true)}
                  disabled={!canBill}
                  className={`inline-flex items-center text-sm px-2 py-1 rounded ${
                    canBill
                      ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={canBill ? 'Faturar Contrato' : 'Contrato não pode ser faturado'}
                >
                  <Receipt className="w-4 h-4 mr-1 flex-shrink-0" />
                  Faturar
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onView}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Visualizar"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={onEdit}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={onDelete}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BillingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleBillContract}
        contract={contract}
      />
    </>
  );
}