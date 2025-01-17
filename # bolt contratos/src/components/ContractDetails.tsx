import React, { useState } from 'react';
import { Contract } from '../types/contract';
import { ContractSummary } from './ContractSummary';
import { BillingAdjustmentsTab } from './BillingAdjustmentsTab';
import { ContractAdjustmentsTab } from './ContractAdjustmentsTab';
import { BillingsTab } from './BillingsTab';
import { ServiceModal } from './ServiceModal';
import { ModificationModal } from './ModificationModal';
import { BillingConfirmationModal } from './BillingConfirmationModal';
import { Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContractDetailsProps {
  contract: Contract;
}

export function ContractDetails({ contract }: ContractDetailsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'adjustments' | 'contract-adjustments' | 'billings'>('summary');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isModificationModalOpen, setIsModificationModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleBillContract = async () => {
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Faturamento realizado com sucesso!');
      setIsConfirmationOpen(false);
    } catch (error) {
      toast.error('Erro ao realizar faturamento. Tente novamente.');
    }
  };

  const canBill = contract.status === 'ativo';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="border-b border-gray-200 flex-1">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`${
                activeTab === 'summary'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`${
                activeTab === 'adjustments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Ajustes Temporários
            </button>
            <button
              onClick={() => setActiveTab('contract-adjustments')}
              className={`${
                activeTab === 'contract-adjustments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Reajustes
            </button>
            <button
              onClick={() => setActiveTab('billings')}
              className={`${
                activeTab === 'billings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Faturamentos
            </button>
          </nav>
        </div>
        <button
          onClick={() => canBill && setIsConfirmationOpen(true)}
          disabled={!canBill}
          className={`ml-4 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
            canBill
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={canBill ? 'Faturar Contrato' : 'Contrato não pode ser faturado'}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Faturar Contrato
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'summary' && (
          <ContractSummary
            contract={contract}
            onAddModification={() => setIsModificationModalOpen(true)}
          />
        )}
        {activeTab === 'adjustments' && (
          <BillingAdjustmentsTab contract={contract} />
        )}
        {activeTab === 'contract-adjustments' && (
          <ContractAdjustmentsTab contract={contract} />
        )}
        {activeTab === 'billings' && (
          <BillingsTab contract={contract} />
        )}
      </div>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        contract={contract}
      />

      <ModificationModal
        isOpen={isModificationModalOpen}
        onClose={() => setIsModificationModalOpen(false)}
        contract={contract}
        onSubmit={(data) => {
          console.log('Nova modificação:', data);
          setIsModificationModalOpen(false);
        }}
      />

      <BillingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleBillContract}
        contract={contract}
      />
    </div>
  );
}