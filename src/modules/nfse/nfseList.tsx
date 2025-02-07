import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useSnackbar } from 'notistack';
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
  IconButton, 
  Tooltip, 
  Chip,
  TablePagination,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Description as XmlIcon
} from '@mui/icons-material';
import { nfseService } from './nfseService';
import { Nfse, NfseListParams } from './nfseTypes';
import { format } from 'date-fns';

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

const NfseList = () => {
  // Usando o contexto do Dashboard
  const context = useOutletContext();
  console.log('NfseList - Context:', context);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [nfses, setNfses] = useState<Nfse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  console.log(' NfseList: Componente renderizado');

  const fetchNfses = useCallback(async () => {
    console.log('🔍 NfseList: Iniciando busca de NFSes');
    try {
      setLoading(true);
      setError(null);

      const params: NfseListParams = {
        page: page + 1,
        limit: rowsPerPage
      };

      console.log('🔍 NfseList: Parâmetros da busca:', params);

      const response = await nfseService.listNfse(params);
      
      console.log('🔍 NfseList: Resposta da API:', response);
      
      if (response?.items) {
        console.log('🎉 NfseList: Items encontrados:', response.items.length);
        setNfses(response.items);
        setTotalItems(response.meta?.totalItems || 0);
      } else {
        console.warn('⚠️ NfseList: Resposta da API não contém items');
        setNfses([]);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('❌ NfseList: Erro ao buscar NFSes:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao carregar NFSes. Tente novamente.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    console.log(' NfseList: Efeito de busca de NFSes disparado');
    fetchNfses();
  }, [fetchNfses]);

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(' NfseList: Mudança de página:', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(' NfseList: Mudança de linhas por página:', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const renderNfseActions = (nfse: Nfse) => (
    <Box display="flex" justifyContent="center">
      <Tooltip title="Visualizar PDF">
        <IconButton 
          size="small" 
          color="primary" 
          onClick={() => window.open(nfse.pdfUrl, '_blank')}
        >
          <PdfIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Visualizar XML">
        <IconButton 
          size="small" 
          color="secondary" 
          onClick={() => window.open(nfse.xmlUrl, '_blank')}
        >
          <XmlIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Notas Fiscais de Serviço
          </Typography>
        </Box>
      {nfses.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6">Nenhuma NFSe encontrada</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
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
                      {renderNfseActions(nfse)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
    </Box>
  );
};

export default NfseList;
