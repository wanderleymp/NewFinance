import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Pagination, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Modal
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { ContractCard } from '../components/ContractCard';
import { ContractDetails } from '../components/ContractDetails';
import { BillingConfirmationModal } from '../components/BillingConfirmationModal';
import { useContracts } from '../hooks/useContracts';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { toast } from 'react-hot-toast';
import ContractForm from '../components/ContractForm';
import ManageContractServicesModal from '../components/ManageContractServicesModal';

export default function ContractsPage() {
  const { 
    contracts, 
    loading, 
    error, 
    page, 
    totalPages, 
    fetchContracts,
    deleteContract,
    createContract,
    updateContract
  } = useContracts();

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [isManageServicesModalOpen, setIsManageServicesModalOpen] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [billingConfirmationOpen, setBillingConfirmationOpen] = useState(false);
  
  // Novos estados para filtro e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);

  React.useEffect(() => {
    // Lógica de filtragem
    let result = contracts;
    
    if (searchTerm) {
      result = result.filter(contract => 
        contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.group.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      result = result.filter(contract => contract.status === statusFilter);
    }

    setFilteredContracts(result);
  }, [contracts, searchTerm, statusFilter]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchContracts(value);
  };

  const handleDeleteClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditingContract(true);
  };

  const handleViewClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsModalOpen(true);
  };

  const handleBillingClick = (contract: Contract) => {
    setSelectedContract(contract);
    setBillingConfirmationOpen(true);
  };

  const handleManageServices = (contract: Contract) => {
    setSelectedContract(contract);
    setIsManageServicesModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContract) return;

    try {
      await deleteContract(selectedContract.id);
      toast.success('Contrato excluído com sucesso!');
      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error('Erro ao excluir contrato');
    }
  };

  const handleCreateNewContract = () => {
    setSelectedContract(null);
    setIsCreatingContract(true);
  };

  const handleCreateContract = async (data: ContractFormData) => {
    try {
      await createContract(data);
      setIsCreatingContract(false);
      toast.success('Contrato criado com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar contrato');
    }
  };

  const handleUpdateContract = async (data: ContractFormData) => {
    if (!selectedContract) return;

    try {
      await updateContract(selectedContract.id, data);
      setIsEditingContract(false);
      setSelectedContract(null);
      toast.success('Contrato atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar contrato');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingContract(false);
    setIsCreatingContract(false);
    setSelectedContract(null);
  };

  const handleCloseManageServicesModal = () => {
    setSelectedContract(null);
    setIsManageServicesModalOpen(false);
  };

  const handleSaveServices = async (services: any[]) => {
    if (!selectedContract) return;

    try {
      // Implementar lógica de salvar serviços
      console.log('Salvando serviços para o contrato:', selectedContract.id, services);
      toast.success('Serviços atualizados com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar serviços');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {!isEditingContract && !isCreatingContract ? (
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4 
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Contratos
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateNewContract}
            >
              Novo Contrato
            </Button>
          </Box>

          {/* Área de Filtros e Busca */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2, 
              mb: 3,
              alignItems: 'center' 
            }}
          >
            <TextField
              label="Buscar Contratos"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativo">Ativos</MenuItem>
                <MenuItem value="inativo">Inativos</MenuItem>
                <MenuItem value="encerrado">Encerrados</MenuItem>
              </Select>
            </FormControl>

            {(searchTerm !== '' || statusFilter !== 'todos') && (
              <Chip 
                label="Limpar Filtros" 
                onDelete={clearFilters} 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Typography>Carregando contratos...</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Typography color="error">Erro ao carregar contratos</Typography>
            </Box>
          )}

          {!loading && !error && filteredContracts.length === 0 && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                backgroundColor: 'background.default' 
              }}
            >
              <Typography variant="h6" gutterBottom>
                Nenhum contrato encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não há contratos que correspondam aos filtros selecionados
              </Typography>
            </Paper>
          )}

          <Grid container spacing={3}>
            {filteredContracts.map((contract) => (
              <Grid item xs={12} sm={6} md={4} key={contract.id}>
                <ContractCard
                  contract={contract}
                  onEdit={() => handleEditClick(contract)}
                  onDelete={() => handleDeleteClick(contract)}
                  onView={() => handleViewClick(contract)}
                  onBilling={() => handleBillingClick(contract)}
                  onManageServices={() => handleManageServices(contract)}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4 
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <ContractForm
          contract={selectedContract || undefined}
          onSubmit={isEditingContract ? handleUpdateContract : handleCreateContract}
          onCancel={handleCancelEdit}
          isEditing={isEditingContract}
        />
      )}

      {/* Modais */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-contract-dialog-title"
        aria-describedby="delete-contract-dialog-description"
      >
        <DialogTitle id="delete-contract-dialog-title">
          Excluir Contrato
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-contract-dialog-description">
            Tem certeza que deseja excluir o contrato "{selectedContract?.name}"? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedContract(null);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}
      >
        <Box 
          sx={{ 
            width: '90%', 
            maxWidth: 1200, 
            maxHeight: '90vh', 
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2
          }}
        >
          {selectedContract && <ContractDetails contract={selectedContract} />}
        </Box>
      </Modal>

      {selectedContract && (
        <BillingConfirmationModal
          open={billingConfirmationOpen}
          onClose={() => {
            setBillingConfirmationOpen(false);
            setSelectedContract(null);
          }}
          contractName={selectedContract.name}
          billingValue={selectedContract.totalValue}
          onConfirm={() => {
            // Lógica de confirmação de faturamento
            setBillingConfirmationOpen(false);
            setSelectedContract(null);
          }}
        />
      )}

      <ManageContractServicesModal
        isOpen={isManageServicesModalOpen}
        contract={selectedContract}
        onClose={handleCloseManageServicesModal}
        onSave={handleSaveServices}
      />
    </Container>
  );
}
