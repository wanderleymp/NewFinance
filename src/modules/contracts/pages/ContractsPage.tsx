import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Tooltip,
  TablePagination,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { format } from 'date-fns';

import { useNewContracts } from '../hooks/useNewContracts';
import { ContractValidator } from '../utils/contractValidation';
import { useDebounce } from '../hooks/useDebounce';
import { ContractCard } from '../components/ContractCard';
import { ServiceModal } from '../components/ServiceModal'; // Importar o ServiceModal

const ContractsPage: React.FC = () => {
  const { 
    contracts, 
    loading, 
    error, 
    pagination,
    changePage,
    changeSearch,
    clearError,
    createContract, 
    updateContract, 
    deleteContract,
    refetch,
    search
  } = useNewContracts();

  console.group('🔍 ContractsPage Debug');
  console.log('Contratos recebidos:', contracts);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Pagination:', pagination);
  console.groupEnd();

  const [openModal, setOpenModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [contractForm, setContractForm] = useState<Partial<Contract>>({
    name: '',
    fullName: '',
    value: 0,
    status: 'ATIVO',
    groupName: ''
  });

  const [searchTerm, setSearchTerm] = useState(search);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  console.log('🔍 Search Debug:', {
    searchTerm,
    debouncedSearch
  });

  useEffect(() => {
    changeSearch(debouncedSearch);
  }, [debouncedSearch, changeSearch]);

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

  const handleOpenEditModal = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setContractForm({
      name: contract.name,
      value: contract.value.toString(),
      groupName: contract.groupName || ''
    });
    setOpenModal(true);
  }, []);

  const handleDeleteContract = useCallback(async (contractId: number) => {
    try {
      await deleteContract(contractId);
      // Atualizar lista de contratos após deleção
      await refetch();
      // Opcional: mostrar mensagem de sucesso
      // enqueueSnackbar('Contrato excluído com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      // Opcional: mostrar mensagem de erro
      // enqueueSnackbar('Erro ao excluir contrato', { variant: 'error' });
    }
  }, [deleteContract, refetch]);

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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

    // Adicionar verificação de renderização
    if (contracts.length > 0) {
      console.log('🚨 Primeiro contrato a ser renderizado:', contracts[0]);
    }
  }, [contracts]);

  const renderContractContent = useCallback(() => {
    console.group('🔍 Renderização de Contratos');
    console.log('Modo de visualização:', viewMode);
    console.log('Total de contratos:', contracts.length);
    console.groupEnd();

    if (contracts.length === 0) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '300px' 
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Nenhum contrato encontrado
          </Typography>
        </Box>
      );
    }

    return viewMode === 'card' ? (
      <Grid container spacing={2}>
        {contracts.map((contract) => (
          <Grid item xs={12} sm={6} md={4} key={contract.id}>
            <ContractCard 
              contract={contract}
              onEdit={() => handleOpenEditModal(contract)}
              onDelete={() => handleDeleteContract(contract.id)}
              onManageServices={(contractId) => {
                const selectedContract = contracts.find(c => c.id === contractId);
                setSelectedContractForServices(selectedContract || null);
                setOpenServiceModal(true);
              }}
            />
          </Grid>
        ))}
      </Grid>
    ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{formatCurrency(contract.value)}</TableCell>
                <TableCell>{renderStatusChip(contract.status)}</TableCell>
                <TableCell>
                  <Tooltip title="Gerenciar Serviços">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        setSelectedContractForServices(contract);
                        setOpenServiceModal(true);
                      }}
                    >
                      <BuildIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleOpenEditModal(contract)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteContract(contract.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [
    contracts, 
    viewMode, 
    handleOpenEditModal, 
    handleDeleteContract, 
    formatCurrency, 
    renderStatusChip
  ]);

  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [selectedContractForServices, setSelectedContractForServices] = useState<Contract | null>(null);

  const handleOpenServiceModal = (contract: Contract) => {
    setSelectedContractForServices(contract);
    setOpenServiceModal(true);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading && contracts.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            textAlign: 'center',
            padding: 2
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Erro ao carregar contratos
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {error || 'Ocorreu um problema inesperado'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              clearError();
              refetch();
            }}
          >
            Tentar Novamente
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h4">Contratos</Typography>
            
            <TextField
              label="Buscar contratos"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ maxWidth: 400, ml: 2 }}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title={viewMode === 'card' ? 'Visualizar em lista' : 'Visualizar em cards'}>
                <IconButton onClick={toggleViewMode} size="small">
                  {viewMode === 'card' ? <ViewListIcon /> : <ViewModuleIcon />}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
              >
                Novo Contrato
              </Button>
            </Box>
          </Box>
          
          {renderContractContent()}

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

          <ServiceModal
            isOpen={openServiceModal && !!selectedContractForServices}
            onClose={() => {
              setOpenServiceModal(false);
              setSelectedContractForServices(null);
            }}
            contract={selectedContractForServices || undefined}
          />
        </>
      )}
    </Box>
  );
};

export default ContractsPage;
