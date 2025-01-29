import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  FormHelperText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { contractService } from '../services/ContractService';
import ContractServices from '../components/ContractServices';
import { ContractService } from '../types/contractService';

interface ContractFormData {
  contract_name: string;
  contract_value: string;
  start_date: string;
  end_date: string | null;
  status: string;
  group_name: string;
  full_name: string;
  person_id: number;
  contract_group_id: number;
  recurrence_period: 'monthly' | 'yearly';
  due_day: number;
  days_before_due: number;
  billing_reference: string;
  model_movement_id: number;
  representative_person_id: number | null;
  commissioned_value: number | null;
  account_entry_id: number | null;
  payment_method: string;
  services: ContractService[];
  last_billing_date: string | null;
  next_billing_date: string | null;
  last_decimo_billing_year: number;
  last_adjustment: number;
  contract_adjustments: any[];
  billings: any[];
  contract_id: number;
}

const initialFormData: ContractFormData = {
  contract_name: '',
  contract_value: '',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: null,
  status: 'active',
  group_name: '',
  full_name: '',
  person_id: 0,
  contract_group_id: 0,
  recurrence_period: 'monthly',
  due_day: 1,
  days_before_due: 0,
  billing_reference: '',
  model_movement_id: 0,
  representative_person_id: null,
  commissioned_value: null,
  account_entry_id: null,
  payment_method: '',
  services: [],
  last_billing_date: null,
  next_billing_date: null,
  last_decimo_billing_year: 0,
  last_adjustment: 0,
  contract_adjustments: [],
  billings: [],
  contract_id: 0,
};

const ContractFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});

  useEffect(() => {
    const loadContract = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await contractService.getContractById(Number(id));
        
        if (response) {
          console.log('Resposta do contrato:', response);
          
          // Mapeia os serviços do contrato
          const mappedServices = response.items?.map(item => ({
            id: item.item_id,
            movement_item_id: item.movement_item_id,
            name: item.item_name,
            quantity: item.quantity,
            unit_value: item.unit_price,
            total_value: item.total_price,
            contract_id: Number(id)
          })) || [];

          setFormData({
            ...response,
            contract_id: Number(id),
            start_date: format(new Date(response.start_date), 'yyyy-MM-dd'),
            end_date: response.end_date ? format(new Date(response.end_date), 'yyyy-MM-dd') : null,
            services: mappedServices
          });
        }
      } catch (error) {
        console.error('Erro ao carregar contrato:', error);
        enqueueSnackbar('Erro ao carregar contrato', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [id, enqueueSnackbar]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContractFormData, string>> = {};
    
    if (!formData.contract_name) {
      newErrors.contract_name = 'Nome do contrato é obrigatório';
    }
    
    if (!formData.contract_value || Number(formData.contract_value) <= 0) {
      newErrors.contract_value = 'Valor do contrato deve ser maior que zero';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.group_name) {
      newErrors.group_name = 'Grupo é obrigatório';
    }

    if (formData.due_day < 1 || formData.due_day > 31) {
      newErrors.due_day = 'Dia de vencimento deve estar entre 1 e 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const contractData = {
        ...formData,
        items: formData.services, 
      };
      
      await contractService.createOrUpdateContract(id ? Number(id) : undefined, contractData);
      
      enqueueSnackbar('Contrato salvo com sucesso!', { variant: 'success' });
      navigate('/contracts');
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      enqueueSnackbar('Erro ao salvar contrato', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContractFormData) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddService = (service: ContractService) => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, service],
      contract_value: String(prev.services.reduce((total, s) => total + s.total_value, 0) + service.total_value)
    }));
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      const removedService = newServices[index];
      newServices.splice(index, 1);
      
      return {
        ...prev,
        services: newServices,
        contract_value: String(prev.services.reduce((total, s) => total + s.total_value, 0) - removedService.total_value)
      };
    });
  };

  const handleUpdateService = (index: number, service: ContractService) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      newServices[index] = service;
      
      return {
        ...prev,
        services: newServices,
        contract_value: String(newServices.reduce((total, s) => total + s.total_value, 0))
      };
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            {id ? 'Editar Contrato' : 'Novo Contrato'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Contrato"
                  value={formData.contract_name}
                  onChange={handleInputChange('contract_name')}
                  error={!!errors.contract_name}
                  helperText={errors.contract_name}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.full_name}
                  onChange={handleInputChange('full_name')}
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor do Contrato"
                  type="number"
                  value={formData.contract_value}
                  onChange={handleInputChange('contract_value')}
                  error={!!errors.contract_value}
                  helperText={errors.contract_value}
                  InputProps={{
                    startAdornment: <InputLabel>R$</InputLabel>,
                  }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Grupo"
                  value={formData.group_name}
                  onChange={handleInputChange('group_name')}
                  error={!!errors.group_name}
                  helperText={errors.group_name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                    <MenuItem value="suspended">Suspenso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Datas e Periodicidade */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Datas e Periodicidade
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data de Início"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange('start_date')}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data de Término"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={handleInputChange('end_date')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Periodicidade</InputLabel>
                  <Select
                    value={formData.recurrence_period}
                    onChange={handleInputChange('recurrence_period')}
                    label="Periodicidade"
                  >
                    <MenuItem value="monthly">Mensal</MenuItem>
                    <MenuItem value="yearly">Anual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Dia do Vencimento"
                  type="number"
                  value={formData.due_day}
                  onChange={handleInputChange('due_day')}
                  error={!!errors.due_day}
                  helperText={errors.due_day}
                  InputProps={{ inputProps: { min: 1, max: 31 } }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Dias Antes do Vencimento"
                  type="number"
                  value={formData.days_before_due}
                  onChange={handleInputChange('days_before_due')}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Referência de Faturamento"
                  value={formData.billing_reference}
                  onChange={handleInputChange('billing_reference')}
                />
              </Grid>

              {/* Informações Adicionais */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informações Adicionais
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ID do Grupo de Contrato"
                  type="number"
                  value={formData.contract_group_id}
                  onChange={handleInputChange('contract_group_id')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ID do Movimento Modelo"
                  type="number"
                  value={formData.model_movement_id}
                  onChange={handleInputChange('model_movement_id')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ID do Representante"
                  type="number"
                  value={formData.representative_person_id || ''}
                  onChange={handleInputChange('representative_person_id')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor Comissionado"
                  type="number"
                  value={formData.commissioned_value || ''}
                  onChange={handleInputChange('commissioned_value')}
                  InputProps={{
                    startAdornment: <InputLabel>R$</InputLabel>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID da Entrada Contábil"
                  type="number"
                  value={formData.account_entry_id || ''}
                  onChange={handleInputChange('account_entry_id')}
                />
              </Grid>

              {/* Serviços do Contrato */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Serviços do Contrato
                </Typography>
                
                <ContractServices
                  contract={{
                    contract_id: Number(id),
                    ...formData
                  }}
                  services={formData.services}
                  onAddService={handleAddService}
                  onRemoveService={handleRemoveService}
                  onUpdateService={handleUpdateService}
                />
              </Grid>

              {/* Botões */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/contracts')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : id ? 'Atualizar' : 'Criar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default ContractFormPage;
