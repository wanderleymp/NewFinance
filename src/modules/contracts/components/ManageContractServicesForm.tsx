import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  TextField, 
  IconButton 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import { Contract } from '../types/contract';

interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
}

interface ManageContractServicesFormProps {
  contract: Contract;
  onCancel: () => void;
}

const ManageContractServicesForm: React.FC<ManageContractServicesFormProps> = ({ 
  contract, 
  onCancel 
}) => {
  const [services, setServices] = useState<Service[]>(contract.services || []);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAddService = () => {
    setServices([...services, { name: '', description: '', price: 0 }]);
  };

  const handleEditService = (index: number, service: Service) => {
    const updatedServices = [...services];
    updatedServices[index] = service;
    setServices(updatedServices);
  };

  const handleDeleteService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const handleSaveServices = () => {
    // Lógica para salvar serviços
    console.log('Serviços salvos:', services);
    onCancel();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Serviços - {contract.name}
      </Typography>

      <Grid container spacing={2}>
        {services.map((service, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Nome do Serviço"
                value={service.name}
                onChange={(e) => handleEditService(index, { ...service, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Descrição"
                value={service.description}
                onChange={(e) => handleEditService(index, { ...service, description: e.target.value })}
                fullWidth
              />
              <TextField
                label="Preço"
                type="number"
                value={service.price}
                onChange={(e) => handleEditService(index, { ...service, price: Number(e.target.value) })}
                fullWidth
              />
              <IconButton onClick={() => handleDeleteService(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddService}
        >
          Adicionar Serviço
        </Button>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onCancel}
            sx={{ mr: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveServices}
          >
            Salvar Serviços
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ManageContractServicesForm;
