import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import toast from 'react-hot-toast';
import { useContractMovementItems, MovementItem } from '../hooks/useContractMovementItems';
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
  Box,
  CircularProgress
} from '@mui/material';
import { SearchItemAutocomplete } from './SearchItemAutocomplete';
import { contractService } from '../services/contractService';

interface AddExtraServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSubmit?: (extraService: {
    date: Date;
    type: 'servico' | 'desconto' | 'acrescimo';
    description: string;
    value: number;
    quantity: number;
    totalValue: number;
  }) => void;
}

interface ServiceItem extends MovementItem {
  selected?: boolean;
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
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const { movementItems, loading, error, fetchMovementItems } = useContractMovementItems();

  useEffect(() => {
    if (isOpen) {
      fetchMovementItems(contract?.id?.toString() || '');
    }
  }, [isOpen, contract?.id, fetchMovementItems]);

  useEffect(() => {
    // Calcular valor total sempre que quantidade ou preço unitário mudar
    const calculatedTotal = unitPrice * quantity;
    setTotalValue(calculatedTotal);
  }, [unitPrice, quantity]);

  const handleServiceSelect = (item: ServiceItem | null) => {
    if (item) {
      setSelectedService(item);
      setDescription(item.description || '');
      setUnitPrice(item.price || 0);
      setQuantity(1); // Resetar quantidade para 1 ao selecionar novo serviço
    } else {
      setSelectedService(null);
      setDescription('');
      setUnitPrice(0);
      setQuantity(1);
    }
  };

  const handleSubmit = async () => {
    if (!description || totalValue <= 0) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }

    if (!selectedService) {
      toast.error('Por favor, selecione um serviço');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        contractId: contract.id,
        serviceId: selectedService.id,
        itemDescription: description,
        itemValue: unitPrice,
        serviceDate: format(date, 'yyyy-MM-dd'),
        movementId: null,
        amount: quantity // Adicionando quantidade ao payload
      };

      console.log('Payload a ser enviado:', JSON.stringify(payload, null, 2));

      const response = await contractService.createExtraService(payload);
      
      toast.success('Serviço extra adicionado com sucesso!');

      // Chamar onSubmit se estiver definido
      if (onSubmit) {
        onSubmit({
          date,
          type,
          description,
          value: unitPrice,
          quantity,
          totalValue
        });
      }

      // Limpar campos após submissão
      setDate(new Date());
      setType('servico');
      setDescription('');
      setUnitPrice(0);
      setQuantity(1);
      setTotalValue(0);
      setSelectedService(null);

      onClose();
    } catch (error: any) {
      // Extrair mensagem de erro
      const errorMessage = error.message || 'Erro ao adicionar serviço extra';
      
      console.error('Erro detalhado:', {
        message: errorMessage,
        fullError: error
      });
      
      // Exibir mensagem de erro específica
      toast.error(errorMessage, {
        duration: 4000, // Aumentar tempo de exibição
        style: {
          background: '#FF4B4B',
          color: 'white',
        }
      });
    } finally {
      setIsLoading(false);
    }
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

          {type === 'servico' && (
            <FormControl fullWidth>
              <SearchItemAutocomplete
                searchService={(query) => contractService.searchMovementItems({ query, type: 'service' })}
                getOptionLabel={(option) => option.name || ''}
                onItemSelect={handleServiceSelect}
                label="Pesquisar Serviço"
              />
            </FormControl>
          )}
          
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do serviço extra"
            fullWidth
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="number"
              label="Preço Unitário"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              placeholder="Preço unitário do serviço"
              fullWidth
            />
            
            <TextField
              type="number"
              label="Quantidade"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantidade"
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          <TextField
            type="number"
            label="Valor Total"
            value={totalValue}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Valor total calculado"
            fullWidth
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
