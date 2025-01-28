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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ContractService, ContractServiceFormData } from '../types/contractService';

interface ContractServicesProps {
  services: ContractService[];
  onAddService: (service: ContractService) => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, service: ContractService) => void;
}

const initialServiceForm: ContractServiceFormData = {
  name: '',
  description: '',
  unit_value: '',
  quantity: '',
  total_value: '',
};

export const ContractServices: React.FC<ContractServicesProps> = ({
  services,
  onAddService,
  onRemoveService,
  onUpdateService,
}) => {
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState(false);
  const [newService, setNewService] = useState<ContractServiceFormData>(initialServiceForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContractServiceFormData, string>>>({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewService(initialServiceForm);
    setErrors({});
    setEditingService(false);
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newServiceData: ContractService = {
      name: newService.name,
      unit_value: Number(newService.unit_value),
      quantity: Number(newService.quantity),
      total_value: Number(newService.unit_value) * Number(newService.quantity),
    };

    if (editingService) {
      // Atualiza o serviço existente
      onUpdateService(services.findIndex((service) => service.id === newService.id), newServiceData);
    } else {
      // Adiciona novo serviço
      onAddService(newServiceData);
    }

    handleClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEditService = (service: ContractService) => {
    setEditingService(true);
    setNewService({
      id: service.id,
      name: service.name,
      unit_value: service.unit_value.toString(),
      quantity: service.quantity.toString(),
      total_value: service.total_value.toString(),
    });
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
            {services.map((service, index) => (
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
                    onClick={() => handleEditService(service)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={2}>
            <TextField
              autoFocus
              margin="dense"
              label="Nome"
              type="text"
              fullWidth
              value={newService.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="dense"
              label="Valor Unitário"
              type="number"
              fullWidth
              value={newService.unit_value || ''}
              onChange={(e) => handleInputChange('unit_value', Number(e.target.value))}
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
              value={newService.quantity || ''}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              error={!!errors.quantity}
              helperText={errors.quantity}
            />
          </Box>
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
