import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TablePagination,
  Chip,
  IconButton
} from '@mui/material';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Add as AddIcon, 
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { ContractCard } from '../components/ContractCard';
import { ContractTable } from '../components/ContractTable';
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
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
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
    
    let numericValue: number;
    
    if (typeof value === 'string') {
      // Remove todos os caracteres não numéricos, exceto ponto e vírgula
      const cleanValue = value.replace(/[^\d.,]/g, '');
      // Substitui vírgula por ponto para conversão
      numericValue = parseFloat(cleanValue.replace(',', '.'));
    } else {
      numericValue = value;
    }
    
    // Verifica se é um número válido
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }, []);

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'list' ? 'card' : 'list');
  };

  useEffect(() => {
    console.group('🔍 Contratos na Página');
    console.log('Total de contratos:', contracts.length);
    contracts.forEach((contract, index) => {
      console.log(`Contrato #${index + 1}:`, {
        id: contract.id,
        name: contract.name,
        value: contract.value,
        status: contract.status,
        fullDetails: contract
      });
    });
    console.groupEnd();
  }, [contracts]);

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
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Contratos</Typography>
      
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Total de Contratos: {contracts.length}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                console.log('Contratos completos:', contracts);
                alert(JSON.stringify(contracts, null, 2));
              }}
            >
              Mostrar Dados Brutos
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Próx. Cobrança</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.id}</TableCell>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(contract.value)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={contract.status} 
                        color={
                          contract.status === 'active' ? 'success' : 
                          contract.status === 'pending' ? 'warning' : 
                          'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{contract.groupName}</TableCell>
                    <TableCell>
                      {contract.nextBillingDate 
                        ? format(contract.nextBillingDate, 'dd/MM/yyyy') 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{contract.recurrencePeriod}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => {
                            // Lógica de edição
                            console.log('Editar contrato', contract);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            // Lógica de exclusão
                            console.log('Excluir contrato', contract);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
        </>
      )}
    </Box>
  );
};

export default ContractsPage;
