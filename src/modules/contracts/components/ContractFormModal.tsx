import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid 
} from '@mui/material';
import { Contract } from '../types/contract';
import { ContractFormData } from '../types/contractForm';
import { SearchPersonAutocomplete } from '../../../components/SearchPersonAutocomplete';

interface ContractFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ContractFormData) => void;
  initialData?: Contract | null;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.contract_name || '',
    contract_name: initialData?.contract_name || '',
    contract_value: initialData?.contract_value || '0',
    currentValue: initialData?.contract_value ? parseFloat(initialData.contract_value) : 0,
    status: initialData?.status || 'ativo',
    group: initialData?.group_name || '',
    group_name: initialData?.group_name || '',
    start_date: initialData?.start_date || '',
    startDate: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    endDate: initialData?.end_date || '',
    recurrence_period: initialData?.recurrence_period || 'monthly',
    due_day: initialData?.due_day || 10,
    days_before_due: initialData?.days_before_due || 5,
    billing_reference: initialData?.billing_reference || '',
    representativePersonId: initialData?.representative_person_id || null,
    representativeName: initialData?.full_name || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonSelect = (person: any | null) => {
    setFormData(prev => ({
      ...prev,
      representativePersonId: person?.id || null,
      representativeName: person?.name || ''
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Editar Contrato' : 'Novo Contrato'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Nome do Contrato"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <SearchPersonAutocomplete 
              onPersonSelect={handlePersonSelect}
              label="Representante do Contrato"
              placeholder="Busque o representante do contrato"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="currentValue"
              label="Valor Atual"
              type="number"
              fullWidth
              value={formData.currentValue}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="status"
              label="Status"
              select
              fullWidth
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="startDate"
              label="Data de Início"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.startDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="endDate"
              label="Data de Término"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endDate}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} color="primary">
          {initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractFormModal;
