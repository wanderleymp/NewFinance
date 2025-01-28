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

interface ContractFormData {
  contract_name: string;
  contract_value: string;
  start_date: string;
  end_date: string | null;
  status: string;
  group_name: string;
  full_name: string;
  recurrence_period: 'monthly' | 'yearly';
  due_day: number;
  days_before_due: number;
  billing_reference: string;
  contract_group_id: number;
  model_movement_id: number;
  representative_person_id: number | null;
  commissioned_value: number | null;
  account_entry_id: number | null;
}

const initialFormData: ContractFormData = {
  contract_name: '',
  contract_value: '',
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: null,
  status: 'active',
  group_name: '',
  full_name: '',
  recurrence_period: 'monthly',
  due_day: 1,
  days_before_due: 0,
  billing_reference: '',
  contract_group_id: 0,
  model_movement_id: 0,
  representative_person_id: null,
  commissioned_value: null,
  account_entry_id: null,
};

const ContractFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});

  // Carrega os dados do contrato se estiver editando
  useEffect(() => {
    const loadContract = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await contractService.getContractById(Number(id));
        setFormData({
          contract_name: response.contract_name,
          contract_value: response.contract_value,
          start_date: format(new Date(response.start_date), 'yyyy-MM-dd'),
          end_date: response.end_date ? format(new Date(response.end_date), 'yyyy-MM-dd') : null,
          status: response.status,
          group_name: response.group_name,
          full_name: response.full_name,
          recurrence_period: response.recurrence_period as 'monthly' | 'yearly',
          due_day: response.due_day,
          days_before_due: response.days_before_due,
          billing_reference: response.billing_reference,
          contract_group_id: response.contract_group_id,
          model_movement_id: response.model_movement_id,
          representative_person_id: response.representative_person_id,
          commissioned_value: response.commissioned_value,
          account_entry_id: response.account_entry_id,
        });
      } catch (error) {
        console.error('Erro ao carregar contrato:', error);
        enqueueSnackbar('Erro ao carregar dados do contrato', { variant: 'error' });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Por favor, corrija os erros no formulário', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      if (id) {
        await contractService.updateContract(Number(id), formData);
        enqueueSnackbar('Contrato atualizado com sucesso', { variant: 'success' });
      } else {
        await contractService.createContract(formData);
        enqueueSnackbar('Contrato criado com sucesso', { variant: 'success' });
      }
      
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
    
    // Limpa o erro do campo quando ele é alterado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
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
