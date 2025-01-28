import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Checkbox
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useParams, useLocation } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from '@mui/material/utils';

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
  billings: {
    id: number;
    date: string;
    amount: number;
  }[];
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
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [totals, setTotals] = useState({
    totalContracts: 0,
    totalAmount: 0,
    pendingMonth: 0
  });
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  // Função para lidar com a busca
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchPendingBillings(1, value);
    }, 500),
    []
  );

  // Atualiza a busca quando o termo muda
  useEffect(() => {
    debouncedSearch(searchTerm);
    // Cleanup function para cancelar o debounce quando o componente for desmontado
    return () => {
      debouncedSearch.clear();
    };
  }, [searchTerm, debouncedSearch]);

  // Função para verificar se um contrato está pendente para o mês atual
  const isPendingThisMonth = (nextBillingDate: string) => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const nextBilling = new Date(nextBillingDate);
    return nextBilling <= lastDayOfMonth && 
           nextBilling.getMonth() === today.getMonth() && 
           nextBilling.getFullYear() === today.getFullYear();
  };

  const fetchPendingBillings = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      console.log('🔍 Buscando faturas', {
        contractId,
        billingId,
        page,
        limit: pagination.limit,
        search
      });

      const response = contractId 
        ? await contractService.getPendingBillings(page, pagination.limit, contractId, search)
        : await contractService.getPendingBillings(page, pagination.limit, undefined, search);

      // Log para debug
      console.log('📋 Estrutura detalhada da primeira fatura:', 
        JSON.stringify(response.items[0], null, 2)
      );
      
      // Mapeia os dados corretamente
      const mappedBillings = response.items.map(item => ({
        ...item
      }));
      
      console.log('Faturas mapeadas:', mappedBillings);
      
      // Calcula os totais
      const pendingMonth = mappedBillings.filter(
        billing => billing.status === 'pending' && isPendingThisMonth(billing.next_billing_date)
      ).length;

      setTotals({
        totalContracts: response.meta?.totalItems || 0,
        totalAmount: mappedBillings.reduce((sum, billing) => sum + billing.contract_value, 0),
        pendingMonth
      });
      
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

  // Função para selecionar/deselecionar todos os contratos
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedContracts(billings.map(billing => billing.id));
    } else {
      setSelectedContracts([]);
    }
  };

  // Função para selecionar/deselecionar um contrato
  const handleSelectContract = (contractId: number) => {
    setSelectedContracts(prev => {
      if (prev.includes(contractId)) {
        return prev.filter(id => id !== contractId);
      } else {
        return [...prev, contractId];
      }
    });
  };

  // Função para processar múltiplos contratos
  const handleProcessSelected = async () => {
    try {
      setLoading(true);
      // Adiciona todos os IDs ao estado de processamento
      setProcessingIds(prev => [...prev, ...selectedContracts.map(String)]);

      // Processa todos os contratos selecionados de uma vez
      await contractService.processBulkBilling(selectedContracts);
      
      // Notifica sucesso
      enqueueSnackbar(`${selectedContracts.length} contratos processados com sucesso`, { 
        variant: 'success' 
      });

      // Limpa a seleção e atualiza a lista
      setSelectedContracts([]);
      await fetchPendingBillings(pagination.page);
    } catch (error) {
      console.error('Erro ao processar contratos:', error);
      enqueueSnackbar('Erro ao processar contratos em lote', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
      setProcessingIds([]);
    }
  };

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Faturamento de Contratos
      </Typography>

      {/* Campo de Busca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por cliente, número do contrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Botão para processar selecionados */}
      {selectedContracts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcessSelected}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Processar {selectedContracts.length} Contratos Selecionados
          </Button>
        </Box>
      )}

      {/* Card de Resumo */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6">Total de Contratos</Typography>
            <Typography variant="h4">{totals.totalContracts}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6">Valor Total</Typography>
            <Typography variant="h4">
              {totals.totalAmount.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6">Pendentes do Mês</Typography>
            <Typography variant="h4">{totals.pendingMonth}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6">Página Atual</Typography>
            <Typography variant="h4">
              {billings.length} de {pagination.totalItems}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de Contratos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedContracts.length > 0 && selectedContracts.length < billings.length}
                  checked={selectedContracts.length === billings.length && billings.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell padding="checkbox" /> {/* Coluna para o botão expandir */}
              <TableCell>ID Contrato</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Próximo Faturamento</TableCell>
              <TableCell>Último Faturamento</TableCell>
              <TableCell>Valor Contrato</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billings.map((billing) => (
              <React.Fragment key={billing.id}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedContracts.includes(billing.id)}
                      onChange={() => handleSelectContract(billing.id)}
                    />
                  </TableCell>
                  <TableCell padding="checkbox">
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => setExpandedId(expandedId === billing.id ? null : billing.id)}
                    >
                      {expandedId === billing.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{billing.contract_id}</TableCell>
                  <TableCell>{billing.client_name}</TableCell>
                  <TableCell>{new Date(billing.next_billing_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {billing.last_billing_date 
                      ? new Date(billing.last_billing_date).toLocaleDateString()
                      : '-'
                    }
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
                    />
                  </TableCell>
                  <TableCell align="center">
                    {billing.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleProcessBilling(String(billing.id))}
                        disabled={processingIds.includes(String(billing.id))}
                      >
                        {processingIds.includes(String(billing.id)) ? (
                          <CircularProgress size={20} />
                        ) : (
                          'Processar'
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={expandedId === billing.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Histórico de Faturamentos
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Data</TableCell>
                              <TableCell>Valor</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {billing.billings.map((bill) => (
                              <TableRow key={bill.id}>
                                <TableCell>{bill.id}</TableCell>
                                <TableCell>
                                  {new Date(bill.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {bill.amount.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination 
          count={pagination.totalPages}
          page={pagination.page}
          onChange={(_, newPage) => fetchPendingBillings(newPage)}
          color="primary"
          showFirstButton 
          showLastButton
        />
        <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
          Total: {pagination.totalItems} registros
        </Typography>
      </Box>
    </Box>
  );
}
