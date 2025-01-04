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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarIcon 
} from '@mui/icons-material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, formatISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { installmentsService } from '../services/api';
import { useSnackbar } from 'notistack';

export default function Installments() {
  const [installments, setInstallments] = useState({ items: [], meta: {} });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('Pendente');
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const loadInstallments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        start_date: startDate ? formatISO(startDate, { representation: 'date' }) : undefined,
        end_date: endDate ? formatISO(endDate, { representation: 'date' }) : undefined,
        status: status || undefined,
      };

      const data = await installmentsService.list(params);
      setInstallments(data);
    } catch (error) {
      console.error('Error loading installments:', error);
      enqueueSnackbar('Erro ao carregar contas a receber', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstallments();
  }, [page, rowsPerPage, startDate, endDate, status]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderBoletoStatus = (status) => {
    const statusColors = {
      'A_RECEBER': 'blue',
      'EXPIRADO': 'red',
    };
    return <span style={{ color: statusColors[status] || 'black' }}>{status}</span>;
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Contas a Receber
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
          <DesktopDatePicker
            label="Data Inicial"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DesktopDatePicker
            label="Data Final"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Parcela</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Boletos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {installments.items.map((installment) => (
              <TableRow key={installment.installment_id}>
                <TableCell>{installment.installment_id}</TableCell>
                <TableCell>{installment.full_name}</TableCell>
                <TableCell>{format(new Date(installment.due_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>R$ {installment.amount}</TableCell>
                <TableCell>{installment.status}</TableCell>
                <TableCell>
                  {installment.boletos.map((boleto) => (
                    <div key={boleto.boleto_id}>
                      {renderBoletoStatus(boleto.status)} - {boleto.boleto_number}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={installments.meta.totalItems || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
