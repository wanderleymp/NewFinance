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
  Add as AddIcon,
  Business as CompanyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as AddressIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Contract, ContractModification } from '../types/contract';
import { mockData } from '../services/mockData';

interface ContractSummaryProps {
  contract: Contract;
  onAddModification: () => void;
}

export function ContractSummary({ contract, onAddModification }: ContractSummaryProps) {
  const formatCurrency = (value: string | number | null | undefined) => {
    try {
      if (value === null || value === undefined) return 'R$ 0,00';
      
      const numericValue = typeof value === 'string' 
        ? parseFloat(value) 
        : value;
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numericValue);
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return 'R$ 0,00';
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = typeof dateString === 'string' 
        ? parseISO(dateString)
        : dateString;
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Dados temporários para substituir mock
  const mockSummary = {
    baseValue: contract.contract_value ? parseFloat(contract.contract_value.toString()) : 0,
    adjustmentsTotal: 0, // Temporário
    servicesTotal: 0, // Temporário
    currentValue: contract.contract_value ? parseFloat(contract.contract_value.toString()) : 0,
    modifications: [] as ContractModification[]
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
        <Grid item xs={12} md={6} lg={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CompanyIcon color="action" fontSize="small" />
            <Typography variant="subtitle1" color="text.secondary">
              Empresa
            </Typography>
          </Box>
          <Typography variant="body1" color="primary">
            {contract.company_name || 'Não informado'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="subtitle1" color="text.secondary">
              Responsável
            </Typography>
          </Box>
          <Typography variant="body1" color="primary">
            {contract.full_name || 'Não informado'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <AddressIcon color="action" fontSize="small" />
            <Typography variant="subtitle1" color="text.secondary">
              Endereço
            </Typography>
          </Box>
          <Typography variant="body1" color="primary">
            {contract.address || 'Não informado'}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarIcon color="action" fontSize="small" />
            <Typography variant="subtitle1" color="text.secondary">
              Próximo Faturamento
            </Typography>
          </Box>
          <Typography variant="body1" color="primary">
            {formatDate(contract.next_billing_date)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Valor Base
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(mockSummary.baseValue)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Total de Ajustes
          </Typography>
          <Typography variant="h5" color={mockSummary.adjustmentsTotal >= 0 ? 'success.main' : 'error.main'}>
            {formatCurrency(mockSummary.adjustmentsTotal)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Valor Atual
          </Typography>
          <Typography variant="h5" color="primary">
            {formatCurrency(mockSummary.currentValue)}
          </Typography>
        </Grid>
      </Grid>

      {mockSummary.modifications.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Modificações Recentes
          </Typography>
          {mockSummary.modifications.map((modification) => (
            <Box 
              key={modification.id} 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              mb={1}
            >
              <Box display="flex" alignItems="center">
                <IconButton size="small" sx={{ mr: 2 }}>
                  {modification.modificationType === 'DESCONTO' ? 
                    <TrendingDownIcon color="error" /> : 
                    <TrendingUpIcon color="success" />
                  }
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
        </>
      )}
    </Paper>
  );
}