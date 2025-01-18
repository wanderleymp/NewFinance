import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  TextField,
  Box
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { Contract } from '../types/contract';

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
}

interface ManageContractServicesModalProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSave: (services: Service[]) => void;
}

const ManageContractServicesModal: React.FC<ManageContractServicesModalProps> = ({ 
  isOpen, 
  contract, 
  onClose, 
  onSave 
}) => {
  const [services, setServices] = useState<Service[]>(
    contract?.services || [
      { 
        id: '1', 
        name: 'Serviço de Limpeza', 
        description: 'Limpeza completa do ambiente', 
        price: 250.00 
      },
      { 
        id: '2', 
        name: 'Manutenção Preventiva', 
        description: 'Revisão completa de equipamentos', 
        price: 500.00 
      }
    ]
  );
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAddService = () => {
    setEditingService({ name: '', description: '', price: 0 });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleDeleteService = (serviceToDelete: Service) => {
    setServices(services.filter(service => service.id !== serviceToDelete.id));
  };

  const handleSaveService = () => {
    if (!editingService) return;

    if (editingService.id) {
      // Editando serviço existente
      setServices(services.map(service => 
        service.id === editingService.id ? editingService : service
      ));
    } else {
      // Adicionando novo serviço
      setServices([
        ...services, 
        { ...editingService, id: `${services.length + 1}` }
      ]);
    }
    setEditingService(null);
  };

  const handleSaveAllServices = () => {
    onSave(services);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        Gerenciar Serviços - {contract?.name || 'Novo Contrato'}
      </DialogTitle>
      
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>R$ {service.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditService(service)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteService(service)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {editingService && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <TextField
              label="Nome do Serviço"
              value={editingService.name}
              onChange={(e) => setEditingService({...editingService, name: e.target.value})}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={editingService.description}
              onChange={(e) => setEditingService({...editingService, description: e.target.value})}
              fullWidth
            />
            <TextField
              label="Preço"
              type="number"
              value={editingService.price}
              onChange={(e) => setEditingService({...editingService, price: Number(e.target.value)})}
              fullWidth
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSaveService}
            >
              Salvar Serviço
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddService}
        >
          Adicionar Serviço
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveAllServices}
        >
          Salvar Serviços
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageContractServicesModal;
