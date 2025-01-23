import React, { useState, useEffect } from 'react';
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
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import { Contract } from '../types/contract';
import { useContractMovementItems, MovementItem } from '../hooks/useContractMovementItems';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
}

export function ServiceModal({ 
  isOpen, 
  onClose, 
  contract 
}: ServiceModalProps) {
  // Se não há contrato, não renderiza nada
  if (!contract) return null;

  const { movementItems, loading, error, fetchMovementItems } = useContractMovementItems();
  
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen && contract?.id) {
      fetchMovementItems(contract.id.toString());
    }
  }, [isOpen, contract?.id, fetchMovementItems]);

  const handleSubmit = () => {
    // Lógica para adicionar/editar serviço
    console.log('Serviço adicionado', { serviceType, description, value });
    onClose();
  };

  const renderMovementItems = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Typography color="error" align="center" p={2}>
          {error}
        </Typography>
      );
    }

    if (movementItems.length === 0) {
      return (
        <Typography align="center" p={2}>
          Nenhum item de movimento encontrado
        </Typography>
      );
    }

    return (
      <List>
        {movementItems.map((item: MovementItem) => (
          <React.Fragment key={item.id}>
            <ListItem>
              <ListItemText
                primary={item.name}
                secondary={`R$ ${item.value.toFixed(2)} - ${item.description}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Gerenciar Serviços - {contract?.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Itens de Movimento
            </Typography>
            {renderMovementItems()}
          </Grid>
          
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
