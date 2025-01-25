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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
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
    changeLimit,
    changeSearch,
    clearError,
    createContract, 
    updateContract, 
    deleteContract,
    refetch,
    search,
    setFilters,
    filters
  } = useNewContracts();

  console.group('🔍 ContractsPage Debug');
  console.log('Contratos recebidos:', contracts);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Pagination:', pagination);
  console.groupEnd();

  console.log('🔍 Search Debug:', {
    searchTerm: search
  });

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

  const [searchTerm, setSearchTerm] = useState<string>(search || '');
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    console.log('🔍 ContractsPage - Termo de busca alterado:', {
      searchTerm: debouncedSearch,
      previousSearch: search,
      isEqual: debouncedSearch === search
    });

    if (debouncedSearch !== search && debouncedSearch !== undefined) {
      console.log('🔍 ContractsPage - Atualizando busca para:', debouncedSearch);
      changeSearch(debouncedSearch);
    }
  }, [debouncedSearch, changeSearch, search]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    console.log('🔍 ContractsPage - Input de busca alterado:', {
      valor: newTerm,
      tamanho: newTerm.length
    });
    setSearchTerm(newTerm);
  };

  const [contractFilters, setContractFilters] = useState<ContractFilters>({
    groupName: '',
    billingStartDate: null,
    billingEndDate: null,
    lastAdjustmentStartDate: null,
    lastAdjustmentEndDate: null
  });

  const handleFilterChange = useCallback((filterName: keyof ContractFilters, value: any) => {
    const newFilters = { ...contractFilters, [filterName]: value };
    setContractFilters(newFilters);
    setFilters(newFilters);
  }, [contractFilters, setFilters]);

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
      await refetch();
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
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
      const cleanValue = value.replace(/[^\d.,]/g, '');
      numericValue = parseFloat(cleanValue.replace(',', '.'));
    } else {
      numericValue = value;
    }
    
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

    if (contracts.length > 0) {
      console.log('🚨 Primeiro contrato a ser renderizado:', contracts[0]);
    }
  }, [contracts]);

  const renderContractContent = useCallback(() => {
    console.log('🔍 Renderização de Contratos');
    console.log('Modo de visualização:', viewMode);
    console.log('Total de contratos:', contracts.length);

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

  const renderFilterSection = () => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Grupo de Contratos"
          variant="outlined"
          fullWidth
          value={contractFilters.groupName || ''}
          onChange={(e) => handleFilterChange('groupName', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Data de Faturamento (Início)"
          type="date"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={contractFilters.billingStartDate || ''}
          onChange={(e) => handleFilterChange('billingStartDate', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Data de Faturamento (Fim)"
          type="date"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={contractFilters.billingEndDate || ''}
          onChange={(e) => handleFilterChange('billingEndDate', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Data do Último Reajuste (Início)"
          type="date"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={contractFilters.lastAdjustmentStartDate || ''}
          onChange={(e) => handleFilterChange('lastAdjustmentStartDate', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="Data do Último Reajuste (Fim)"
          type="date"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={contractFilters.lastAdjustmentEndDate || ''}
          onChange={(e) => handleFilterChange('lastAdjustmentEndDate', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [selectedContractForServices, setSelectedContractForServices] = useState<Contract | null>(null);

  const handleOpenServiceModal = (contract: Contract) => {
    setSelectedContractForServices(contract);
    setOpenServiceModal(true);
  };

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100%"
        p={4}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h6" color="error" align="center">
          Erro ao carregar contratos
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
          {error.message || 'Não foi possível recuperar os contratos. Tente novamente mais tarde.'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  if (!loading && contracts.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100%"
        p={4}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'grey.500', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" align="center">
          Nenhum contrato encontrado
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
          {search ? `Não há contratos para o termo "${search}"` : 'Não existem contratos cadastrados'}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleOpenCreateModal}
          sx={{ mt: 2 }}
        >
          Criar Novo Contrato
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading && contracts.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
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
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar contratos..."
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: loading ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              />
            </Box>

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
          
          {renderFilterSection()}

          {renderContractContent()}

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={pagination.total}
            rowsPerPage={pagination.limit}
            page={pagination.page - 1}
            onPageChange={(_, newPage) => changePage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              const newLimit = parseInt(event.target.value, 10);
              changeLimit(newLimit);
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
