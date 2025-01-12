import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
  InputAdornment,
  Grid,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { personsService, itemsService, movementsService } from '../services/api';

const NewMovementDetailed = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    person: null,
    paymentMethod: null,
    totalAmount: 0,
  });

  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);

  const [personOptions, setPersonOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [loading, setLoading] = useState({
    persons: false,
    items: false
  });

  const mockPaymentMethods = [
    { id: 1, name: 'Dinheiro' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Boleto' },
  ];

  const searchPersons = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setPersonOptions([]);
        setLoading(prev => ({ ...prev, persons: false }));
        return;
      }

      try {
        setLoading(prev => ({ ...prev, persons: true }));
        const response = await personsService.search(query);
        const personResults = Array.isArray(response.items) 
          ? response.items 
          : (response.items?.data || []);
        
        setPersonOptions(personResults);
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
        setPersonOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, persons: false }));
      }
    }, 300),
    []
  );

  const searchItems = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setItemOptions([]);
        setLoading(prev => ({ ...prev, items: false }));
        return;
      }

      try {
        setLoading(prev => ({ ...prev, items: true }));
        const response = await itemsService.search(query);
        const itemResults = Array.isArray(response.items) 
          ? response.items 
          : (response.items?.data || []);
        
        setItemOptions(itemResults);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        setItemOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, items: false }));
      }
    }, 300),
    []
  );

  const handleAddItem = () => {
    const newItem = {
      item: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'item') {
      updatedItems[index].unitPrice = value?.price || 0;
    }

    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = 
        (updatedItems[index].quantity || 0) * (updatedItems[index].unitPrice || 0);
    }

    setItems(updatedItems);
    calculateTotalAmount();
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotalAmount();
  };

  const handleAddPayment = () => {
    const newPayment = {
      method: null,
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd')
    };
    setPayments([...payments, newPayment]);
  };

  const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...payments];
    updatedPayments[index][field] = value;
    setPayments(updatedPayments);
  };

  const handleRemovePayment = (index) => {
    const updatedPayments = payments.filter((_, i) => i !== index);
    setPayments(updatedPayments);
  };

  const calculateTotalAmount = () => {
    const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    setFormData(prev => ({ ...prev, totalAmount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const movementData = {
        date: formData.date,
        description: formData.description,
        person_id: formData.person?.id,
        payment_method_id: formData.paymentMethod?.id,
        total_amount: formData.totalAmount,
        items: items.map(item => ({
          item_id: item.item?.item_id,
          quantity: item.quantity,
          unit_price: item.unitPrice
        })),
        payments: payments.map(payment => ({
          payment_method_id: payment.method?.id,
          amount: payment.amount,
          date: payment.date
        }))
      };

      await movementsService.create(movementData);
      enqueueSnackbar('Movimento criado com sucesso!', { variant: 'success' });
      navigate('/movements');
    } catch (error) {
      console.error('Erro ao criar movimento:', error);
      enqueueSnackbar('Erro ao criar movimento', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Novo Movimento Detalhado
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={formData.person}
            onChange={(_, newValue) => setFormData(prev => ({ ...prev, person: newValue }))}
            options={personOptions}
            loading={loading.persons}
            onInputChange={(_, value) => searchPersons(value)}
            getOptionLabel={(option) => option?.fantasy_name || option?.full_name || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Pessoa"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={formData.paymentMethod}
            onChange={(_, newValue) => setFormData(prev => ({ ...prev, paymentMethod: newValue }))}
            options={mockPaymentMethods}
            getOptionLabel={(option) => option.name || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Método de Pagamento"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <PaymentIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">
          Itens 
          <IconButton onClick={handleAddItem} color="primary">
            <AddIcon />
          </IconButton>
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Preço Unitário</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      value={item.item}
                      onChange={(_, newValue) => handleItemChange(index, 'item', newValue)}
                      options={itemOptions}
                      loading={loading.items}
                      onInputChange={(_, value) => searchItems(value)}
                      getOptionLabel={(option) => `${option?.name || ''} - ${option?.code || ''}`}
                      renderInput={(params) => <TextField {...params} label="Selecione um item" />}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell>
                    {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemoveItem(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">
          Pagamentos
          <IconButton onClick={handleAddPayment} color="primary">
            <AddIcon />
          </IconButton>
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Método</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Autocomplete
                      value={payment.method}
                      onChange={(_, newValue) => handlePaymentChange(index, 'method', newValue)}
                      options={mockPaymentMethods}
                      getOptionLabel={(option) => option.name || ''}
                      renderInput={(params) => <TextField {...params} label="Método" />}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={payment.amount}
                      onChange={(e) => handlePaymentChange(index, 'amount', Number(e.target.value))}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="date"
                      value={payment.date}
                      onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRemovePayment(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Total: {formData.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Typography>
        <Button type="submit" variant="contained" color="primary">
          Criar Movimento
        </Button>
      </Box>
    </Box>
  );
};

export default NewMovementDetailed;
