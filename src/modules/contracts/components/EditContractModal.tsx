import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Contract } from '../types/contract';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contract>) => void;
  contract: Contract;
}

export function EditContractModal({ isOpen, onClose, onSubmit, contract }: EditContractModalProps) {
  const [formData, setFormData] = useState<Partial<Contract>>({
    ...contract
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Contrato</DialogTitle>
      <DialogContent>
        <TextField
          name="contract_name"
          label="Nome do Contrato"
          value={formData.contract_name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="contract_value"
          label="Valor do Contrato"
          value={formData.contract_value}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {/* Adicione outros campos conforme necessário */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
