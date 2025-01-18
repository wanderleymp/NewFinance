import React, { useState, useEffect } from 'react';
import { Contract } from '../types/contract';
import { ContractSummary } from '../components/ContractSummary';
import { BillingAdjustmentsTab } from './BillingAdjustmentsTab';
import { ContractAdjustmentsTab } from './ContractAdjustmentsTab';
import { BillingsTab } from './BillingsTab';
import { ServiceModal } from './ServiceModal';
import { ModificationModal } from './ModificationModal';
import { BillingConfirmationModal } from './BillingConfirmationModal';
import { 
  Receipt as ReceiptIcon, 
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  VisibilityOutlined as ViewIcon,
  BuildOutlined as ManageServicesIcon,
  SummarizeOutlined as SummaryIcon,
  SettingsOutlined as AdjustmentsIcon,
  ReceiptLongOutlined as BillingsIcon,
  BuildOutlined as ContractAdjustmentsIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Log detalhado de importação de ícones
console.log('Detalhes dos Ícones:', {
  ReceiptIcon: typeof ReceiptIcon,
  AddIcon: typeof AddIcon,
  EditIcon: typeof EditIcon,
  ViewIcon: typeof ViewIcon,
  ManageServicesIcon: typeof ManageServicesIcon,
  SummaryIcon: typeof SummaryIcon,
  AdjustmentsIcon: typeof AdjustmentsIcon,
  BillingsIcon: typeof BillingsIcon,
  ContractAdjustmentsIcon: typeof ContractAdjustmentsIcon
});

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
      console.log('🚨 Iniciando faturamento do contrato');
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Faturamento realizado com sucesso!');
      console.log('🎉 Faturamento concluído, fechando modal');
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error('❌ Erro no faturamento:', error);
      toast.error('Erro ao realizar faturamento. Tente novamente.');
    }
  };

  const canBill = contract.status === 'ativo';

  const renderDebugInfo = () => {
    console.log('🔍 Estado atual:', {
      activeTab,
      canBill,
      isConfirmationOpen: isConfirmationOpen
    });
  };

  useEffect(() => {
    renderDebugInfo();
    console.log('🌟 Estado dos Modais:', {
      isServiceModalOpen,
      isModificationModalOpen,
      isConfirmationOpen
    });
  }, [activeTab, canBill, isServiceModalOpen, isModificationModalOpen, isConfirmationOpen]);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        padding: '1rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              backgroundColor: activeTab === 'summary' ? '#3B82F6' : 'white',
              color: activeTab === 'summary' ? 'white' : '#4B5563',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: activeTab === 'summary' ? 'none' : '1px solid #E5E7EB'
            }}
          >
            <SummaryIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            Resumo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adjustments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              backgroundColor: activeTab === 'adjustments' ? '#10B981' : 'white',
              color: activeTab === 'adjustments' ? 'white' : '#4B5563',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: activeTab === 'adjustments' ? 'none' : '1px solid #E5E7EB'
            }}
          >
            <AdjustmentsIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            Ajustes Temporários
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contract-adjustments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              backgroundColor: activeTab === 'contract-adjustments' ? '#8B5CF6' : 'white',
              color: activeTab === 'contract-adjustments' ? 'white' : '#4B5563',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: activeTab === 'contract-adjustments' ? 'none' : '1px solid #E5E7EB'
            }}
          >
            <ContractAdjustmentsIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            Reajustes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              backgroundColor: activeTab === 'billings' ? '#6366F1' : 'white',
              color: activeTab === 'billings' ? 'white' : '#4B5563',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: activeTab === 'billings' ? 'none' : '1px solid #E5E7EB'
            }}
          >
            <BillingsIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            Faturamentos
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            console.log('💰 Botão Faturar clicado', { canBill });
            if (canBill) {
              console.log('🔓 Abrindo modal de confirmação');
              setIsConfirmationOpen(true);
            }
          }}
          disabled={!canBill}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            backgroundColor: canBill ? '#059669' : '#D1D5DB',
            color: canBill ? 'white' : '#6B7280',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cursor: canBill ? 'pointer' : 'not-allowed'
          }}
        >
          <ReceiptIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          Faturar
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'summary' && (
          <ContractSummary
            contract={contract}
            onAddModification={() => {
              console.log('➕ Botão Adicionar Modificação clicado');
              setIsModificationModalOpen(true);
            }}
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

      {isConfirmationOpen && (
        <BillingConfirmationModal
          open={isConfirmationOpen}
          onClose={() => {
            console.log('Fechando modal de confirmação');
            setIsConfirmationOpen(false);
          }}
          onConfirm={handleBillContract}
          contractName={contract.name}
          billingValue={contract.currentValue}
        />
      )}
    </div>
  );
}