import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Contract } from '../types/contract';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
}

export function ServiceModal({ 
  isOpen, 
  onClose, 
  contract 
}: ServiceModalProps) {
  console.log('ServiceModal - Propriedades recebidas:', { 
    isOpen, 
    contract: contract?.id, 
    contractName: contract?.name 
  });

  // Log adicional para verificar o tipo de contrato
  console.log('Tipo de contrato:', typeof contract);
  console.log('Contrato completo:', JSON.stringify(contract, null, 2));

  // Validação de contrato
  if (!contract) {
    console.error('Contrato não definido no ServiceModal');
    return null;
  }

  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    // Lógica para adicionar/editar serviço
    console.log('Serviço adicionado', { serviceType, description, value });
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Gerenciar Serviços - {contract.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tipo de Serviço</InputLabel>
              <Select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                label="Tipo de Serviço"
              >
                <MenuItem value="consultoria">Consultoria</MenuItem>
                <MenuItem value="suporte">Suporte</MenuItem>
                <MenuItem value="desenvolvimento">Desenvolvimento</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição do Serviço"
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Valor do Serviço"
              variant="outlined"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              InputProps={{
                startAdornment: 'R$ '
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          Salvar Serviço
        </Button>
      </DialogActions>
    </Dialog>
  );
}
