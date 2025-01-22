import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useNewContracts } from '../hooks/useNewContracts';
import { Contract } from '../types/contract';
import { ContractValidator } from '../utils/contractValidation';

const ContractsPage: React.FC = () => {
  const { 
    contracts, 
    loading, 
    error, 
    pagination,
    changePage,
    clearError,
    createContract, 
    updateContract, 
    deleteContract,
    refetch
  } = useNewContracts();

  const [openModal, setOpenModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractForm, setContractForm] = useState<Partial<Contract>>({
    name: '',
    value: 0,
    status: 'ativo'
  });

  const handleOpenCreateModal = () => {
    setSelectedContract(null);
    setContractForm({
      name: '',
      value: 0,
      status: 'ativo'
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (contract: Contract) => {
    setSelectedContract(contract);
    setContractForm({
      name: contract.name,
      value: contract.value,
      status: contract.status
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const contractData: Partial<Contract> = {
        ...contractForm,
        value: typeof contractForm.value === 'string' 
          ? parseFloat(contractForm.value.replace(',', '.')) 
          : contractForm.value
      };

      if (selectedContract) {
        await updateContract(selectedContract.id, contractData);
      } else {
        await createContract(contractData);
      }

      setOpenModal(false);
      refetch();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      // Adicionar tratamento de erro para o usuário
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteContract(id);
      } catch (err) {
        console.error('Erro ao deletar contrato', err);
      }
    }
  };

  const renderStatusChip = useCallback((status: string) => {
    const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
      'ativo': 'success',
      'pendente': 'warning',
      'cancelado': 'error'
    };

    return status ? (
      <Chip 
        label={status} 
        color={statusColors[status.toLowerCase()] || 'default'}
        size="small"
      />
    ) : null;
  }, []);

  const formatCurrency = (value: number | string) => {
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(',', '.')) 
      : value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <Alert 
      severity="error" 
      onClose={clearError}
    >
      {error}
    </Alert>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mt: 4 
      }}>
        <Typography variant="h4" gutterBottom>
          Contratos
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Novo Contrato
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.number}</TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>
                    {formatCurrency(contract.value)}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(contract.status)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenEditModal(contract)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton 
                        color="error"
                        onClick={() => handleDelete(contract.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(_, newPage) => changePage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            // Implementar lógica de mudança de limite
          }}
        />

        {/* Modal de Criação/Edição */}
        <Dialog 
          open={openModal} 
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedContract ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nome do Contrato"
                  fullWidth
                  value={contractForm.name || ''}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    name: e.target.value
                  }))}
                  required
                  error={!contractForm.name}
                  helperText={!contractForm.name ? 'Nome é obrigatório' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Valor"
                  type="number"
                  fullWidth
                  value={contractForm.value || 0}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    value: Number(e.target.value)
                  }))}
                  required
                  inputProps={{ min: 0 }}
                  error={!contractForm.value || contractForm.value <= 0}
                  helperText={
                    !contractForm.value || contractForm.value <= 0 
                      ? 'Valor deve ser positivo' 
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={contractForm.status || 'ativo'}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    status: e.target.value
                  }))}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="encerrado">Encerrado</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button 
              color="primary" 
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !contractForm.name || 
                !contractForm.value || 
                contractForm.value <= 0
              }
            >
              {selectedContract ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ContractsPage;
