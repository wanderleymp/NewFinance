import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { nfseService } from './nfseService';
import { FiRefreshCw, FiDownload, FiFileText } from 'react-icons/fi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Paper } from '@mui/material';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

const formatarData = (data) => {
  return data ? new Date(data).toLocaleDateString('pt-BR') : '-';
};

const NewNfseList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [nfses, setNfses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchNfses = async (currentPage) => {
    try {
      setLoading(true);
      const response = await nfseService.listNfse({
        page: currentPage,
        limit
      });
      setNfses(response.items || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / limit));
    } catch (error) {
      console.error('Erro ao buscar NFSes:', error);
      setError('Erro ao buscar NFSes');
      enqueueSnackbar('Erro ao buscar NFSes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async (nfseId) => {
    try {
      setLoadingActions(prev => ({ ...prev, [nfseId]: true }));
      await nfseService.atualizarStatus(nfseId);
      await fetchNfses(page);
      enqueueSnackbar('Status atualizado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      enqueueSnackbar('Erro ao atualizar status', { variant: 'error' });
    } finally {
      setLoadingActions(prev => ({ ...prev, [nfseId]: false }));
    }
  };

  const handleRecuperarPdf = async (nfseId) => {
    try {
      setLoadingActions(prev => ({ ...prev, [`pdf-${nfseId}`]: true }));
      await nfseService.recuperarPdf(nfseId);
      await fetchNfses(page);
      enqueueSnackbar('PDF recuperado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao recuperar PDF:', error);
      enqueueSnackbar('Erro ao recuperar PDF', { variant: 'error' });
    } finally {
      setLoadingActions(prev => ({ ...prev, [`pdf-${nfseId}`]: false }));
    }
  };

  useEffect(() => {
    fetchNfses(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">Lista de NFSe</Typography>
        <div className="text-sm text-gray-600">
          Total: {totalItems} registro{totalItems !== 1 ? 's' : ''}
        </div>
      </div>

      {nfses.length === 0 ? (
        <p className="text-gray-500 text-center">Nenhuma NFSe encontrada</p>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Nº NFSe</TableCell>
                  <TableCell>Série</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>ISS</TableCell>
                  <TableCell>Alíquota</TableCell>
                  <TableCell>Data Emissão</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nfses.map((nfse) => (
                  <TableRow key={`${nfse.nfse_id}-${nfse.invoice_id}`}>
                    <TableCell>{nfse.full_name || '-'}</TableCell>
                    <TableCell>{nfse.number || '-'}</TableCell>
                    <TableCell>{nfse.series || '-'}</TableCell>
                    <TableCell>{formatarMoeda(nfse.service_value)}</TableCell>
                    <TableCell>{formatarMoeda(nfse.iss_value)}</TableCell>
                    <TableCell>{nfse.aliquota_service ? `${nfse.aliquota_service}%` : '-'}</TableCell>
                    <TableCell>{formatarData(nfse.created_at)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${nfse.status === 'autorizada' ? 'bg-green-100 text-green-800' : nfse.status === 'erro' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}> 
                        {nfse.status ? nfse.status.charAt(0).toUpperCase() + nfse.status.slice(1) : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleAtualizarStatus(nfse.nfse_id)} disabled={loadingActions[nfse.nfse_id]} variant="contained" color="primary">
                        <FiRefreshCw />
                      </Button>
                      {nfse.pdf_url ? (
                        <a href={nfse.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="contained" color="success">
                            <FiFileText />
                          </Button>
                        </a>
                      ) : (
                        <Button onClick={() => handleRecuperarPdf(nfse.nfse_id)} disabled={loadingActions[`pdf-${nfse.nfse_id}`]} variant="contained" color="warning">
                          <FiDownload />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex justify-between items-center">
            <Button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="contained"
            >
              Anterior
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">
                Página {page} de {totalPages}
              </span>
              <span className="text-sm text-gray-400">
                ({totalItems} {totalItems === 1 ? 'registro' : 'registros'})
              </span>
            </div>
            <Button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant="contained"
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewNfseList;
