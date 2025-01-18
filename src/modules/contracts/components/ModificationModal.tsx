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
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Contract } from '../types/contract';

interface ModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
}

export function ModificationModal({ 
  isOpen, 
  onClose, 
  contract 
}: ModificationModalProps) {
  const [modificationType, setModificationType] = useState('');
  const [description, setDescription] = useState('');
  const [retroactiveEffect, setRetroactiveEffect] = useState(false);

  const handleSubmit = () => {
    // Lógica para adicionar/editar modificação
    console.log('Modificação adicionada', { 
      modificationType, 
      description, 
      retroactiveEffect 
    });
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
        Solicitar Modificação de Contrato - {contract.name}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tipo de Modificação</InputLabel>
              <Select
                value={modificationType}
                onChange={(e) => setModificationType(e.target.value)}
                label="Tipo de Modificação"
              >
                <MenuItem value="escopo">Escopo do Serviço</MenuItem>
                <MenuItem value="valor">Valor do Contrato</MenuItem>
                <MenuItem value="prazo">Prazo de Vigência</MenuItem>
                <MenuItem value="representante">Representante</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição da Modificação"
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Detalhe claramente a modificação solicitada"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={retroactiveEffect}
                  onChange={(e) => setRetroactiveEffect(e.target.checked)}
                  color="primary"
                />
              }
              label="Efeito Retroativo"
            />
            <Typography variant="body2" color="textSecondary">
              Marque se a modificação deve ser aplicada retroativamente
            </Typography>
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
          Solicitar Modificação
        </Button>
      </DialogActions>
    </Dialog>
  );
}
