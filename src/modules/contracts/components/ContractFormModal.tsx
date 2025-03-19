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
import { SearchPersonAutocomplete } from '../../../../components/SearchPersonAutocomplete';

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
  const [formData, setFormData] = useState<ContractFormData>({
    name: initialData?.contract_name || '',
    currentValue: initialData?.contract_value ? parseFloat(initialData.contract_value) : 0,
    status: initialData?.status || 'ativo',
    group: initialData?.group_name || '',
    startDate: initialData?.start_date || '',
    endDate: initialData?.end_date || '',
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
