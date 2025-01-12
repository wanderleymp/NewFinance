import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Grid,
  Autocomplete,
  IconButton,
  Card,
  CardContent,
  InputAdornment,
  Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { movementsService, itemsService } from '../services/api';

const MovementEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [movement, setMovement] = useState(null);
  const [searchItems, setSearchItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    person: null,
    payments: [],
  });

  useEffect(() => {
    const fetchMovement = async () => {
      try {
        setLoading(true);
        const response = await movementsService.get(id);
        console.log('Movimento carregado (estrutura completa):', JSON.stringify(response, null, 2));
        console.log('Items do movimento:', response.items);
        console.log('Movement Items:', response.movement_items);
        
        // Verifica onde estão os itens
        const items = response.items || response.movement_items || [];
        console.log('Items encontrados:', items);
        
        setMovement(response);
        setItems(items);
        setFormData({
          date: format(new Date(response.movement_date), 'yyyy-MM-dd'),
          description: response.description,
          person: response.person,
          payments: response.payments || [],
        });
      } catch (error) {
        console.error('Erro ao carregar movimento:', error);
        enqueueSnackbar('Erro ao carregar movimento', { variant: 'error' });
        navigate('/movements');
      } finally {
        setLoading(false);
      }
    };

    fetchMovement();
  }, [id]);

  // Funções para buscar itens
  const handleSearchItems = async (query) => {
    if (!query) {
      setSearchItems([]);
      return;
    }

    try {
      const response = await itemsService.search(query);
      setSearchItems(response.items);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      enqueueSnackbar('Erro ao buscar itens', { variant: 'error' });
    }
  };

  const handleItemSelect = (event, newValue) => {
    setSelectedItem(newValue);
    if (newValue) {
      setUnitPrice(newValue.price || 0);
    }
  };

  const handleAddItem = async () => {
    if (!selectedItem) {
      enqueueSnackbar('Selecione um item', { variant: 'warning' });
      return;
    }

    try {
      console.log('Adicionando item:', {
        item_id: selectedItem.item_id,
        quantity: quantity,
        unit_price: unitPrice,
        description: selectedItem.name
      });
      
      await movementsService.addItem(id, {
        item_id: selectedItem.item_id,
        quantity: quantity,
        unit_price: unitPrice,
        description: selectedItem.name
      });

      // Limpa os campos após adicionar
      setSelectedItem(null);
      setQuantity(1);
      setUnitPrice(0);
      
      // Espera um pouco antes de recarregar para dar tempo da API processar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recarrega o movimento para atualizar a lista de itens
      const updatedMovement = await movementsService.get(id);
      console.log('Movimento atualizado (estrutura completa):', JSON.stringify(updatedMovement, null, 2));
      console.log('Items atualizados:', updatedMovement.items);
      console.log('Movement Items atualizados:', updatedMovement.movement_items);
      
      // Verifica onde estão os itens
      const items = updatedMovement.items || updatedMovement.movement_items || [];
      console.log('Items encontrados após atualização:', items);
      
      setItems(items);
      
      enqueueSnackbar('Item adicionado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      enqueueSnackbar('Erro ao adicionar item', { variant: 'error' });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      console.log('Removendo item:', itemId);
      await movementsService.removeItem(id, itemId);
      
      // Recarrega o movimento para atualizar a lista de itens
      const updatedMovement = await movementsService.get(id);
      console.log('Movimento atualizado após remover item:', updatedMovement);
      setItems(updatedMovement.items || []);
      
      enqueueSnackbar('Item removido com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      enqueueSnackbar('Erro ao remover item', { variant: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepara os dados para envio
      const dataToSend = {
        ...formData,
        movement_date: formData.date,
        items: items.map(item => ({
          item_id: item.item_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        })),
        payments: formData.payments.map(payment => ({
          payment_method_id: Number(payment.payment_method_id),
          installments: Number(payment.installments),
          due_date: payment.due_date,
          amount: Number(payment.amount)
        }))
      };
      
      await movementsService.update(id, dataToSend);
      enqueueSnackbar('Movimento atualizado com sucesso!', { variant: 'success' });
      navigate('/movements');
    } catch (error) {
      console.error('Erro ao atualizar movimento:', error);
      enqueueSnackbar('Erro ao atualizar movimento', { variant: 'error' });
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Editar Movimento #{id}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Data"
                type="date"
                value={formData.date}
                onChange={handleChange('date')}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descrição"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        value={selectedItem}
                        onChange={handleItemSelect}
                        onInputChange={(event, newInputValue) => {
                          handleSearchItems(newInputValue);
                        }}
                        options={searchItems}
                        getOptionLabel={(option) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => option?.item_id === value?.item_id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Buscar Item"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <TextField
                        label="Quantidade"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        fullWidth
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Preço Unitário"
                        type="number"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Number(e.target.value))}
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddItem}
                        fullWidth
                      >
                        Adicionar
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {items.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                    Itens do Movimento
                  </Typography>

                  {items.map((item) => (
                    <Card key={item.item_id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">{item.name}</Typography>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Typography>Quantidade: {item.quantity}</Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography>Preço: R$ {item.unit_price}</Typography>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveItem(item.item_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/movements')}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Salvar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MovementEdit;
