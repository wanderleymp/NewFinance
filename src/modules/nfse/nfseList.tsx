import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { nfseService } from './nfseService';
import { Nfse } from './nfseTypes';
import { format } from 'date-fns';

const NfseList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [nfses, setNfses] = useState<Nfse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchNfses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: page + 1, limit: rowsPerPage };
      console.log('🔍 NfseList: Parâmetros da requisição:', params);
      const response = await nfseService.listNfse(params);
      console.log('🔍 NfseList: Resposta da API:', response);
      console.log('🔍 NfseList: Itens da resposta:', response.items);
      console.log('🔍 NfseList: Total de itens:', response.meta.totalItems);
      setNfses(response.items);
      setTotalItems(response.meta.totalItems);
    } catch (error) {
      console.error('🔍 NfseList: Erro ao buscar NFSes:', error);
      setError('Erro ao buscar NFSes');
      enqueueSnackbar('Erro ao buscar NFSes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    fetchNfses();
  }, [fetchNfses]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Lista de NFSe</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID NFSe</TableCell>
              <TableCell>ID Fatura</TableCell>
              <TableCell>Valor do Serviço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nfses.map((nfse) => (
              <TableRow key={nfse.nfseId}>
                <TableCell>{nfse.nfseId}</TableCell>
                <TableCell>{nfse.invoiceId}</TableCell>
                <TableCell>
                  {nfse.serviceValue.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={nfse.invoice.status} 
                    size="small" 
                    color={getStatusColor(nfse.invoice.status)} 
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(nfse.createdAt), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Button variant="contained">Editar</Button>
                  <Button variant="contained" color="secondary">Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'emitida':
      return 'success';
    case 'pendente':
      return 'warning';
    case 'cancelada':
      return 'error';
    default:
      return 'default';
  }
};

export default NfseList;
