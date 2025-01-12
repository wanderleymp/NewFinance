import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
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
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';

import paymentMethodService from '../services/paymentMethodService';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const navigate = useNavigate();

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        method_name: searchQuery || undefined
      };

      const response = await paymentMethodService.getAll(params);
      setPaymentMethods(response.data);
      setTotalItems(response.meta.total);
    } catch (error) {
      toast.error('Erro ao buscar formas de pagamento');
    }
  }, [page, rowsPerPage, searchQuery]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await paymentMethodService.delete(selectedPaymentMethod.payment_method_id);
      toast.success('Forma de pagamento deletada com sucesso');
      fetchPaymentMethods();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao deletar forma de pagamento');
    }
  };

  const handleToggleActive = async (paymentMethod) => {
    try {
      await paymentMethodService.toggleActive(paymentMethod.payment_method_id);
      toast.success(`Forma de pagamento ${paymentMethod.active ? 'desativada' : 'ativada'} com sucesso`);
      fetchPaymentMethods();
    } catch (error) {
      toast.error('Erro ao alternar status da forma de pagamento');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Formas de Pagamento</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/payment-methods/new')}
        >
          Nova Forma de Pagamento
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        label="Buscar Forma de Pagamento"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Parcelas</TableCell>
              <TableCell>Primeiro Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentMethods.map((method) => (
              <TableRow key={method.payment_method_id}>
                <TableCell>{method.method_name}</TableCell>
                <TableCell>{method.description || '-'}</TableCell>
                <TableCell>{method.installment_count}</TableCell>
                <TableCell>{method.first_due_date_days} dias</TableCell>
                <TableCell>
                  {method.active ? 'Ativo' : 'Inativo'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/payment-methods/${method.payment_method_id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deletar">
                    <IconButton 
                      color="error" 
                      onClick={() => {
                        setSelectedPaymentMethod(method);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={method.active ? 'Desativar' : 'Ativar'}>
                    <IconButton 
                      color={method.active ? 'warning' : 'success'}
                      onClick={() => handleToggleActive(method)}
                    >
                      {method.active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar a forma de pagamento "${selectedPaymentMethod?.method_name}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default PaymentMethods;
