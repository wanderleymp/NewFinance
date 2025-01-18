import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  IconButton, 
  Grid,
  Paper
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';

interface ContractDetailsModalProps {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export function ContractDetailsModal({ 
  open, 
  onClose, 
  contract 
}: ContractDetailsModalProps) {
  if (!contract) return null;

  const person = mockData.people.find(p => p.id === contract.personId);

  const getStatusColor = () => {
    switch(contract.status) {
      case 'ativo': return 'success';
      case 'inativo': return 'warning';
      default: return 'error';
    }
  };

  const renderDetailItem = (icon: React.ReactNode, label: string, value: string) => (
    <Grid item xs={12} sm={6}>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%' 
        }}
      >
        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2">
            {value}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalhes do Contrato</Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="div">
              {contract.name}
            </Typography>
            <Chip 
              label={contract.status} 
              color={getStatusColor()} 
              size="small" 
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {renderDetailItem(
              <PersonIcon color="action" />, 
              'Cliente', 
              person?.name || 'N/A'
            )}
            {renderDetailItem(
              <MoneyIcon color="action" />, 
              'Valor Atual', 
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(contract.currentValue)
            )}
            {renderDetailItem(
              <CalendarIcon color="action" />, 
              'Próximo Faturamento', 
              format(new Date(contract.nextBillingDate), 'dd/MM/yyyy')
            )}
            {renderDetailItem(
              <CategoryIcon color="action" />, 
              'Grupo', 
              contract.group
            )}
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Adicionais
            </Typography>
            <Grid container spacing={2}>
              {renderDetailItem(
                <DescriptionIcon color="action" />, 
                'Descrição', 
                contract.description || 'Sem descrição'
              )}
              {renderDetailItem(
                <BusinessIcon color="action" />, 
                'Empresa', 
                contract.company || 'Não especificado'
              )}
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
