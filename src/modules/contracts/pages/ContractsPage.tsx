import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { format } from 'date-fns';

import { useNewContracts } from '../hooks/useNewContracts';
import { ContractValidator } from '../utils/contractValidation';
import { useDebounce } from '../hooks/useDebounce';
import { ContractCard } from '../components/ContractCard';
import { ServiceModal } from '../components/ServiceModal';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { contractService } from '../services/ContractService';
import { Contract } from '../types/contract';

const ContractsPage: React.FC = () => {
  const { 
    contracts, 
    isLoading: loading, 
    error,
    pagination,
    setPage: changePage,
    setLimit: changeLimit,
    setSearch,
  } = useNewContracts();

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Estados locais
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [selectedContractForServices, setSelectedContractForServices] = useState<Contract | null>(null);
  const [filters, setFilters] = useState({
    groupName: '',
    status: '',
  });

  // Logs para debug
  console.group('🔍 ContractsPage Debug');
  console.log('Contratos recebidos:', contracts);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Pagination:', pagination);
  console.groupEnd();

  // Efeito para atualizar a busca
  useEffect(() => {
    console.log('🔍 ContractsPage - Termo de busca alterado:', {
      searchTerm: debouncedSearch,
      previousSearch: searchTerm,
      isEqual: debouncedSearch === searchTerm
    });

    if (debouncedSearch !== undefined) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  // Handlers
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'card' : 'list');
  };

  const handleOpenBillingPage = () => {
    navigate('/contracts/billing');
  };

  const handleNewContract = () => {
    navigate('/contracts/form');
  };

  const handleEditContract = (contractId: number) => {
    navigate(`/contracts/form/${contractId}`);
  };

  // Renderização do conteúdo
  const renderContractContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography color="error" variant="h6">
            Erro ao carregar contratos
          </Typography>
          <Typography color="textSecondary">
            {error.message}
          </Typography>
        </Box>
      );
    }

    if (!contracts || contracts.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
          <Typography variant="h6" color="textSecondary">
            Nenhum contrato encontrado
          </Typography>
        </Box>
      );
    }

    return viewMode === 'list' ? (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{contract.groupName}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(contract.value)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={contract.status}
                    color={contract.status === 'ATIVO' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditContract(contract.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedContractForServices(contract);
                      setOpenServiceModal(true);
                    }}
                  >
                    <BuildIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Grid container spacing={2}>
        {contracts.map((contract) => (
          <Grid item xs={12} sm={6} md={4} key={contract.id}>
            <ContractCard
              contract={contract}
              onEdit={() => handleEditContract(contract.id)}
              onServices={() => {
                setSelectedContractForServices(contract);
                setOpenServiceModal(true);
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Contratos
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewContract}
            sx={{ mr: 1 }}
          >
            Novo Contrato
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AttachMoneyIcon />}
            onClick={handleOpenBillingPage}
          >
            Faturamento
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Grupo de Contratos"
              value={filters.groupName}
              onChange={(e) => handleFilterChange('groupName', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ATIVO">Ativo</MenuItem>
                <MenuItem value="INATIVO">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Botões de visualização */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title={viewMode === 'card' ? 'Visualizar em lista' : 'Visualizar em cards'}>
          <IconButton onClick={toggleViewMode} color="primary">
            {viewMode === 'card' ? <ViewListIcon /> : <ViewModuleIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Conteúdo */}
      {renderContractContent()}

      {/* Paginação */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(_, newPage) => changePage(newPage + 1)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(event) => changeLimit(parseInt(event.target.value, 10))}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Box>

      {/* Modal de Serviços */}
      <ServiceModal
        isOpen={openServiceModal}
        onClose={() => {
          setOpenServiceModal(false);
          setSelectedContractForServices(null);
        }}
        contract={selectedContractForServices}
      />
    </Box>
  );
};

export default ContractsPage;
