import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  Pagination,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useParams, useLocation } from 'react-router-dom';

import { contractService } from '../services/ContractService';
import Loading from '../../../components/Loading';

interface ContractBilling {
  id: number;
  contract_id: number;
  client_name: string;
  next_billing_date: string;
  last_billing_date: string;
  contract_value: number;
  status: string;
}

export default function ContractBillingPage() {
  const location = useLocation();
  const { contractId, billingId } = useParams();
  
  console.log('🚨 ContractBillingPage - Contexto de Rota', {
    pathname: location.pathname,
    contractId,
    billingId,
    search: location.search,
    state: location.state
  });

  const [billings, setBillings] = useState<ContractBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchPendingBillings = async (page = 1) => {
    try {
      setLoading(true);
      console.log('🔍 Buscando faturas', {
        contractId,
        billingId,
        page,
        limit: pagination.limit
      });

      const response = contractId 
        ? await contractService.getPendingBillings(page, pagination.limit, contractId)
        : await contractService.getPendingBillings(page, pagination.limit);

      // Log detalhado da estrutura dos dados
      console.log('📋 Estrutura detalhada da primeira fatura:', 
        JSON.stringify(response.items[0], null, 2)
      );
      
      // Mapeia os dados corretamente baseado na estrutura real
      const mappedBillings = response.items.map(item => {
        // Log para debug
        console.log('🔍 Mapeando item:', {
          id: item.id,
          contract_id: item.contract_id,
          client_name: item.client_name,
          next_billing_date: item.next_billing_date,
          last_billing_date: item.last_billing_date,
          contract_value: item.contract_value,
          status: item.status
        });

        return {
          id: item.id,
          contract_id: item.contract_id,
          client_name: item.client_name,
          next_billing_date: item.next_billing_date,
          last_billing_date: item.last_billing_date,
          contract_value: item.contract_value,
          status: item.status
        };
      });
      
      console.log('Faturas mapeadas:', mappedBillings);
      
      setBillings(mappedBillings);
      setPagination(prevState => ({
        ...prevState,
        page: response.meta?.currentPage || 1,
        totalItems: response.meta?.totalItems || 0,
        totalPages: response.meta?.totalPages || 1
      }));
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar faturas:', err);
      enqueueSnackbar('Erro ao carregar faturas', { variant: 'error' });
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBillings();
  }, []);

  const handleProcessBilling = async (billingId: string) => {
    // Adicionar ID ao estado de processamento
    setProcessingIds(prev => [...prev, billingId]);

    try {
      await contractService.processBilling(billingId);
      
      // Notificação de sucesso
      enqueueSnackbar('Fatura processada com sucesso', { variant: 'success' });
      
      // Recarregar a página atual após processar
      await fetchPendingBillings(pagination.page);
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error);
      
      // Notificação de erro
      enqueueSnackbar('Erro ao processar fatura', { variant: 'error' });
    } finally {
      // Remover ID do estado de processamento
      setProcessingIds(prev => prev.filter(id => id !== billingId));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchPendingBillings(value);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', padding: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Erro ao carregar faturas
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Box>
    );
  }

  if (billings.length === 0) {
    return (
      <Box sx={{ width: '100%', padding: 2, textAlign: 'center' }}>
        <Typography variant="h6">
          Nenhuma fatura pendente encontrada
        </Typography>
      </Box>
    );
  }

  const totalAmount = billings.reduce((sum, billing) => sum + billing.contract_value, 0);
  const pendingCount = billings.filter(billing => billing.status === 'pending').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Faturamento de Contratos
      </Typography>

      {/* Card de Resumo */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Total de Contratos</Typography>
            <Typography variant="h4">{billings.length}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Valor Total</Typography>
            <Typography variant="h4">
              {totalAmount.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Status</Typography>
            <Typography variant="h4">
              {pendingCount > 0 ? `${pendingCount} Pendentes` : 'Processado'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de Contratos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Contrato</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Próximo Faturamento</TableCell>
              <TableCell>Último Faturamento</TableCell>
              <TableCell>Valor Contrato</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billings.map((billing, index) => (
              <TableRow 
                key={`${billing.id || index}`}
                sx={{ 
                  backgroundColor: billing.status !== 'pending' 
                    ? 'rgba(0, 0, 0, 0.05)' 
                    : 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <TableCell>{billing.contract_id}</TableCell>
                <TableCell>{billing.client_name}</TableCell>
                <TableCell>
                  {billing.next_billing_date 
                    ? new Date(billing.next_billing_date).toLocaleDateString('pt-BR')
                    : 'Não definido'}
                </TableCell>
                <TableCell>
                  {billing.last_billing_date
                    ? new Date(billing.last_billing_date).toLocaleDateString('pt-BR')
                    : 'Não definido'}
                </TableCell>
                <TableCell>
                  {billing.contract_value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={billing.status === 'pending' ? 'Pendente' : 'Processado'}
                    color={billing.status === 'pending' ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleProcessBilling(billing.contract_id?.toString() || '')}
                    disabled={
                      billing.status !== 'pending' || 
                      !billing.next_billing_date || 
                      processingIds.includes(billing.contract_id?.toString() || '')
                    }
                    startIcon={
                      processingIds.includes(billing.contract_id?.toString() || '') 
                        ? <CircularProgress size={20} /> 
                        : null
                    }
                    size="small"
                  >
                    {processingIds.includes(billing.contract_id?.toString() || '') 
                      ? 'Processando...' 
                      : !billing.next_billing_date
                        ? 'Sem data'
                        : 'Processar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination 
          count={Number(pagination.totalPages) || 0}
          page={Number(pagination.page) || 1}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}
