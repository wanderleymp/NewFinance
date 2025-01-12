import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import { Search as SearchIcon } from '@mui/icons-material';

const MovementForm = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    description: initialData?.description || '',
    person: initialData?.person || null,
    item: initialData?.item || null,
    amount: initialData?.amount?.toString() || '',
    paymentMethod: initialData?.paymentMethod || null,
    boleto: initialData?.boleto ?? true,
    notificar: initialData?.notificar ?? true,
    nfse: initialData?.nfse ?? false
  });

  // Mock data - substituir por chamadas à API
  const mockPeople = [
    { id: 1, name: 'João Silva' },
    { id: 2, name: 'Maria Santos' },
  ];

  const mockItems = [
    { id: 1, name: 'Item 1', price: 100 },
    { id: 2, name: 'Item 2', price: 200 },
  ];

  const mockPaymentMethods = [
    { id: 1, name: 'Dinheiro' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Boleto' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        description: initialData.description || '',
        person: initialData.person || null,
        item: initialData.item || null,
        amount: initialData.amount?.toString() || '',
        paymentMethod: initialData.paymentMethod || null,
        boleto: initialData.boleto ?? true,
        notificar: initialData.notificar ?? true,
        nfse: initialData.nfse ?? false
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field) => (event, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue !== undefined ? newValue : event.target.value,
    });

    // Se selecionou um item, atualiza o valor automaticamente
    if (field === 'item' && newValue?.price) {
      setFormData(prev => ({
        ...prev,
        amount: newValue.price.toString(),
      }));
    }
  };

  const handleCheckboxChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Movimentação</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Data"
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Descrição"
              value={formData.description}
              onChange={handleChange('description')}
              fullWidth
            />

            <Autocomplete
              value={formData.person}
              onChange={handleChange('person')}
              options={mockPeople}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pessoa"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              value={formData.item}
              onChange={handleChange('item')}
              options={mockItems}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Item"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label="Valor"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              fullWidth
            />

            <Autocomplete
              value={formData.paymentMethod}
              onChange={handleChange('paymentMethod')}
              options={mockPaymentMethods}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Forma de Pagamento"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.boleto}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        boleto: e.target.checked
                      }))}
                      color="primary"
                    />
                  }
                  label="Gerar Boleto"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.notificar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificar: e.target.checked
                      }))}
                      color="primary"
                    />
                  }
                  label="Notificar"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.nfse}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        nfse: e.target.checked
                      }))}
                      color="primary"
                    />
                  }
                  label="Emitir NFS-e"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MovementForm;
