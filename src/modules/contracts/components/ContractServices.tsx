import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import { ContractService, ContractServiceFormData } from '../types/contractService';
import { contractService } from '../services/ContractService';
import { Contract } from '../types/contract';

interface ContractServicesProps {
  contract: Contract;
  services: ContractService[];
  onAddService: (service: ContractService) => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, service: ContractService) => void;
}

interface MovementItem {
  id: number;
  name: string;
  value: number;
  movement_item_id: number;
  total_value: number;
}

const initialServiceForm: ContractServiceFormData = {
  name: '',
  description: '',
  unit_value: '',
  quantity: '',
  total_value: '',
  movement_item_id: '',
};

export const ContractServices: React.FC<ContractServicesProps> = ({
  contract,
  services = [], // Valor padrão para services
  onAddService,
  onRemoveService,
  onUpdateService,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newService, setNewService] = useState<ContractServiceFormData>(initialServiceForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContractServiceFormData, string>>>({});
  const [searchResults, setSearchResults] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitValue, setEditUnitValue] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewService(initialServiceForm);
    setErrors({});
    setEditingService(false);
    setEditingIndex(null);
    setEditQuantity('');
    setEditUnitValue('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContractServiceFormData, string>> = {};
    let isValid = true;

    if (!newService.name) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!newService.unit_value) {
      newErrors.unit_value = 'Valor unitário é obrigatório';
      isValid = false;
    } else if (isNaN(Number(newService.unit_value))) {
      newErrors.unit_value = 'Valor unitário deve ser um número';
      isValid = false;
    }

    if (!newService.quantity) {
      newErrors.quantity = 'Quantidade é obrigatória';
      isValid = false;
    } else if (isNaN(Number(newService.quantity))) {
      newErrors.quantity = 'Quantidade deve ser um número';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const totalValue = Number(newService.unit_value) * Number(newService.quantity);
      
      console.log('Iniciando submissão do serviço:', {
        editingService,
        newService,
        contract,
        totalValue
      });

      if (!contract?.contract_id) {
        console.error('Contract ID não encontrado');
        enqueueSnackbar('Erro: ID do contrato não encontrado', { variant: 'error' });
        return;
      }

      if (editingService && newService.movement_item_id) {
        console.log('Atualizando serviço existente:', {
          contractId: contract.contract_id,
          movementItemId: newService.movement_item_id,
          data: {
            quantity: Number(editQuantity),
            unit_price: Number(editUnitValue),
            total_price: Number(editQuantity) * Number(editUnitValue),
            item_id: newService.id // Usando o id do serviço
          }
        });

        // Atualiza item existente
        const response = await contractService.updateContractItem(
          contract.contract_id,
          newService.movement_item_id,
          {
            quantity: Number(editQuantity),
            unit_price: Number(editUnitValue),
            total_price: Number(editQuantity) * Number(editUnitValue),
            item_id: newService.id
          }
        );

        console.log('Resposta da atualização:', response);
        
        if (response) {
          // Atualiza o serviço na lista local
          const updatedService = {
            ...newService,
            quantity: Number(editQuantity),
            unit_value: Number(editUnitValue),
            total_value: Number(editQuantity) * Number(editUnitValue),
            contract_id: contract.contract_id
          };
          onUpdateService(editingIndex!, updatedService);
          enqueueSnackbar('Serviço atualizado com sucesso!', { variant: 'success' });
          handleClose();
        }
      } else {
        console.log('Adicionando novo serviço:', {
          newService,
          totalValue,
          contractId: contract.contract_id
        });

        // Adiciona novo serviço
        const newServiceData = {
          name: newService.name,
          unit_value: Number(newService.unit_value),
          quantity: Number(newService.quantity),
          total_value: totalValue,
          movement_item_id: newService.movement_item_id,
          contract_id: contract.contract_id
        };
        onAddService(newServiceData);
        enqueueSnackbar('Serviço adicionado com sucesso!', { variant: 'success' });
        handleClose();
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      enqueueSnackbar('Erro ao salvar serviço', { variant: 'error' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEditService = (service: ContractService, index: number) => {
    console.log('Editando serviço:', service);
    setEditingService(true);
    setEditingIndex(index);
    setNewService({
      id: service.id,
      name: service.name,
      unit_value: service.unit_value.toString(),
      quantity: service.quantity.toString(),
      total_value: service.total_value.toString(),
      movement_item_id: service.movement_item_id,
      contract_id: service.contract_id || contract?.contract_id
    });
    setEditQuantity(service.quantity.toString());
    setEditUnitValue(service.unit_value.toString());
    setOpen(true);
  };

  const handleInputChange = (field: keyof ContractService, value: any) => {
    setNewService((prev) => {
      const updated = { ...prev, [field]: value };

      // Calcula o valor total automaticamente
      if (field === 'unit_value' || field === 'quantity') {
        updated.total_value = (updated.unit_value || 0) * (updated.quantity || 0);
      }

      return updated;
    });
  };

  const handleEditInputChange = (field: keyof ContractService, value: any) => {
    if (field === 'quantity') {
      setEditQuantity(value);
    } else if (field === 'unit_value') {
      setEditUnitValue(value);
    }
  };

  const handleSearchService = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await contractService.searchMovementItems({
        query,
        type: 'service'
      });
      
      const items = response.data.map((item: any) => ({
        id: item.item_id,
        movement_item_id: item.movement_item_id,
        name: item.item_name,
        value: item.unit_price,
        total_value: item.total_price
      }));
      
      setSearchResults(items);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      enqueueSnackbar('Erro ao buscar serviços', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service: MovementItem) => {
    setNewService({
      name: service.name,
      unit_value: service.value,
      quantity: 1,
      total_value: service.value,
      movement_item_id: service.movement_item_id
    });
    setSearchResults([]); // Limpa os resultados após selecionar
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Serviços do Contrato</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Adicionar Serviço
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Valor Unitário</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service, index) => (
                <TableRow key={index}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(service.unit_value)}
                  </TableCell>
                  <TableCell align="right">{service.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(service.total_value)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditService(service, index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveService(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum serviço cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
        </DialogTitle>
        <DialogContent>
          {!editingService && (
            <>
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Buscar Serviço
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Digite para buscar um serviço..."
                  onChange={(e) => handleSearchService(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                {loading && (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {searchResults.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {searchResults.map((item) => (
                        <ListItem
                          key={item.id}
                          button
                          onClick={() => handleSelectService(item)}
                        >
                          <ListItemText
                            primary={item.name}
                            secondary={`R$ ${formatCurrency(item.value)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}
          
          <TextField
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            value={newService.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={editingService}
          />
          <TextField
            margin="dense"
            label="Valor Unitário"
            type="number"
            fullWidth
            value={editingService ? editUnitValue : newService.unit_value || ''}
            onChange={(e) => editingService ? handleEditInputChange('unit_value', e.target.value) : handleInputChange('unit_value', Number(e.target.value))}
            error={!!errors.unit_value}
            helperText={errors.unit_value}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
          <TextField
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            value={editingService ? editQuantity : newService.quantity || ''}
            onChange={(e) => editingService ? handleEditInputChange('quantity', e.target.value) : handleInputChange('quantity', Number(e.target.value))}
            error={!!errors.quantity}
            helperText={errors.quantity}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingService ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractServices;
