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
  Checkbox,
  FormControlLabel,
  MenuItem
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
import { personsService, itemsService, movementsService, paymentMethodService } from '../services/api';
import { useSnackbar } from 'notistack';

const NewMovement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  console.log('🚨 NEW MOVEMENT EXPRESS - LOCATION:', {
    pathname: location.pathname,
    search: location.search,
    state: location.state
  });

  useEffect(() => {
    console.log('🚨 NEW MOVEMENT EXPRESS - MOUNTED:', {
      pathname: location.pathname,
      search: location.search
    });
  }, [location]);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    person: null,
    item: null,
    amount: '',
    paymentMethod: null,
    nfse: false,
    boleto: true,
    notificar: true,
  });

  const setState = useState(formData)[1];

  const setFormDataCallback = useCallback((updater) => {
    const newState = typeof updater === 'function' 
      ? updater(formData) 
      : updater;
    
    console.log('setFormData chamado:', {
      previousState: formData,
      newState: newState
    });

    // Chama o setState original
    setState(newState);
  }, [formData]);

  // Log de estado inicial com mais detalhes
  useEffect(() => {
    console.log('Estado inicial do formulário:', JSON.stringify(formData, null, 2));
    
    // Verificar parâmetros da URL
    const searchParams = new URLSearchParams(location.search);
    const itemId = searchParams.get('itemId');
    const description = searchParams.get('description');

    console.log('Item ID da URL:', itemId);
    console.log('Descrição da URL:', description);

    // Se houver descrição na URL, atualizar o estado
    if (description) {
      setFormData(prev => ({
        ...prev,
        description: description
      }));
    }
  }, []);

  // Estados para as opções de autocomplete
  const [personOptions, setPersonOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
  const [loading, setLoading] = useState({
    persons: false,
    items: false
  });

  // Carregar item padrão
  useEffect(() => {
    const loadDefaultItem = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const itemId = searchParams.get('itemId');
        
        if (itemId) {
          const response = await itemsService.getById(itemId);
          if (response && response.data) {
            setFormDataCallback(prev => ({
              ...prev,
              item: response.data,
              amount: response.data.price.toString()
            }));
            setItemOptions([response.data]);
          }
        } else {
          const defaultItem = await itemsService.getById(3);
          setFormDataCallback(prev => ({
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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodService.getAll({ 
          page: 1, 
          limit: 100, 
          active: true 
        });
        
        const formattedMethods = response.data.map(method => ({
          id: method.payment_method_id,
          name: method.method_name
        }));
        
        setPaymentMethodOptions(formattedMethods);
      } catch (error) {
        console.error('Erro ao buscar formas de pagamento:', error);
        // toast.error('Erro ao carregar formas de pagamento');
      }
    };

    fetchPaymentMethods();
  }, []);

  // Função para buscar pessoas
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
        console.log('Resposta da busca de pessoas:', response);
        
        // Verificação robusta para garantir que items seja um array
        const personResults = Array.isArray(response.items) 
          ? response.items 
          : (response.items?.data || []);
        
        console.log('Resultados de pessoas processados:', personResults);
        
        setPersonOptions(personResults);
      } catch (error) {
        console.error('Erro detalhado ao buscar pessoas:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      // Validações básicas
      if (!formData.person) {
        enqueueSnackbar('Selecione uma pessoa', { variant: 'error' });
        return;
      }

      if (!formData.item) {
        enqueueSnackbar('Selecione um item', { variant: 'error' });
        return;
      }

      if (!formData.paymentMethod) {
        enqueueSnackbar('Selecione um método de pagamento', { variant: 'error' });
        return;
      }

      if (!formData.amount || isNaN(parseFloat(formData.amount))) {
        enqueueSnackbar('Informe um valor válido', { variant: 'error' });
        return;
      }

      const payload = {
        person_id: formData.person.id || formData.person.person_id,
        item_id: formData.item.id || formData.item.item_id,
        payment_method_id: formData.paymentMethod.id,
        description: formData.description || '',
        amount: formData.amount,
        nfse: formData.nfse,
        boleto: formData.boleto,
        notificar: formData.notificar
      };

      console.log('🚀 Detalhes da Submissão');
      console.log('Payload completo:', payload);

      const response = await movementsService.create(payload);
      
      enqueueSnackbar('Movimento criado com sucesso!', { variant: 'success' });
      
      // Limpar formulário
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        person: null,
        item: null,
        amount: '',
        paymentMethod: null,
        nfse: false,
        boleto: true,
        notificar: true,
      });
    } catch (error) {
      console.error('🚨 Erro detalhado:', error);
      
      // Tratamento de erro específico
      let errorMessage = 'Erro desconhecido ao criar movimento';
      
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.log('Detalhes da resposta de erro:', error.response.data);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.errors) {
          // Caso a API retorne uma lista de erros
          errorMessage = error.response.data.errors.map(err => err.message).join(', ');
        } else {
          errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      } else {
        // Algo aconteceu ao configurar a requisição
        errorMessage = error.message || 'Erro ao processar a requisição';
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleChange = (field) => (event, newValue) => {
    console.log(`Mudança no campo ${field}:`, {
      event: event,
      newValue: newValue,
      currentValue: formData[field],
      eventType: event?.type,
      eventTarget: event?.target
    });

    // Log específico para inputs de texto
    if (event?.target && (event.target.type === 'text' || event.target.type === 'textarea')) {
      console.log(`Input de texto ${field}:`, {
        value: event.target.value,
        name: event.target.name
      });
    }

    setFormData(prev => {
      const updatedState = {
        ...prev,
        [field]: newValue !== undefined ? newValue : 
                 (event?.target?.value !== undefined ? event.target.value : prev[field]),
        // Se selecionou um item, atualiza o valor automaticamente
        ...(field === 'item' && newValue ? { amount: newValue.price.toString() } : {})
      };

      console.log(`Estado atualizado após mudança em ${field}:`, updatedState);
      return updatedState;
    });
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
    console.log(`Renderizando campo ${field}:`, { 
      options: options || [], 
      loading: loading || false 
    });

    return (
      <Autocomplete
        value={formData[field]}
        onChange={handleChange(field)}
        options={options || []}
        getOptionLabel={(option) => {
          if (!option) return '';
          
          if (field === 'person') {
            return option.fantasy_name 
              ? `${option.fantasy_name} (${option.full_name || 'Sem nome completo'})` 
              : (option.full_name || 'Pessoa sem nome');
          }
          if (field === 'item') {
            return `${option.name || 'Item sem nome'} - ${option.code || 'Sem código'}`;
          }
          return option.name || 'Sem nome';
        }}
        onInputChange={(event, value) => {
          console.log(`Input change ${field}:`, value);
          if (onInputChange) {
            onInputChange(value);
          }
        }}
        loading={loading || false}
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
          />
        )}
        noOptionsText="Nenhuma opção encontrada"
        clearOnBlur
        handleHomeEndKeys
      />
    );
  };

  const handleGenerateBoleto = async () => {
    try {
      // Verificar se o movimento já foi criado
      if (!formData.id) {
        enqueueSnackbar('Primeiro salve o movimento antes de gerar o boleto', { variant: 'warning' });
        return;
      }

      // Chamar o serviço para gerar boleto
      const boleto = await movementsService.generateBoleto(formData.id);
      
      enqueueSnackbar('Boleto gerado com sucesso!', { variant: 'success' });
      
      // Opcional: Atualizar o movimento para mostrar o novo boleto
      // Você pode adicionar lógica adicional aqui se precisar recarregar os dados
    } catch (error) {
      enqueueSnackbar('Erro ao gerar boleto: ' + error.message, { variant: 'error' });
    }
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
                </Box>

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
                
                <TextField
                  fullWidth
                  label="Valor"
                  variant="outlined"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange('amount')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                />
                
                <Autocomplete
                  value={formData.paymentMethod}
                  onChange={handleChange('paymentMethod')}
                  options={paymentMethodOptions}
                  getOptionLabel={(option) => option.name || 'Sem nome'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Forma de Pagamento"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaymentIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={`payment-method-${option.id}`}>
                      {option.name}
                    </li>
                  )}
                  noOptionsText="Nenhuma opção encontrada"
                  clearOnBlur
                  handleHomeEndKeys
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.nfse}
                        onChange={handleChange('nfse')}
                      />
                    }
                    label="NFSE"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.boleto}
                        onChange={handleChange('boleto')}
                      />
                    }
                    label="Boleto"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notificar}
                        onChange={handleChange('notificar')}
                      />
                    }
                    label="Notificar"
                  />
                </Box>
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
              {formData.id && !formData.boletos?.length && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    px: 4,
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    transition: 'transform 0.2s',
                  }}
                  onClick={handleGenerateBoleto}
                >
                  Gerar Boleto
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewMovement;
