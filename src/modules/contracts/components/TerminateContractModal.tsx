import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Contract } from '../types/contract';

interface TerminateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { endDate: string; reason: string }) => Promise<void>;
  contract: Contract | null;
  isProcessing: boolean;
}

export const TerminateContractModal: React.FC<TerminateContractModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contract,
  isProcessing
}) => {
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<{
    endDate?: string;
    reason?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { endDate?: string; reason?: string } = {};
    
    if (!endDate) {
      newErrors.endDate = 'A data de encerramento é obrigatória';
    }
    
    if (!reason.trim()) {
      newErrors.reason = 'O motivo do encerramento é obrigatório';
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'O motivo deve ter pelo menos 5 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const formattedDate = endDate ? endDate.toISOString().split('T')[0] : '';
    
    await onConfirm({
      endDate: formattedDate,
      reason: reason.trim()
    });
  };

  const handleClose = () => {
    // Limpar o formulário ao fechar
    setEndDate(new Date());
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={isProcessing ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Encerrar Contrato
      </DialogTitle>
      <DialogContent>
        {contract && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {contract.fullName || contract.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {contract.id} • Valor: {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(Number(contract.value || contract.contract_value || 0))}
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Informe a data de encerramento e o motivo para encerrar este contrato.
          Esta ação não pode ser desfeita.
        </Typography>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label="Data de Encerramento"
            value={endDate}
            onChange={(newValue) => {
              setEndDate(newValue);
              if (errors.endDate) {
                setErrors(prev => ({ ...prev, endDate: undefined }));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
                error: !!errors.endDate,
                helperText: errors.endDate
              }
            }}
          />
        </LocalizationProvider>
        
        <TextField
          label="Motivo do Encerramento"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errors.reason && e.target.value.trim().length >= 5) {
              setErrors(prev => ({ ...prev, reason: undefined }));
            }
          }}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          error={!!errors.reason}
          helperText={errors.reason}
          disabled={isProcessing}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="error" 
          variant="contained"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
        >
          {isProcessing ? 'Encerrando...' : 'Encerrar Contrato'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
