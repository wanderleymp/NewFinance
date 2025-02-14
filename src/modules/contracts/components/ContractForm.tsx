import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Container,
  Grid
} from '@mui/material';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { mockData } from '../services/mockData';
import { SearchPersonAutocomplete } from '../../../../components/SearchPersonAutocomplete';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({ 
  contract, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: contract?.name || '',
      initialValue: contract?.initialValue || 0,
      status: contract?.status && ['ativo', 'inativo', 'encerrado'].includes(contract?.status) 
        ? contract.status 
        : 'ativo',
      dueDay: contract?.dueDay || 1,
      group: contract?.group && ['', 'Grupo A', 'Grupo B', 'Grupo C'].includes(contract?.group)
        ? contract.group
        : '',
      personId: contract?.personId || '',
      representativePersonId: contract?.representativePersonId || '',
      representativeName: contract?.representativeName || '',
      recurrencePeriod: contract?.recurrencePeriod || 'monthly',
      billingReference: contract?.billingReference || 'current'
    }
  });

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const handlePersonSelect = (person: any | null) => {
    setValue('representativePersonId', person?.id || '');
    setValue('representativeName', person?.name || '');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? `Editar Contrato: ${contract?.name}` : 'Criar Contrato'}
      </Typography>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Nome do contrato é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome do Contrato"
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="initialValue"
              control={control}
              rules={{ 
                required: 'Valor inicial é obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Valor Inicial"
                  variant="outlined"
                  error={!!errors.initialValue}
                  helperText={errors.initialValue?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                    <MenuItem value="encerrado">Encerrado</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="dueDay"
              control={control}
              rules={{ 
                required: 'Dia de vencimento é obrigatório',
                min: { value: 1, message: 'Dia deve ser entre 1 e 31' },
                max: { value: 31, message: 'Dia deve ser entre 1 e 31' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Dia de Vencimento"
                  variant="outlined"
                  error={!!errors.dueDay}
                  helperText={errors.dueDay?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="group"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select {...field} label="Grupo">
                    <MenuItem value="">Sem Grupo</MenuItem>
                    <MenuItem value="Grupo A">Grupo A</MenuItem>
                    <MenuItem value="Grupo B">Grupo B</MenuItem>
                    <MenuItem value="Grupo C">Grupo C</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="personId"
              control={control}
              rules={{ required: 'Pessoa é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ID da Pessoa"
                  variant="outlined"
                  error={!!errors.personId}
                  helperText={errors.personId?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SearchPersonAutocomplete 
              onPersonSelect={handlePersonSelect}
              label="Representante do Contrato"
              placeholder="Busque o representante do contrato"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="recurrencePeriod"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Período de Recorrência</InputLabel>
                  <Select {...field} label="Período de Recorrência">
                    <MenuItem value="monthly">Mensal</MenuItem>
                    <MenuItem value="quarterly">Trimestral</MenuItem>
                    <MenuItem value="yearly">Anual</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="billingReference"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Referência de Faturamento</InputLabel>
                  <Select {...field} label="Referência de Faturamento">
                    <MenuItem value="current">Atual</MenuItem>
                    <MenuItem value="previous">Anterior</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default ContractForm;
