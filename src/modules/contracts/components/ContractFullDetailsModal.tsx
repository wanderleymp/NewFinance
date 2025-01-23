import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  History as HistoryIcon,
  LocalOffer as ServiceIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import { contractsApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';

interface ContractFullDetailsModalProps {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
}

function TabPanel(props: { 
  children?: React.ReactNode; 
  index: number; 
  value: number 
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-details-tabpanel-${index}`}
      aria-labelledby={`contract-details-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function ContractFullDetailsModal({ 
  open, 
  onClose, 
  contract 
}: ContractFullDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Buscar dados complementares do contrato
  const { 
    data: contractDetails, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['contractDetails', contract?.id],
    queryFn: async () => {
      if (!contract?.id) return null;
      
      try {
        const [
          billings,
          services,
          adjustments,
          history
        ] = await Promise.all([
          contractsApi.getBilling(contract.id),
          contractsApi.getExtraServices(contract.id),
          contractsApi.getAdjustments(contract.id),
          contractsApi.getHistory(contract.id)
        ]);

        return {
          billings,
          services,
          adjustments,
          history
        };
      } catch (err) {
        console.error('Erro ao buscar detalhes do contrato', err);
        return null;
      }
    },
    enabled: open && !!contract?.id,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  if (!contract) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = () => {
    switch(contract.status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'error';
    }
  };

  const renderContractDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Nome do Contrato</Typography>
          <Typography variant="body1">{contract.name}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          <Chip 
            label={contract.status === 'active' ? 'Ativo' : 'Inativo'} 
            color={getStatusColor()} 
            size="small" 
          />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Data de Início</Typography>
          <Typography variant="body1">
            {contract.startDate ? format(new Date(contract.startDate), 'dd/MM/yyyy') : 'Não definida'}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Valor do Contrato</Typography>
          <Typography variant="body1">
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(contract.value)}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderBillings = () => {
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Erro ao carregar faturamentos</Typography>;
    
    return (
      <Typography>
        {contractDetails?.billings?.length 
          ? 'Faturamentos carregados' 
          : 'Nenhum faturamento encontrado'}
      </Typography>
    );
  };

  const renderServices = () => {
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Erro ao carregar serviços</Typography>;
    
    return (
      <Typography>
        {contractDetails?.services?.length 
          ? 'Serviços carregados' 
          : 'Nenhum serviço encontrado'}
      </Typography>
    );
  };

  const renderAdjustments = () => {
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Erro ao carregar ajustes</Typography>;
    
    return (
      <Typography>
        {contractDetails?.adjustments?.length 
          ? 'Ajustes carregados' 
          : 'Nenhum ajuste encontrado'}
      </Typography>
    );
  };

  const renderHistory = () => {
    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Erro ao carregar histórico</Typography>;
    
    return (
      <Typography>
        {contractDetails?.history?.length 
          ? 'Histórico carregado' 
          : 'Nenhum registro histórico encontrado'}
      </Typography>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalhes Completos do Contrato</Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="contract details tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<InfoIcon />} 
            label="Detalhes" 
            iconPosition="start" 
          />
          <Tab 
            icon={<ReceiptIcon />} 
            label="Faturamentos" 
            iconPosition="start" 
          />
          <Tab 
            icon={<ServiceIcon />} 
            label="Serviços" 
            iconPosition="start" 
          />
          <Tab 
            icon={<BuildIcon />} 
            label="Ajustes" 
            iconPosition="start" 
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="Histórico" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      <DialogContent dividers>
        <TabPanel value={activeTab} index={0}>
          {renderContractDetails()}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderBillings()}
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          {renderServices()}
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          {renderAdjustments()}
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          {renderHistory()}
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
