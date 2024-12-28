import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
  InputAdornment,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { personsService, itemsService, movementsService } from '../services/api';

const NewMovement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    person: null,
    item: null,
    amount: '',
    paymentMethod: null,
  });

  // Estados para as opções de autocomplete
  const [personOptions, setPersonOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [loading, setLoading] = useState({
    persons: false,
    items: false
  });

  // Mock data - substituir por chamadas à API
  const mockPaymentMethods = [
    { id: 1, name: 'Dinheiro' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Boleto' },
  ];

  // Carregar item padrão
  useEffect(() => {
    const loadDefaultItem = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const itemId = searchParams.get('itemId');
        
        if (itemId) {
          const response = await itemsService.getById(itemId);
          if (response && response.data) {
            setFormData(prev => ({
              ...prev,
              item: response.data,
              amount: response.data.price.toString()
            }));
            setItemOptions([response.data]);
          }
        } else {
          const defaultItem = await itemsService.getById(3);
          setFormData(prev => ({
            ...prev,
            item: defaultItem,
            amount: defaultItem.price.toString()
          }));
          setItemOptions([defaultItem]);
        }
      } catch (error) {
        console.error('Erro ao carregar item padrão:', error);
        // Não mostrar erro ao usuário se for apenas erro de carregamento do item padrão
        // enqueueSnackbar('Erro ao carregar item padrão', { variant: 'error' });
      }
    };

    loadDefaultItem();
  }, [location.search]);

  // Função para buscar pessoas
  const searchPersons = useCallback(
    debounce(async (query) => {
      try {
        setLoading(prev => ({ ...prev, persons: true }));
        const response = await personsService.search(query);
        setPersonOptions(response.items || []);
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
        setPersonOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, persons: false }));
      }
    }, 300),
    []
  );

  // Função para buscar itens
  const searchItems = useCallback(
    debounce(async (query) => {
      try {
        console.log('Iniciando busca de itens com query:', query);
        setLoading(prev => ({ ...prev, items: true }));
        const response = await itemsService.search(query);
        console.log('Resposta da busca de itens:', response);
        setItemOptions(response.items || []);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        setItemOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, items: false }));
      }
    }, 300),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const movementData = {
        description: formData.description,
        person_id: formData.person?.id,
        payment_method_id: formData.paymentMethod?.id,
        amount: formData.amount,
        item_id: formData.item?.item_id || 3, // Usa o item selecionado ou o padrão (3)
      };

      await movementsService.create(movementData);
      navigate('/movements');
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      // TODO: Adicionar feedback visual do erro
    }
  };

  const handleChange = (field) => (event, newValue) => {
    console.log(`Mudança no campo ${field}:`, newValue);
    setFormData(prev => ({
      ...prev,
      [field]: newValue,
      // Se selecionou um item, atualiza o valor automaticamente
      ...(field === 'item' && newValue ? { amount: newValue.price.toString() } : {})
    }));
  };

  const renderSearchField = (
    field,
    label,
    options,
    icon,
    onInputChange,
    loading = false,
    placeholder = "Pesquisar..."
  ) => {
    console.log(`Renderizando campo ${field}:`, { options, loading });
    return (
      <Autocomplete
        value={formData[field]}
        onChange={handleChange(field)}
        options={options}
        getOptionLabel={(option) => {
          if (!option) return '';
          
          if (field === 'person') {
            return option.fantasy_name ? `${option.fantasy_name} (${option.full_name})` : option.full_name;
          }
          if (field === 'item') {
            return `${option.name} - ${option.code}`;
          }
          return option.name;
        }}
        onInputChange={(event, value) => {
          console.log(`Input change ${field}:`, value);
          if (onInputChange) {
            onInputChange(value);
          }
        }}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    {icon}
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
            fullWidth
          />
        )}
        renderOption={(props, option) => {
          if (field === 'person') {
            return (
              <li {...props}>
                <Box>
                  <Typography variant="body1">
                    {option.fantasy_name || option.full_name}
                  </Typography>
                  {option.fantasy_name && (
                    <Typography variant="caption" color="text.secondary">
                      {option.full_name}
                    </Typography>
                  )}
                </Box>
              </li>
            );
          }
          if (field === 'item') {
            return (
              <li {...props}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="body1">
                      {option.name}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="600">
                      R$ {parseFloat(option.price).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {option.code}
                    </Typography>
                    {option.description && option.description !== option.name && (
                      <>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </li>
            );
          }
          return <li {...props}>{option.name}</li>;
        }}
        noOptionsText="Nenhum resultado encontrado"
        loadingText="Carregando..."
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          
          if (field === 'person') {
            return option.id === value.id;
          }
          if (field === 'item') {
            return option.item_id === value.item_id;
          }
          return option.id === value.id;
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate('/movements')}
            sx={{ mr: 2, backgroundColor: 'white', boxShadow: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="600">
            Nova Movimentação
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Seção Principal */}
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Data"
                    type="date"
                    value={formData.date}
                    onChange={handleChange('date')}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />

                  <TextField
                    label="Valor"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange('amount')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="action" sx={{ mr: 1 }} />
                          R$
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                </Box>

                <TextField
                  label="Descrição"
                  value={formData.description}
                  onChange={handleChange('description')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />

                {renderSearchField(
                  'person',
                  'Pessoa',
                  personOptions,
                  <PersonIcon color="action" />,
                  searchPersons,
                  loading.persons
                )}
                
                {renderSearchField(
                  'item',
                  'Item',
                  itemOptions,
                  <InventoryIcon color="action" />,
                  searchItems,
                  loading.items
                )}
                
                {renderSearchField(
                  'paymentMethod',
                  'Forma de Pagamento',
                  mockPaymentMethods,
                  <PaymentIcon color="action" />
                )}
              </CardContent>
            </Card>

            {/* Botões */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/movements')}
                size="large"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                  transition: 'transform 0.2s',
                }}
              >
                Salvar
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewMovement;
