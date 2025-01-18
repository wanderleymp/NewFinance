import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface BillingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contractName: string;
  billingValue?: number;
}

export const BillingConfirmationModal: React.FC<BillingConfirmationModalProps> = ({
  open, 
  onClose, 
  onConfirm, 
  contractName, 
  billingValue = 0
}) => {
  // Log para debug
  useEffect(() => {
    console.log('BillingConfirmationModal - Props:', { 
      open, 
      contractName, 
      billingValue 
    });
  }, [open, contractName, billingValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          position: 'relative',
          borderRadius: '12px'
        }
      }}
    >
      {console.log('Renderizando BillingConfirmationModal')}
      <div 
        style={{
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          zIndex: 10
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.border = '1px solid transparent';
          }}
        >
          <CloseIcon 
            style={{ 
              color: '#6B7280', 
              width: '24px', 
              height: '24px' 
            }} 
          />
        </button>
      </div>

      <DialogTitle>Confirmação de Faturamento</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deseja realmente faturar o contrato {contractName}?
          Valor do faturamento: R$ {billingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
