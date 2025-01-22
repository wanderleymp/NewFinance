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
    fullName: '',
    value: 0,
    status: 'ATIVO',
    groupName: ''
  });

  const handleOpenCreateModal = () => {
    setSelectedContract(null);
    setContractForm({
      name: '',
      fullName: '',
      value: 0,
      status: 'ATIVO',
      groupName: ''
    });
    setOpenModal(true);
  };

  const handleOpenEditModal = (contract: Contract) => {
    setSelectedContract(contract);
    setContractForm({
      name: contract.name,
      fullName: contract.fullName,
      value: contract.value,
      status: contract.status,
      groupName: contract.groupName
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const contractData: Partial<Contract> = {
        ...contractForm,
        value: typeof contractForm.value === 'string' 
          ? parseFloat(contractForm.value.replace(/[^\d,]/g, '').replace(',', '.')) 
          : contractForm.value
      };

      if (!ContractValidator.validate(contractData)) {
        throw new Error('Dados do contrato inválidos');
      }

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
    const statusConfig: { [key: string]: { color: 'success' | 'warning' | 'error' | 'default', label: string } } = {
      'ATIVO': { color: 'success', label: 'Ativo' },
      'PENDENTE': { color: 'warning', label: 'Pendente' },
      'CANCELADO': { color: 'error', label: 'Cancelado' },
      'SUSPENSO': { color: 'warning', label: 'Suspenso' }
    };

    const config = statusConfig[status?.toUpperCase()] || { color: 'default', label: status };

    return (
      <Chip 
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  }, []);

  const formatCurrency = useCallback((value: number | string | undefined) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) 
      : value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue || 0);
  }, []);

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
                <TableCell>Nome do Contrato</TableCell>
                <TableCell>Nome Completo</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="center">Situação</TableCell>
                <TableCell>Grupo</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>{contract.fullName}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(contract.value)}
                  </TableCell>
                  <TableCell align="center">
                    {renderStatusChip(contract.status)}
                  </TableCell>
                  <TableCell>{contract.groupName}</TableCell>
                  <TableCell align="center">
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
                        onClick={() => handleDelete(contract.id.toString())}
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
                  helperText={!contractForm.name ? 'Nome do Contrato é obrigatório' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nome Completo"
                  fullWidth
                  value={contractForm.fullName || ''}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    fullName: e.target.value
                  }))}
                  required
                  error={!contractForm.fullName}
                  helperText={!contractForm.fullName ? 'Nome Completo é obrigatório' : ''}
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
                  value={contractForm.status || 'ATIVO'}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    status: e.target.value
                  }))}
                >
                  <MenuItem value="ATIVO">Ativo</MenuItem>
                  <MenuItem value="PENDENTE">Pendente</MenuItem>
                  <MenuItem value="CANCELADO">Cancelado</MenuItem>
                  <MenuItem value="SUSPENSO">Suspenso</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Grupo"
                  fullWidth
                  value={contractForm.groupName || ''}
                  onChange={(e) => setContractForm(prev => ({
                    ...prev, 
                    groupName: e.target.value
                  }))}
                  required
                  error={!contractForm.groupName}
                  helperText={!contractForm.groupName ? 'Grupo é obrigatório' : ''}
                />
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
                !contractForm.fullName || 
                !contractForm.value || 
                contractForm.value <= 0 || 
                !contractForm.groupName
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
