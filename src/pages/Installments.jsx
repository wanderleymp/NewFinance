// DIAGNÓSTICO CRÍTICO
// console.error('🚨 DIAGNÓSTICO CRÍTICO: MÓDULO INSTALLMENTS CARREGADO');
window.debugInstallments = {
  log: (message) => console.error(`🚨 DEBUG INSTALLMENTS: ${message}`),
  state: {}
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Alert,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarMonthIcon,
  FilterList as FilterListIcon,
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon, 
  Share as ShareIcon,
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Add, 
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { 
  AttachMoney as MoneyIcon, 
  CheckCircle as PaidIcon, 
  PendingActions as PendingIcon 
} from '@mui/icons-material';
import { 
  SentimentDissatisfied as SentimentDissatisfiedIcon, 
  ErrorOutline as ErrorOutlineIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import { 
  parseISO, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  addDays, 
  format,
  isValid,
  differenceInDays,
  isPast,
  isSameDay,
  addMonths,
  addWeeks,
  isAfter
} from 'date-fns';
import { useSnackbar } from 'notistack';
import { installmentsService, updateInstallmentDueDate } from '../services/api';
import api from '../services/api'; // Import the api instance
import axios from 'axios'; // Import axios instance

// Adicionar log de diagnóstico global
// console.error('🚨 INSTALLMENTS MODULE LOADED GLOBALLY');

// Forçar log de diagnóstico
// window.debugInstallments.log('Importações carregadas');

// Função para limpar valor de moeda
const cleanCurrencyValue = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos, exceto vírgula e ponto
  const cleanedValue = value.toString().replace(/[^\d,\.]/g, '');
  
  // Substitui vírgula por ponto se necessário
  const normalizedValue = cleanedValue.replace(',', '.');
  
  // Converte para número com duas casas decimais
  const result = parseFloat(parseFloat(normalizedValue).toFixed(2));
  
  return isNaN(result) ? 0 : result;
};

// Função utilitária para parsear datas com segurança
const safeParseDateString = (dateString) => {
  if (!dateString) return null;
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Erro ao parsear data:', dateString, error);
    return null;
  }
};

// Função segura para formatar data
const safeFormatDate = (date) => {
  try {
    // Log para diagnóstico
    console.log('🔍 Formatando data:', { 
      originalDate: date, 
      type: typeof date,
      isDate: date instanceof Date,
      isValidDate: date && !isNaN(new Date(date))
    });

    // Se for uma string, converte para Date considerando o timezone local
    const parsedDate = typeof date === 'string' 
      ? safeParseDateString(date)  // Usa safeParseDateString com formato específico
      : date;
    
    // Verifica se é uma data válida
    return parsedDate && !isNaN(parsedDate) 
      ? format(parsedDate, 'dd/MM/yyyy') 
      : 'Data inválida';
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

// Função para formatar valor monetário
const formatCurrency = (value) => {
  if (!value) return '0,00';
  
  // Converte para número se for string
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(',', '.')) 
    : value;
  
  // Verifica se é um número válido
  if (isNaN(numericValue)) return '0,00';
  
  // Formata com duas casas decimais
  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function Installments() {
  // Estados para diálogos e edições
  const [editDueDateDialogOpen, setEditDueDateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallmentForDueDateEdit, setSelectedInstallmentForDueDateEdit] = useState(null);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [updateBoletoWithFees, setUpdateBoletoWithFees] = useState(false);
  const [updateBoletoOnly, setUpdateBoletoOnly] = useState(false);
  
  // Estados para pagamento
  const [paymentValue, setPaymentValue] = useState('');
  const [bankId, setBankId] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentObservation, setPaymentObservation] = useState('');
  const [paymentDate, setPaymentDate] = useState(null);
  const [juros, setJuros] = useState('0');
  const [descontos, setDescontos] = useState('0');

  // Logs de diagnóstico crítico
  // console.error('🚨 INSTALLMENTS: COMPONENTE INICIADO');
  // window.debugInstallments.log('Componente iniciado');
  
  const { enqueueSnackbar } = useSnackbar();
  // Estados de paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [installments, setInstallments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1); // Inicializa com 1 para evitar página inválida

  // Memoize complex states and calculations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimize filter states
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: '',
    full_name: ''
  });

  // Estados de carregamento e erro
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Estados para startDate e endDate
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Função para renderizar o status da parcela
  const renderInstallmentStatus = useCallback((status, daysOverdue) => {
    let chipProps = {
      size: "small",
      variant: "outlined"
    };

    if (status === 'Pendente') {
      if (daysOverdue > 0) {
        chipProps = {
          ...chipProps,
          label: 'Atrasado',
          color: 'error',
          icon: <ErrorOutlineIcon />
        };
      } else {
        chipProps = {
          ...chipProps,
          label: 'Pendente',
          color: 'warning',
          icon: <PendingIcon />
        };
      }
    } else if (status === 'Pago') {
      chipProps = {
        ...chipProps,
        label: 'Pago',
        color: 'success',
        icon: <PaidIcon />
      };
    } else {
      chipProps = {
        ...chipProps,
        label: status || 'Não definido',
        color: 'default'
      };
    }

    return <Chip {...chipProps} />;
  }, []);

  // Memoização dos dados filtrados da API
  const filteredInstallments = useMemo(() => {
    return installments || [];
  }, [installments]);

  // Função otimizada para buscar parcelas com paginação
  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ajustando os parâmetros para o formato esperado pela API
      const paginationParams = {
        page: page + 1, // Convertendo página base-0 para base-1
        limit: rowsPerPage, // Usando limit ao invés de pageSize
        sort: filters.sort || 'due_date',
        order: filters.order || 'desc',
        status: filters.status || undefined, // Removendo status vazio
        full_name: filters.full_name || undefined, // Removendo nome vazio
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      console.log('🔍 Buscando parcelas:', paginationParams);

      const result = await installmentsService.list(paginationParams);

      console.log('📊 Resultado da busca de parcelas:', {
        items: result.items.length,
        total: result.total,
        page: result.page,
        pageSize: result.limit
      });

      setInstallments(result.items);
      setTotalItems(result.total);
      setTotalPages(Math.ceil(result.total / rowsPerPage));
    } catch (error) {
      console.error('❌ Erro ao buscar parcelas:', error);
      setError(error);
      enqueueSnackbar('Erro ao carregar parcelas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  useEffect(() => {
    fetchInstallments();
  }, [fetchInstallments]);

  // Função para lidar com mudanças de data
  // Função handleDateChange: Gerencia mudanças de data com validações e atualizações síncronas
  // Objetivos:
  // 1. Garantir que a data inicial seja sempre anterior à data final
  // 2. Atualizar estados de data de forma consistente
  // 3. Manter os filtros sincronizados com os estados de data
  // 4. Fornecer logs de depuração para rastreamento
  const handleDateChange = useCallback((type, date) => {
    // Validar se a data final é sempre posterior à data inicial
    if (type === 'startDate' && date > endDate) {
      console.warn('🚨 Data inicial não pode ser posterior à data final');
      return;
    }

    if (type === 'endDate' && date < startDate) {
      console.warn('🚨 Data final não pode ser anterior à data inicial');
      return;
    }

    // Atualizar estado da data
    if (type === 'startDate') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    // Atualizar filtros de forma síncrona
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: date
    }));

    console.log(`🚨 Mudança de data ${type}:`, {
      newDate: date,
      startDate,
      endDate
    });
  }, [startDate, endDate]);

  // Renderização condicional da tabela
  const renderInstallmentsTable = useMemo(() => {
    console.log('🚨 Renderizando installments:', {
      items: installments.length,
      total: totalItems
    });

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (fetchError) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={400}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Erro ao carregar parcelas
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
            {fetchError}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchInstallments}
            startIcon={<RefreshIcon />}
          >
            Tentar Novamente
          </Button>
        </Box>
      );
    }

    // Verificar se não há parcelas
    // Renderizar mensagem quando não houver parcelas
    if (!installments || installments.length === 0) {
      return (
        <TableRow>
          <TableCell 
            colSpan={8} 
            sx={{ 
              border: 'none',
              height: '400px',
              p: 4
            }}
          >
            <Stack 
              direction="column" 
              alignItems="center" 
              justifyContent="center" 
              spacing={2}
              sx={{ 
                height: '100%',
                textAlign: 'center'
              }}
            >
              <SentimentDissatisfiedIcon 
                color="disabled" 
                sx={{ fontSize: 80 }} 
              />
              <Typography 
                variant="h6" 
                color="textSecondary" 
              >
                Nenhuma parcela encontrada
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                align="center"
              >
                Não há parcelas que correspondam aos filtros selecionados.
              </Typography>
            </Stack>
          </TableCell>
        </TableRow>
      );
    }

    return (installments || []).map(installment => {
      // Log completo do registro
      console.log('🚨 REGISTRO COMPLETO:', {
        ...installment,
        due_date_original: installment.due_date,
        due_date_formatted: safeFormatDate(installment.due_date)
      });

      return (
        <TableRow key={installment.installment_id} hover>
          <TableCell padding="checkbox">
            <Checkbox 
              checked={false} 
              onChange={() => {}}
            />
          </TableCell>
          <TableCell>{installment.installment_id}</TableCell>
          <TableCell>{installment.movement_id}</TableCell>
          <TableCell>{installment.full_name}</TableCell>
          <TableCell>
            {safeFormatDate(installment.due_date)}
          </TableCell>
          <TableCell>R$ {formatCurrency(installment.amount)}</TableCell>
          <TableCell>
            {renderInstallmentStatus(installment.status)}
          </TableCell>
          <TableCell>
            <Stack direction="row" spacing={1}>
              {(installment.boletos || []).map((boleto) => 
                boleto.status === 'A_RECEBER' && (
                  <IconButton 
                    key={boleto.boleto_id}
                    size="small" 
                    onClick={() => window.open(boleto.boleto_url, '_blank')}
                    title="Visualizar Boleto"
                  >
                    <ReceiptIcon fontSize="small" />
                  </IconButton>
                )
              )}
            </Stack>
          </TableCell>
          <TableCell align="right">
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              justifyContent: 'flex-end' 
            }}>
              {/* Botão de Gerar Boleto */}
              {installment.status === 'Pendente' && 
               (!installment.boletos || 
                !installment.boletos.some(boleto => boleto?.status === 'A_RECEBER')) && (
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={() => handleGenerateBoleto(installment)} 
                  title="Gerar Boleto"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'primary.light',
                    '&:hover': { 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText' 
                    }
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              )}

              {/* Botão de Notificação */}
              {console.log('🚨 CONDIÇÕES DE NOTIFICAÇÃO:', {
                installmentId: installment.installment_id,
                status: installment.status,
                boletosLength: installment.boletos?.length,
                boletosAReceber: installment.boletos?.some(boleto => boleto?.status === 'A_RECEBER')
              })}
              {installment.status === 'Pendente' && 
               installment.boletos && 
               installment.boletos.length > 0 && 
               installment.boletos.some(boleto => boleto?.status === 'A_RECEBER') && (
                <IconButton 
                  size="small"
                  color="warning"
                  onClick={() => handleNotifyInstallment(installment)} 
                  disabled={false}
                  title="Notificar Boleto Pendente"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'warning.light',
                    '&:hover': { 
                      bgcolor: 'warning.light', 
                      color: 'warning.contrastText' 
                    }
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              )}

              {/* Botão de Liquidar */}
              {installment.status === 'Pendente' && (
                <IconButton 
                  size="small"
                  color="success"
                  onClick={() => {
                    setSelectedInstallmentForPayment(installment);
                    const valorPagamento = formatCurrency(installment.balance || installment.amount);
                    setPaymentValue(valorPagamento);
                    setPaymentMethod('');
                    setPaymentObservation('');
                    setBankId('2');
                    setPaymentDate(new Date());
                    setJuros('0');
                    setDescontos('0');
                    setPaymentDialogOpen(true);
                  }}
                  title="Liquidar Parcela"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'success.light',
                    '&:hover': { 
                      bgcolor: 'success.light', 
                      color: 'success.contrastText' 
                    }
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              )}

              {/* Botão de Alterar Vencimento */}
              {installment.status === 'Pendente' && (
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={() => handleEditDueDate(installment)}
                  title="Alterar Vencimento"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'primary.light',
                    '&:hover': { 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText' 
                    }
                  }}
                >
                  <EventIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </TableCell>
        </TableRow>
      );
    });
  }, [installments, isLoading, fetchError]);

  // Efeito para buscar dados quando os filtros ou paginação mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      // Validar página antes de fazer a requisição
      const validPage = Math.max(0, Math.min(page, totalPages - 1));
      if (validPage !== page) {
        setPage(validPage);
        return;
      }

      fetchInstallments();
    }, 300); // Debounce de 300ms para evitar chamadas excessivas

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, filters.startDate, filters.endDate, filters.status, filters.full_name, totalPages]);

  useEffect(() => {
    // Definir filtro padrão para a semana financeira
    const { startDate, endDate } = calculateFinancialWeek();

    // Atualizar estados de data
    setStartDate(startDate);
    setEndDate(endDate);

    // Atualizar filtros
    setFilters(prev => ({
      ...prev,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }));
  }, []);

  // Função para calcular a semana financeira (sábado anterior até sexta-feira atual)
  const calculateFinancialWeek = () => {
    const today = new Date();
    
    // Encontra o sábado anterior
    const lastSaturday = subDays(today, (today.getDay() + 1) % 7);
    
    // Encontra a sexta-feira atual
    const currentFriday = addDays(lastSaturday, 5);
    
    return {
      startDate: startOfDay(lastSaturday),
      endDate: endOfDay(currentFriday)
    };
  };

  // Função para calcular juros e multa
  const calculateInterestAndPenalty = useCallback((originalDueDate, newDueDate, originalBalance) => {
    console.log('🚨 CÁLCULO DE JUROS E MULTA:', {
      originalDueDate,
      newDueDate,
      originalBalance
    });

    // Converte para Date se for string
    const originalDate = typeof originalDueDate === 'string' 
      ? safeParseDateString(originalDueDate) 
      : originalDueDate;
    const calculatedNewDate = typeof newDueDate === 'string' 
      ? safeParseDateString(newDueDate) 
      : newDueDate;

    // Calcula dias de atraso
    const daysOverdue = differenceInDays(calculatedNewDate, originalDate);
    console.log('🚨 DIAS DE ATRASO:', daysOverdue);

    // Define taxas de juros e multa
    const interestRate = 0.01; // 1% ao mês
    const penaltyRate = 0.02; // 2% de multa

    // Calcula juros e multa
    const dailyInterestRate = interestRate / 30;
    const interest = originalBalance * (dailyInterestRate * daysOverdue);
    const penalty = originalBalance * penaltyRate;
    const totalNewBalance = originalBalance + interest + penalty;

    console.log('🚨 DETALHES DO CÁLCULO:', {
      interest,
      penalty,
      totalNewBalance
    });

    return {
      interest,
      penalty,
      totalNewBalance
    };
  }, []);

  // Função auxiliar para calcular e formatar novo valor com juros
  const handleCalculateNewAmount = useCallback((installment, newDueDate, updateWithFees) => {
    console.log('🚨 CÁLCULO DE NOVO VALOR:', {
      installment,
      newDueDate,
      updateWithFees
    });

    if (!updateWithFees) {
      console.log('🚨 RETORNANDO VALOR ORIGINAL:', formatCurrency(installment.balance));
      return formatCurrency(installment.balance);
    }

    const newBalance = calculateInterestAndPenalty(
      installment.due_date, 
      newDueDate, 
      parseFloat(cleanCurrencyValue(installment.balance))
    );

    console.log('🚨 NOVO VALOR CALCULADO:', formatCurrency(newBalance));
    return formatCurrency(newBalance);
  }, [calculateInterestAndPenalty]);

  const handlePageChange = (event, newPage) => {
    console.log('🔄 Mudança de página:', { 
      currentPage: page, 
      newPage 
    });
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('🔄 Mudança de linhas por página:', { 
      currentRowsPerPage: rowsPerPage, 
      newRowsPerPage 
    });
    setRowsPerPage(newRowsPerPage);
    setPage(0);  // Resetar para primeira página
  };

  const calculateInstallmentsSummary = useCallback((installmentsData) => {
    let totalReceivable = 0;
    let totalReceived = 0;
    let totalOverdue = 0;

    installmentsData.forEach(installment => {
      const amount = installment.amount || 0;
      
      switch (installment.status) {
        case 'Pago':
          totalReceived += amount;
          break;
        case 'Vencido':
          totalOverdue += amount;
          break;
        default:
          totalReceivable += amount;
      }
    });

    return {
      totalReceivable,
      totalReceived,
      totalOverdue
    };
  }, []);

  const installmentsSummary = useMemo(() => {
    return calculateInstallmentsSummary(installments);
  }, [installments]);

  const handleSelectAllInstallments = (event) => {
    // console.log('Seleção de todas as parcelas:', event.target.checked);
    if (event.target.checked) {
      const allInstallmentIds = installments.map(item => item.installment_id);
      // setSelectedInstallments(allInstallmentIds);
    } else {
      // setSelectedInstallments([]);
    }
  };

  const handleSelectInstallment = (installmentId) => {
    // console.log('Seleção de parcela:', installmentId);
    // setSelectedInstallments(prev => 
    //   prev.includes(installmentId)
    //     ? prev.filter(id => id !== installmentId)
    //     : [...prev, installmentId]
    // );
  };

  const handleNotifySelectedInstallments = async () => {
    // console.log('Notificação de parcelas selecionadas:', selectedInstallments);
    // if (selectedInstallments.length === 0) {
    //   enqueueSnackbar('Nenhuma parcela selecionada', { variant: 'warning' });
    //   return;
    // }

    // setIsNotifyingSelected(true);

    // try {
    //   const notificationPromises = selectedInstallments.map(installmentId => 
    //     axios.post(
    //       'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/parcela', 
    //       { installment_id: installmentId },
    //       {
    //         headers: {
    //           'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
    //           'Content-Type': 'application/json'
    //         }
    //       }
    //     )
    //   );

    //   // Simula um tempo de processamento
    //   await new Promise(resolve => setTimeout(resolve, 1500));

    //   await Promise.all(notificationPromises);
      
    //   enqueueSnackbar(`Notificação enviada para ${selectedInstallments.length} parcela(s)`, { 
    //     variant: 'success',
    //     autoHideDuration: 2000 // Tempo específico para auto-hide
    //   });
      
    //   // setSelectedInstallments([]); // Limpa seleção após notificação
    // } catch (error) {
    //   // console.error('Erro ao enviar notificações:', error);
    //   enqueueSnackbar('Erro ao enviar notificações', { variant: 'error' });
    // } finally {
    //   setIsNotifyingSelected(false);
    // }
  };

  const handleGenerateBoleto = useCallback(async (installment) => {
    // Validações iniciais
    if (!installment?.installment_id) {
      console.error('🚨 Tentativa de gerar boleto sem parcela válida:', installment);
      enqueueSnackbar('Erro: Dados da parcela inválidos', { 
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }

    // Valida status da parcela
    if (installment.status !== 'Pendente') {
      enqueueSnackbar('Boleto só pode ser gerado para parcelas pendentes', { 
        variant: 'warning',
        autoHideDuration: 5000
      });
      return;
    }

    // Verifica se já existe boleto
    if (installment.boletos?.length > 0) {
      enqueueSnackbar('Esta parcela já possui um boleto gerado', { 
        variant: 'info',
        autoHideDuration: 5000
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🚨 Iniciando geração de boleto:', {
        installmentId: installment.installment_id,
        status: installment.status,
        dueDate: installment.due_date,
        amount: installment.amount
      });

      // Tenta gerar o boleto
      const response = await installmentsService.generateBoleto(installment.installment_id);
      
      // Valida a resposta
      if (!response?.boleto_id) {
        throw new Error('Resposta inválida: boleto não foi gerado corretamente');
      }

      console.log('🚨 Boleto gerado com sucesso:', {
        boletoId: response.boleto_id,
        boletoNumber: response.boleto_number,
        dueDate: response.due_date
      });
      
      // Atualiza a lista de parcelas
      await fetchInstallments();
      
      enqueueSnackbar('Boleto gerado com sucesso!', { 
        variant: 'success',
        autoHideDuration: 3000
      });
    } catch (error) {
      console.error('🚨 Erro detalhado ao gerar boleto:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Mensagem de erro amigável para o usuário
      const errorMessage = error.message || 'Erro ao gerar boleto. Tente novamente.';

      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, fetchInstallments]);

  const handleEditDueDate = useCallback((installment) => {
    console.log('🚨 INICIANDO EDIÇÃO DE VENCIMENTO:', installment);

    // Limpa o valor original do balance
    const originalBalance = parseFloat(cleanCurrencyValue(installment.amount));

    // Configura a data original e a nova data
    const originalDueDate = new Date(installment.due_date);
    const newDueDate = isPast(originalDueDate) ? new Date() : originalDueDate;

    // Calcula juros e multa se a data original estiver no passado
    let newBalance = originalBalance;
    let interestDetails = { interest: 0, penalty: 0 };
    
    if (isPast(originalDueDate)) {
      interestDetails = calculateInterestAndPenalty(originalDueDate, newDueDate, originalBalance);
      newBalance = interestDetails.totalNewBalance;
    }

    console.log('🚨 DETALHES DE EDIÇÃO DE VENCIMENTO:', {
      originalBalance,
      newBalance,
      interestDetails
    });

    // Atualiza o estado para abertura do modal
    setSelectedInstallmentForDueDateEdit(installment);
    setNewDueDate(newDueDate);
    
    // Define o novo valor no input
    setNewAmount(formatCurrency(newBalance));
    
    // Define se deve atualizar com juros
    setUpdateBoletoWithFees(isPast(originalDueDate));
    setUpdateBoletoOnly(isPast(originalDueDate));
    
    // Abre o modal com o novo valor calculado
    setEditDueDateDialogOpen(true);
  }, [calculateInterestAndPenalty, cleanCurrencyValue, formatCurrency, isPast]);

  const handleUpdateDueDate = async (installmentId, newDueDate, newAmount, updateBoletoWithFees, updateBoletoOnly) => {
    // console.log('Atualização de data de vencimento:', {
    //   installmentId,
    //   newDueDate,
    //   newAmount,
    //   updateBoletoWithFees,
    //   updateBoletoOnly
    // });
    try {
      // Ativa o estado de carregamento
      // setIsUpdatingDueDate(true);

      // Converte a data para o formato ISO
      const formattedDueDate = format(newDueDate, 'yyyy-MM-dd');

      // console.log('Iniciando atualização de data de vencimento:', { 
      //   installmentId, 
      //   newDueDate: formattedDueDate, 
      //   newAmount,
      //   updateBoletoWithFees,
      //   updateBoletoOnly,
      //   apiSource: 'N8N' 
      // });

      // Usa N8N como API principal para este submite específico
      const result = await updateInstallmentDueDate(installmentId, formattedDueDate, newAmount, updateBoletoWithFees, updateBoletoOnly, 'N8N');
      
      // console.log('Resultado da atualização de data de vencimento:', result);

      // Atualiza o estado local ou mostra feedback
      enqueueSnackbar('Data de vencimento atualizada com sucesso!', { variant: 'success' });
      
      // Recarrega os dados de installments
      await fetchInstallments();

      // Fecha o modal de edição de data
      setEditDueDateDialogOpen(false);
    } catch (error) {
      // console.error('Erro detalhado ao atualizar data de vencimento:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status
      // });
      enqueueSnackbar('Erro ao atualizar data de vencimento', { variant: 'error' });
    } finally {
      // Desativa o estado de carregamento
      // setIsUpdatingDueDate(false);
    }
  };

  const handleOpenPaymentDialog = (installment) => {
    // Só abre para status Pendente
    if (installment.status !== 'Pendente') return;

    setSelectedInstallmentForPayment(installment);
    setPaymentValue(formatCurrency(installment.amount));
    setPaymentMethod('');
    setPaymentObservation('');
    setBankId('2');
    setPaymentDate(new Date());
    setJuros('0');
    setDescontos('0');
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      // Validar campos obrigatórios
      if (!selectedInstallmentForPayment || !paymentValue) {
        enqueueSnackbar('Preencha todos os campos obrigatórios', { variant: 'warning' });
        return;
      }

      const paymentData = {
        valor: cleanCurrencyValue(paymentValue),
        date: format(paymentDate || new Date(), 'yyyy-MM-dd'),
        bank_id: parseInt(bankId || '2', 10),
        juros: cleanCurrencyValue(juros),
        descontos: cleanCurrencyValue(descontos)
      };

      console.log('🚨 Dados de pagamento:', {
        installmentId: selectedInstallmentForPayment.installment_id,
        paymentData
      });

      // Chamar serviço de pagamento
      const result = await api.put(`/installments/${selectedInstallmentForPayment.installment_id}/payment`, paymentData);
      
      console.log('✅ Resposta do pagamento:', result);

      enqueueSnackbar('Pagamento confirmado com sucesso!', { variant: 'success' });
      fetchInstallments();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('❌ Erro no pagamento:', error);
      enqueueSnackbar(`Erro ao confirmar pagamento: ${error.response?.data?.message || error.message}`, { variant: 'error' });
    } finally {
      // Limpar estados
      setBankId('2');
      setJuros('0');
      setDescontos('0');
      setPaymentMethod('');
      setPaymentObservation('');
      setSelectedInstallmentForPayment(null);
    }
  };

  const getQuickDateRanges = () => {
    console.log('🚨 OBTENDO FAIXAS DE DATAS RÁPIDAS');
    const today = new Date();
    
    // Calcular semana financeira (sábado anterior até sexta-feira atual)
    const { startDate: financialWeekStart, endDate: financialWeekEnd } = calculateFinancialWeek();

    return [
      {
        label: 'Hoje',
        startDate: startOfDay(today),
        endDate: endOfDay(today),
        onClick: () => {
          console.log('🚨 CLICOU EM HOJE');
          handleQuickDateFilter('Hoje');
        }
      },
      {
        label: 'Semana Atual (Financeira)',
        startDate: financialWeekStart,
        endDate: financialWeekEnd,
        onClick: () => {
          console.log('🚨 CLICOU EM SEMANA FINANCEIRA');
          handleQuickDateFilter('Semana Financeira');
        }
      },
      {
        label: 'Mês Atual',
        startDate: startOfMonth(today),
        endDate: endOfMonth(today),
        onClick: () => {
          console.log('🚨 CLICOU EM MÊS ATUAL');
          handleQuickDateFilter('Este Mês');
        }
      },
      {
        label: 'Últimos 7 dias',
        startDate: startOfDay(subDays(today, 6)),
        endDate: endOfDay(today),
        onClick: () => {
          console.log('🚨 CLICOU EM ÚLTIMOS 7 DIAS');
          handleQuickDateFilter('Últimos 7 dias');
        }
      },
      {
        label: 'Últimos 30 dias',
        startDate: startOfDay(subDays(today, 29)),
        endDate: endOfDay(today),
        onClick: () => {
          console.log('🚨 CLICOU EM ÚLTIMOS 30 DIAS');
          handleQuickDateFilter('Últimos 30 dias');
        }
      }
    ];
  };

  const handleQuickDateFilter = useCallback((type) => {
    try {
      console.log('🚨 INICIANDO FILTRO RÁPIDO:', type);

      let newStartDate = null;
      let newEndDate = null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (type) {
        case 'Hoje':
          newStartDate = startOfDay(today);
          newEndDate = endOfDay(today);
          break;
        case 'Semana Financeira':
          // Semana financeira: sábado anterior até sexta-feira atual
          const { startDate: financialStart, endDate: financialEnd } = calculateFinancialWeek();
          newStartDate = financialStart;
          newEndDate = financialEnd;
          break;
        case 'Este Mês':
          newStartDate = startOfMonth(today);
          newEndDate = endOfMonth(today);
          break;
        case 'Últimos 7 Dias':
          newStartDate = startOfDay(subDays(today, 6));
          newEndDate = endOfDay(today);
          break;
        case 'Últimos 30 Dias':
          newStartDate = startOfDay(subDays(today, 29));
          newEndDate = endOfDay(today);
          break;
        default:
          console.warn('🚨 Tipo de filtro rápido não reconhecido:', type);
          return;
      }

      // Validar datas
      if (!newStartDate || !newEndDate || isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        throw new Error('Datas calculadas inválidas para o filtro: ' + type);
      }

      console.log('🚨 DATAS CALCULADAS:', { 
        type, 
        startDate: format(newStartDate, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(newEndDate, 'yyyy-MM-dd HH:mm:ss')
      });

      // Atualiza os estados de data e filtros
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setFilters(prev => ({
        ...prev,
        startDate: format(newStartDate, 'yyyy-MM-dd'),
        endDate: format(newEndDate, 'yyyy-MM-dd')
      }));

      // Dispara busca com novos filtros
      fetchInstallments();
    } catch (error) {
      console.error('🚨 Erro ao aplicar filtro rápido:', error);
      enqueueSnackbar('Erro ao aplicar filtro de data: ' + error.message, { 
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  }, [enqueueSnackbar, fetchInstallments]);

  const handleClearDateFilter = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      startDate: null,
      endDate: null
    }));
    setStartDate(null);
    setEndDate(null);
    fetchInstallments();
  }, [fetchInstallments]);

  const renderBoletoStatus = (status) => {
    // console.log('Renderizando status de boleto:', status);
    const statusColors = {
      'A_RECEBER': 'info',
      'EXPIRADO': 'error',
    };
    return <Chip 
      label={status} 
      color={statusColors[status] || 'default'} 
      size="small" 
      variant="outlined" 
    />;
  };

  const formatDateDisplay = (dateString) => {
    // console.log('Formatando data para exibição:', dateString);
    if (!dateString) return '';
    
    // Extrai apenas a parte da data sem conversão
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    
    // Mapeamento de meses para abreviações
    const monthAbbreviations = {
      '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', 
      '05': 'mai', '06': 'jun', '07': 'jul', '08': 'ago', 
      '09': 'set', '10': 'out', '11': 'nov', '12': 'dez'
    };
    
    return `${day} ${monthAbbreviations[month]} ${year}`;
  };

  const handleNotifyInstallment = async (installment) => {
    console.log('🚨 NOTIFICANDO PARCELA:', {
      installment_id: installment.installment_id,
      status: installment.status,
      boletos: installment.boletos?.map(boleto => ({
        boleto_id: boleto.boleto_id,
        status: boleto.status,
        boleto_number: boleto.boleto_number
      })),
      full_name: installment.full_name,
      due_date: installment.due_date
    });

    try {
      console.log('🚨 PREPARANDO ENVIO DE NOTIFICAÇÃO');
      const notificationPayload = {
        installment_id: installment.installment_id,
        full_name: installment.full_name,
        amount: installment.amount,
        due_date: installment.due_date,
        boleto_number: installment.boletos?.[0]?.boleto_number
      };
      const response = await axios.post('https://n8n.webhook.agilefinance.com.br/webhook/mensagem/parcela', notificationPayload, {
        headers: {
          'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
          'Content-Type': 'application/json'
        },
        timeout: 5000  // Timeout de 5 segundos
      });
      
      console.log('🚨 RESPOSTA DA NOTIFICAÇÃO:', response);

      // Simula um tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('🚨 ERRO AO ENVIAR NOTIFICAÇÃO:', {
        message: error.message,
        config: error.config,
        code: error.code,
        response: error.response,
        request: error.request
      });
      enqueueSnackbar('Erro ao enviar notificação', { variant: 'error' });
    }
  };

  const handleShareClick = (event, installment = null) => {
    // console.log('Clicando no botão de compartilhamento:', event, installment);
  };

  const handleShareClose = () => {
    // console.log('Fechando o menu de compartilhamento');
  };

  const handleWhatsAppShare = () => {
    // console.log('Compartilhando via WhatsApp');
  };

  const handleEmailShare = () => {
    // console.log('Compartilhando via Email');
  };

  const normalizeCurrencyValue = (value) => {
    // Remove caracteres não numéricos
    const numericValue = parseFloat(
      (typeof value === 'string' 
        ? value.replace(/[^\d]/g, '')
        : value
      )
    );
    
    return numericValue >= 1000 ? numericValue / 100 : numericValue;
  };

  const convertBRLToNumber = (value) => {
    // Remove pontos de milhar e substitui vírgula por ponto
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanedValue);
  };

  const isOverdueDate = false; // selectedInstallmentForDueDateEdit?.due_date && newDueDate && 
    // (
    //   // Nova data posterior à data original
    //   differenceInDays(newDueDate, new Date(selectedInstallmentForDueDateEdit.due_date)) > 0 ||
    //   // Parcela já está vencida
    //   isPast(new Date(selectedInstallmentForDueDateEdit.due_date))
    // );

  const handleUpdateDueDateWithInterestAndPenalty = useCallback(async (
    installmentId, 
    newDueDate, 
    newAmount, 
    updateBoletoWithFees, 
    updateBoletoOnly
  ) => {
    try {
      // Usa N8N como API principal para este submite específico
      const result = await updateInstallmentDueDate(
        installmentId, 
        format(newDueDate, 'yyyy-MM-dd'), 
        newAmount, 
        updateBoletoWithFees, 
        updateBoletoOnly, 
        'N8N',
        { 
          // Garante que apenas a atualização de boleto seja enviada no submit único
          update_boleto_only: updateBoletoOnly 
        }
      );
      
      // Atualiza o estado local ou mostra feedback
      enqueueSnackbar('Data de vencimento atualizada com sucesso!', { variant: 'success' });
      
      // Recarrega os dados de installments
      await fetchInstallments();

      // Fecha o modal de edição de data
      setEditDueDateDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Erro ao atualizar data de vencimento', { variant: 'error' });
      console.error('Erro na atualização:', error);
    }
  }, [enqueueSnackbar, fetchInstallments, setEditDueDateDialogOpen]);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        padding: 1, 
        borderRadius: 1,
        marginBottom: 2
      }}>
        <Typography variant="body2">
          {selectedInstallments.length} parcela(s) selecionada(s)
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<NotificationsIcon />}
          onClick={handleNotifySelectedInstallments}
          disabled={isNotifyingSelected}
        >
          {isNotifyingSelected ? (
            <CircularProgress size={24} />
          ) : (
            'Notificar Selecionadas'
          )}
        </Button>
      </Box> */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Contas a Receber</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'background.default',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText', 
              borderRadius: 2, 
              p: 1, 
              mr: 2 
            }}>
              <MoneyIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Total de Parcelas
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                R$ {formatCurrency(installmentsSummary.totalReceivable)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {installments.length} parcelas
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'background.default',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{ 
              bgcolor: 'warning.light', 
              color: 'warning.contrastText', 
              borderRadius: 2, 
              p: 1, 
              mr: 2 
            }}>
              <PendingIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Parcelas Pendentes
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                R$ {formatCurrency(installmentsSummary.totalReceivable)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {installments.filter(item => item.status === 'Pendente').length} parcelas
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'background.default',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{ 
              bgcolor: 'success.light', 
              color: 'success.contrastText', 
              borderRadius: 2, 
              p: 1, 
              mr: 2 
            }}>
              <PaidIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Parcelas Pagas
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                R$ {formatCurrency(installmentsSummary.totalReceived)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {installments.filter(item => item.status === 'Pago').length} parcelas
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={(newValue) => handleDateChange('startDate', newValue)}
              slots={{
                textField: TextField
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  margin: 'normal'
                }
              }}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={(newValue) => handleDateChange('endDate', newValue)}
              slots={{
                textField: TextField
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  margin: 'normal'
                }
              }}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="">Nenhum</MenuItem>
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Pago">Pago</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <TextField
            label="Nome"
            value={filters.full_name}
            onChange={(e) => setFilters(prev => ({ ...prev, full_name: e.target.value }))}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {getQuickDateRanges().map((range) => (
              <Button 
                key={range.label}
                variant="outlined" 
                size="small"
                color={
                  filters.startDate && filters.endDate && 
                  isSameDay(filters.startDate, range.startDate) && 
                  isSameDay(filters.endDate, range.endDate) 
                    ? 'primary' 
                    : 'secondary'
                }
                onClick={range.onClick}
              >
                {range.label}
              </Button>
            ))}
            <Button 
              variant="outlined" 
              size="small"
              color="secondary"
              onClick={handleClearDateFilter}
            >
              Limpar
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" align="center">
                <Checkbox 
                  onChange={handleSelectAllInstallments} 
                  checked={false}
                />
              </TableCell>
              <TableCell align="center">ID Parcela</TableCell>
              <TableCell align="center">ID Movimento</TableCell>
              <TableCell align="left">Nome</TableCell>
              <TableCell align="center">Data Vencimento</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Boletos</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : installments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    Nenhuma parcela encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              renderInstallmentsTable
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          borderRadius: '0 0 8px 8px'
        }}
      >
        {/* Seletor de itens por página */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="items-per-page-label">Itens por página</InputLabel>
          <Select
            labelId="items-per-page-label"
            value={rowsPerPage}
            label="Itens por página"
            onChange={handleRowsPerPageChange}
          >
            <MenuItem value={5}>5 itens</MenuItem>
            <MenuItem value={10}>10 itens</MenuItem>
            <MenuItem value={25}>25 itens</MenuItem>
            <MenuItem value={50}>50 itens</MenuItem>
          </Select>
        </FormControl>

        {/* Área central com informações e paginação */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Informação de itens */}
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {totalItems === 0 ? 'Nenhum item' :
              `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalItems)} de ${totalItems}`
            }
          </Typography>

          {/* Componente de Paginação */}
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 500,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }
              }
            }}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h6">Resumo:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="body1">
            Total: R$ {formatCurrency(installmentsSummary.totalReceivable)}
          </Typography>
          <Typography variant="body1">
            Pendente: R$ {formatCurrency(installmentsSummary.totalReceivable)}
          </Typography>
          <Typography variant="body1">
            Pago: R$ {formatCurrency(installmentsSummary.totalReceived)}
          </Typography>
        </Box>
      </Box>
      <Dialog
        open={editDueDateDialogOpen}
        onClose={() => {
          setEditDueDateDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        {console.log('🚨 ESTADO DO MODAL:', {
          editDueDateDialogOpen,
          selectedInstallmentForDueDateEdit,
          newDueDate,
          updateBoletoWithFees
        })}
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">Editar Data de Vencimento</Typography>
          {selectedInstallmentForDueDateEdit && (
            <Typography variant="subtitle2" color="textSecondary">
              Parcela: {selectedInstallmentForDueDateEdit.installment_id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                <DatePicker
                  label="Nova Data de Vencimento"
                  value={newDueDate}
                  format="dd/MM/yyyy"
                  onChange={(date) => {
                    console.log('🚨 DATA SELECIONADA:', date);
                    setNewDueDate(date);
                    if (selectedInstallmentForDueDateEdit) {
                      const calculatedAmount = handleCalculateNewAmount(
                        selectedInstallmentForDueDateEdit, 
                        date, 
                        updateBoletoWithFees
                      );
                      console.log('🚨 VALOR CALCULADO NO MODAL:', calculatedAmount);
                      setNewAmount(calculatedAmount);
                    }
                  }}
                  slots={{
                    textField: TextField
                  }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      margin: 'normal'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Novo Valor"
                fullWidth
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={updateBoletoWithFees}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setUpdateBoletoWithFees(isChecked);
                        
                        if (isChecked && selectedInstallmentForDueDateEdit && newDueDate) {
                          const calculatedAmount = handleCalculateNewAmount(
                            selectedInstallmentForDueDateEdit, 
                            newDueDate, 
                            true
                          );
                          setNewAmount(calculatedAmount);
                          setUpdateBoletoOnly(false);
                        } else if (!isChecked && selectedInstallmentForDueDateEdit) {
                          setNewAmount(formatCurrency(selectedInstallmentForDueDateEdit.balance));
                        }
                      }}
                    />
                  }
                  label="Atualizar com Juros e Multa"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={updateBoletoOnly}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setUpdateBoletoOnly(isChecked);
                        
                        if (isChecked) {
                          setUpdateBoletoWithFees(false);
                        }
                      }}
                    />
                  }
                  label="Atualizar Apenas Boleto"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDueDateDialogOpen(false);
            }} 
            color="secondary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              handleUpdateDueDateWithInterestAndPenalty(
                selectedInstallmentForDueDateEdit.installment_id, 
                newDueDate,
                cleanCurrencyValue(newAmount),
                updateBoletoWithFees,
                updateBoletoOnly
              );
            }} 
            color="primary" 
            variant="contained"
            disabled={!newDueDate}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setSelectedInstallmentForPayment(null);
          setPaymentValue('');
          setBankId('');
          setJuros('0');
          setDescontos('0');
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PaymentIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Liquidar Título</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInstallmentForPayment && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Parcela: {selectedInstallmentForPayment.full_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Valor Original: R$ {formatCurrency(selectedInstallmentForPayment.amount)}
              </Typography>
              <TextField
                label="Valor a Pagar"
                fullWidth
                value={paymentValue}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^\d]/g, '');
                  const numericValue = parseInt(inputValue, 10) / 100;
                  setPaymentValue(formatCurrency(numericValue));
                }}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
              <TextField
                label="Banco (ID)"
                fullWidth
                value={bankId || '2'}
                onChange={(e) => setBankId(e.target.value)}
                margin="normal"
                type="number"
              />
              <TextField
                label="Juros"
                fullWidth
                value={juros}
                onChange={(e) => {
                  const cleanedValue = cleanCurrencyValue(e.target.value);
                  setJuros(formatCurrency(cleanedValue));
                }}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
              <TextField
                label="Descontos"
                fullWidth
                value={descontos}
                onChange={(e) => {
                  // Remove caracteres não numéricos
                  const inputValue = e.target.value.replace(/[^\d]/g, '');
                  
                  // Converte para número decimal
                  const numericValue = parseFloat(inputValue) / 100;
                  
                  // Formata e atualiza o estado
                  setDescontos(formatCurrency(numericValue));
                }}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                <DatePicker
                  label="Data de Pagamento"
                  value={paymentDate}
                  onChange={(newValue) => setPaymentDate(newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      margin="normal" 
                      variant="outlined"
                    />
                  )}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPaymentDialogOpen(false);
              setSelectedInstallmentForPayment(null);
              setPaymentValue('');
              setBankId('');
              setJuros('0');
              setDescontos('0');
            }} 
            color="secondary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            color="primary" 
            variant="contained"
            disabled={!paymentValue}
          >
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
