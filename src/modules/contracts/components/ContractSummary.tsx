import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingDown as TrendingDownIcon, 
  TrendingUp as TrendingUpIcon, 
  Inventory as PackageIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Contract, ContractModification } from '../types/contract';
import { mockData } from '../services/mockData';
import { format } from 'date-fns';

interface ContractSummaryProps {
  contract: Contract;
  onAddModification: () => void;
}

export function ContractSummary({ contract, onAddModification }: ContractSummaryProps) {
  const { data: summary } = useQuery({
    queryKey: ['contract-summary', contract.id],
    queryFn: () => Promise.resolve(mockData.getContractSummary(contract.id)),
  });

  if (!summary) return null;

  const getModificationIcon = (type: ContractModification['modificationType']) => {
    switch (type) {
      case 'DESCONTO':
        return <TrendingDownIcon color="error" />;
      case 'ACRESCIMO':
        return <TrendingUpIcon color="success" />;
      case 'SERVICO_ADD':
      case 'SERVICO_REMOVE':
        return <PackageIcon color="primary" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" color="primary">
          Resumo do Contrato
        </Typography>
        <Tooltip title="Nova Modificação">
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAddModification}
          >
            Nova Modificação
          </Button>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Valor Base
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(summary.baseValue)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Total de Ajustes
          </Typography>
          <Typography variant="h5" color={summary.adjustmentsTotal >= 0 ? 'success' : 'error'}>
            {formatCurrency(summary.adjustmentsTotal)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Total de Serviços
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(summary.servicesTotal)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Valor Atual
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(summary.currentValue)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Modificações Recentes
      </Typography>
      {summary.modifications.map((modification) => (
        <Box 
          key={modification.id} 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          mb={1}
        >
          <Box display="flex" alignItems="center">
            <IconButton size="small" sx={{ mr: 2 }}>
              {getModificationIcon(modification.modificationType)}
            </IconButton>
            <Typography variant="body2">
              {modification.description}
            </Typography>
          </Box>
          <Typography variant="body2" color={modification.value > 0 ? 'success.main' : 'error.main'}>
            {formatCurrency(modification.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}