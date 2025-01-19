import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button 
} from '@mui/material';
import { 
  Close as CloseIcon,
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
import { Contract } from '../types/contract';
import { ContractSummary } from '../components/ContractSummary';
import { BillingAdjustmentsTab } from './BillingAdjustmentsTab';
import { ContractAdjustmentsTab } from './ContractAdjustmentsTab';
import { BillingsTab } from './BillingsTab';
import { ServiceModal } from './ServiceModal';
import { ModificationModal } from './ModificationModal';
import { BillingConfirmationModal } from './BillingConfirmationModal';

interface ContractDetailsProps {
  contract: Contract;
  onClose: () => void;
}

export function ContractDetails({ 
  contract, 
  onClose 
}: ContractDetailsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'adjustments' | 'contract-adjustments' | 'billings'>('summary');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isModificationModalOpen, setIsModificationModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleBillContract = async () => {
    try {
      console.log('🚨 Iniciando faturamento do contrato');
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

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'summary':
        return (
          <ContractSummary 
            contract={contract} 
            onAddModification={() => setIsModificationModalOpen(true)} 
          />
        );
      case 'adjustments':
        return <BillingAdjustmentsTab contract={contract} />;
      case 'contract-adjustments':
        return <ContractAdjustmentsTab contract={contract} />;
      case 'billings':
        return <BillingsTab contract={contract} />;
      default:
        return null;
    }
  };

  const handleClose = () => {
    console.log('🚪 Fechando detalhes do contrato');
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1200, 
      margin: 'auto', 
      position: 'relative' 
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        position: 'relative'
      }}>
        <Typography variant="h4" color="primary">
          Detalhes do Contrato
        </Typography>
        <IconButton 
          onClick={handleClose} 
          aria-label="Fechar"
          sx={{
            position: 'absolute',
            right: 0,
            top: -10
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

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
            border: 'none',
            cursor: canBill ? 'pointer' : 'not-allowed',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          Faturar
        </button>
      </div>

      <Box mt={3}>
        {renderActiveTab()}
      </Box>

      {isServiceModalOpen && (
        <ServiceModal 
          open={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          contract={contract}
        />
      )}

      {isModificationModalOpen && (
        <ModificationModal 
          open={isModificationModalOpen}
          onClose={() => setIsModificationModalOpen(false)}
          contract={contract}
        />
      )}

      {isConfirmationOpen && (
        <BillingConfirmationModal 
          open={isConfirmationOpen} 
          onClose={() => {
            console.log('🔒 Fechando modal de confirmação de faturamento');
            setIsConfirmationOpen(false);
          }}
          onConfirm={handleBillContract}
          contractName={contract.contract_name}
          billingValue={contract.contract_value}
        />
      )}
    </Box>
  );
}