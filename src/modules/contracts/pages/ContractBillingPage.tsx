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
  Pagination 
} from '@mui/material';
import { contractService } from '../services/ContractService';
import Loading from '../../../components/Loading';

interface ContractBilling {
  id: number | string;
  contractNumber?: string;
  clientName: string;
  billingDate?: Date | string;
  amount: number;
  status: string;
}

export default function ContractBillingPage() {
  const [billings, setBillings] = useState<ContractBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  const fetchPendingBillings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await contractService.getPendingBillings(page, pagination.limit);
      console.log('📋 Faturas recebidas:', response);
      
      setBillings(response.items);
      setPagination(prevState => ({
        ...prevState,
        page,
        totalItems: response.meta.totalItems,
        totalPages: response.meta.totalPages
      }));
      setError(null);
    } catch (error) {
      console.error('❌ Erro ao buscar faturas pendentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBillings();
  }, []);

  const handleProcessBilling = async (billingId: string) => {
    try {
      await contractService.processBilling(billingId);
      setBillings(billings.filter(billing => billing.id !== billingId));
    } catch (error) {
      console.error('❌ Erro ao processar fatura:', error);
      // Adicionar notificação de erro para o usuário
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
    <Box sx={{ width: '100%', typography: 'body1', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Faturas Pendentes
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="billing table">
          <TableHead>
            <TableRow>
              <TableCell>Número do Contrato</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Data de Faturamento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billings.map((billing, index) => (
              <TableRow 
                key={`${billing.id}-${index}`}
                sx={{ 
                  backgroundColor: billing.status !== 'pending' 
                    ? 'rgba(0, 0, 0, 0.05)' 
                    : 'inherit' 
                }}
              >
                <TableCell>{billing.contractNumber || 'N/A'}</TableCell>
                <TableCell>{billing.clientName}</TableCell>
                <TableCell>
                  {billing.billingDate 
                    ? new Date(billing.billingDate).toLocaleDateString() 
                    : 'Data não disponível'}
                </TableCell>
                <TableCell>
                  {billing.amount
                    ? billing.amount.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })
                    : 'Valor não disponível'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleProcessBilling(billing.id.toString())}
                    disabled={billing.status !== 'pending'}
                  >
                    Processar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination 
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
      
      <Typography variant="body2" sx={{ marginTop: 1, textAlign: 'center' }}>
        Total de faturas: {pagination.totalItems}
      </Typography>
    </Box>
  );
}
