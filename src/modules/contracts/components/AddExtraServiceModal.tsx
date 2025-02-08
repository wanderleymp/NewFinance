import React, { useState } from 'react';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';

interface AddExtraServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSubmit: (extraService: {
    date: Date;
    type: 'servico' | 'desconto' | 'acrescimo';
    description: string;
    value: number;
  }) => void;
}

export function AddExtraServiceModal({
  isOpen,
  onClose,
  contract,
  onSubmit
}: AddExtraServiceModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<'servico' | 'desconto' | 'acrescimo'>('servico');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(0);

  const handleSubmit = () => {
    if (!description || value <= 0) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }

    onSubmit({
      date,
      type,
      description,
      value
    });

    // Limpar campos após submissão
    setDate(new Date());
    setType('servico');
    setDescription('');
    setValue(0);

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Serviço Extra</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            type="date"
            label="Data"
            value={format(date, 'yyyy-MM-dd')}
            onChange={(e) => setDate(new Date(e.target.value))}
            fullWidth
          />
          
          <FormControl fullWidth>
            <InputLabel>Tipo de Ajuste</InputLabel>
            <Select
              value={type}
              label="Tipo de Ajuste"
              onChange={(e) => setType(e.target.value as 'servico' | 'desconto' | 'acrescimo')}
            >
              <MenuItem value="servico">Serviço</MenuItem>
              <MenuItem value="desconto">Desconto</MenuItem>
              <MenuItem value="acrescimo">Acréscimo</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do serviço extra"
            fullWidth
          />
          
          <TextField
            type="number"
            label="Valor"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            placeholder="Valor do serviço extra"
            fullWidth
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
