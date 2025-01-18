import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { X } from 'lucide-react';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contract>) => void;
  contract: Contract;
}

export function EditContractModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  contract 
}: EditContractModalProps) {
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<Partial<Contract>>({
    defaultValues: {
      name: contract.name || '',
      initialValue: contract.initialValue || 0,
      recurrencePeriod: contract.recurrencePeriod || 'monthly',
      status: contract.status || 'ativo',
      dueDay: contract.dueDay || 1,
      group: contract.group || '',
      billingReference: contract.billingReference || 'current',
      personId: contract.personId || '',
      representativePersonId: contract.representativePersonId || '',
    }
  });

  const submitForm = (data: Partial<Contract>) => {
    console.warn(' Submetendo contrato:', data);
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-contract-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <Box 
        sx={{
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}
        >
          <Typography variant="h6">
            Editar Contrato: {contract.name}
          </Typography>
          <Button 
            variant="text" 
            color="secondary" 
            onClick={onClose}
          >
            <X />
          </Button>
        </Box>

        <form onSubmit={handleSubmit(submitForm)}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              md: 'repeat(2, 1fr)' 
            }, 
            gap: 2 
          }}>
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

            <Controller
              name="recurrencePeriod"
              control={control}
              rules={{ required: 'Período de recorrência é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Período de Recorrência</InputLabel>
                  <Select
                    {...field}
                    label="Período de Recorrência"
                    error={!!errors.recurrencePeriod}
                  >
                    <MenuItem value="monthly">Mensal</MenuItem>
                    <MenuItem value="quarterly">Trimestral</MenuItem>
                    <MenuItem value="yearly">Anual</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    label="Status"
                    error={!!errors.status}
                  >
                    <MenuItem value="ativo">Ativo</MenuItem>
                    <MenuItem value="inativo">Inativo</MenuItem>
                    <MenuItem value="encerrado">Encerrado</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="group"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    {...field}
                    label="Grupo"
                  >
                    <MenuItem value="">Selecione um grupo</MenuItem>
                    {['Grupo A', 'Grupo B', 'Grupo C'].map(group => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="personId"
              control={control}
              rules={{ required: 'Pessoa associada é obrigatória' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Pessoa Associada</InputLabel>
                  <Select
                    {...field}
                    label="Pessoa Associada"
                    error={!!errors.personId}
                  >
                    <MenuItem value="">Selecione uma pessoa</MenuItem>
                    {mockData.people.map(person => (
                      <MenuItem key={person.id} value={person.id}>
                        {person.name} - {person.document}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="representativePersonId"
              control={control}
              rules={{ required: 'Responsável é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    {...field}
                    label="Responsável"
                    error={!!errors.representativePersonId}
                  >
                    <MenuItem value="">Selecione um responsável</MenuItem>
                    {mockData.people.map(person => (
                      <MenuItem key={person.id} value={person.id}>
                        {person.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="billingReference"
              control={control}
              rules={{ required: 'Referência de faturamento é obrigatória' }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Referência de Faturamento</InputLabel>
                  <Select
                    {...field}
                    label="Referência de Faturamento"
                    error={!!errors.billingReference}
                  >
                    <MenuItem value="current">Período Atual</MenuItem>
                    <MenuItem value="advance">Antecipado</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="dueDay"
              control={control}
              rules={{ 
                required: 'Dia de vencimento é obrigatório',
                min: { value: 1, message: 'Dia deve estar entre 1 e 31' },
                max: { value: 31, message: 'Dia deve estar entre 1 e 31' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Dia de Vencimento"
                  variant="outlined"
                  inputProps={{ min: 1, max: 31 }}
                  error={!!errors.dueDay}
                  helperText={errors.dueDay?.message}
                />
              )}
            />
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 3 
            }}
          >
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              Salvar Alterações
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}