import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Divider, 
  Grid, 
  Paper, 
  Chip,
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon, 
  RequestQuote as InvoiceIcon, 
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface BillingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contractName: string;
  contractNumber?: string;
  billingValue?: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  clientName?: string;
}

export const BillingConfirmationModal: React.FC<BillingConfirmationModalProps> = ({
  open, 
  onClose, 
  onConfirm, 
  contractName, 
  contractNumber = 'N/A',
  billingValue = 0,
  contractStartDate = new Date(),
  contractEndDate = new Date(),
  clientName = 'Cliente não identificado'
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log('BillingConfirmationModal - Detalhes:', { 
      contractName, 
      contractNumber,
      billingValue,
      contractStartDate,
      contractEndDate,
      clientName
    });
  }, [contractName, contractNumber, billingValue, contractStartDate, contractEndDate, clientName]);

  // Função de segurança para formatar valor
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Função de segurança para formatar data
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Data não informada';
    return format(date, 'dd/MM/yyyy');
  };

  const renderCloseButton = () => (
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
        backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        border: isHovered ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        outline: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CloseIcon 
        style={{ 
          color: theme.palette.text.secondary, 
          width: '24px', 
          height: '24px' 
        }} 
      />
    </button>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          position: 'relative',
          borderRadius: theme.spacing(2),
          padding: theme.spacing(1)
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: theme.spacing(1), 
          right: theme.spacing(1), 
          zIndex: 10 
        }}
      >
        {renderCloseButton()}
      </Box>

      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
        <InvoiceIcon color="primary" />
        <Typography variant="h6">Confirmação de Faturamento</Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Paper 
          elevation={0} 
          sx={{ 
            backgroundColor: theme.palette.background.default, 
            padding: theme.spacing(2),
            marginBottom: theme.spacing(2)
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <MoneyIcon color="primary" />
                <Typography variant="subtitle1">Valor do Faturamento</Typography>
              </Box>
              <Typography variant="h5" color="primary">
                {formatCurrency(billingValue)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarIcon color="primary" />
                <Typography variant="subtitle1">Período do Contrato</Typography>
              </Box>
              <Typography variant="body2">
                {formatDate(contractStartDate)} - {formatDate(contractEndDate)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box display="flex" alignItems="center" gap={1} marginBottom={2}>
          <WarningIcon color="warning" />
          <Typography variant="body2" color="text.secondary">
            Confirme os detalhes do faturamento para o contrato:
          </Typography>
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Contrato:</strong> {contractName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Número:</strong> {contractNumber}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>Cliente:</strong> {clientName}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button 
          onClick={onClose} 
          color="secondary" 
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="primary" 
          variant="contained"
          startIcon={<InvoiceIcon />}
        >
          Confirmar Faturamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};
