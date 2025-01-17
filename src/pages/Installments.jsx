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
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Alert
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
import { format, addDays, differenceInDays, isPast, startOfDay, endOfDay, parse, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isSameDay, addMonths, addWeeks } from 'date-fns';
import { useSnackbar } from 'notistack';
import { installmentsService, updateInstallmentDueDate } from '../services/api';
import axios from 'axios';

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
      ? parse(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'', new Date())  // Usa parse com formato específico
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [installments, setInstallments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  // Memoize filtered installments
  const filteredInstallments = useMemo(() => {
    return installments.filter(installment => {
      const matchStatus = !filters.status || installment.status === filters.status;
      const matchFullName = !filters.full_name || 
        installment.full_name.toLowerCase().includes(filters.full_name.toLowerCase());
      
      return matchStatus && matchFullName;
    });
  }, [installments, filters]);

  // Otimizar fetchInstallments para incluir paginação corretamente
  const fetchInstallments = useCallback(async (params = {}) => {
    try {
      console.log('🚨 DEBUG Filtros antes da chamada:', {
        filters,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        rowsPerPage
      });

      // Garantir que startDate e endDate sempre tenham valores
      const safeStartDate = filters.startDate || subDays(new Date(), 6);
      const safeEndDate = filters.endDate || new Date();

      const paginationParams = {
        page: (params.page || page + 1), // Prioriza parâmetros passados
        limit: params.limit || rowsPerPage,
        sort: 'due_date',
        order: 'desc'
      };

      const filterParams = {
        ...(safeStartDate ? { start_date: format(safeStartDate, 'yyyy-MM-dd') } : {}),
        ...(safeEndDate ? { end_date: format(safeEndDate, 'yyyy-MM-dd') } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.full_name ? { full_name: filters.full_name } : {})
      };

      console.log('🚨 Parâmetros da API com datas seguras:', {
        pagination: paginationParams,
        filters: filterParams,
        customParams: params
      });

      const response = await installmentsService.list({
        ...paginationParams,
        ...filterParams,
        ...params
      });

      console.log('🚨 Resposta completa da API:', response);

      // Tratamento robusto para total e totalPages
      const totalItems = response.meta?.total || response.total || 0;
      const totalPages = response.meta?.totalPages || Math.ceil(totalItems / rowsPerPage) || 1;

      console.log('🚨 DADOS DE PAGINAÇÃO PROCESSADOS:', {
        totalItems,
        totalPages,
        itemsCount: response.items?.length || 0,
        rowsPerPage
      });

      setInstallments(response.items || response.data?.items || []);
      setTotalItems(totalItems);
      setTotalPages(totalPages);

    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      setInstallments([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  }, [page, rowsPerPage, filters]);

  // Efeito para disparar fetchInstallments quando página ou filtros mudarem
  useEffect(() => {
    console.log('🚨 EFEITO DE PAGINAÇÃO:', {
      page,
      rowsPerPage,
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
      full_name: filters.full_name
    });

    fetchInstallments({
      page: page + 1,
      limit: rowsPerPage
    });
  }, [page, rowsPerPage, filters.startDate, filters.endDate, filters.status, filters.full_name]);

  useEffect(() => {
    // Definir filtro padrão para últimos 7 dias ao carregar a página
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    
    console.log('🚨 CONFIGURANDO FILTRO PADRÃO DE 7 DIAS', {
      startDate: sevenDaysAgo,
      endDate: today
    });

    // Atualizar estados de data
    setStartDate(sevenDaysAgo);
    setEndDate(today);

    // Atualizar filtros
    setFilters(prev => ({
      ...prev,
      startDate: sevenDaysAgo,
      endDate: today
    }));

    // Buscar parcelas com o filtro padrão
    fetchInstallments({
      startDate: sevenDaysAgo,
      endDate: today
    });
  }, []);

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

    if (!installments || !installments.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          textAlign: 'center', 
          p: 4 
        }}>
          <SentimentDissatisfiedIcon color="disabled" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhuma parcela encontrada
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Não há parcelas que correspondam aos filtros selecionados.
          </Typography>
        </Box>
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
            {(installment.boletos || []).map((boleto) => (
              <Box key={boleto.boleto_id} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                {boleto.status === 'A_RECEBER' && (
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(boleto.boleto_url, '_blank')}
                    title="Visualizar Boleto"
                  >
                    <ReceiptIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </TableCell>
          <TableCell align="right">
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              justifyContent: 'flex-end' 
            }}>
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
                  onClick={() => handleSettleInstallment(installment)}
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

  // Função para calcular juros e multa
  const calculateInterestAndPenalty = useCallback((originalDueDate, newDueDate, originalBalance) => {
    console.log('🚨 CÁLCULO DE JUROS E MULTA:', {
      originalDueDate,
      newDueDate,
      originalBalance
    });

    // Converte para Date se for string
    const originalDate = typeof originalDueDate === 'string' 
      ? new Date(originalDueDate) 
      : originalDueDate;
    const calculatedNewDate = typeof newDueDate === 'string' 
      ? new Date(newDueDate) 
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

  const handleChangePage = useCallback((event, newPage) => {
    console.log('🚨 MUDANÇA DE PÁGINA:', {
      currentPage: page,
      newPage: newPage
    });
    setPage(newPage);
    fetchInstallments();
  }, [page, fetchInstallments]);

  const handleChangeRowsPerPage = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('🚨 MUDANÇA DE LINHAS POR PÁGINA:', {
      currentRowsPerPage: rowsPerPage,
      newRowsPerPage: newRowsPerPage
    });
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Resetar para primeira página
    fetchInstallments();
  }, [rowsPerPage, fetchInstallments]);

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
    // console.log('Geração de boleto:', installment);
    try {
      // Chamar serviço de geração de boleto
      const response = await installmentsService.generateBoleto(installment.installment_id);
      
      // Log detalhado da resposta
      // console.log('Resposta da geração de boleto:', {
      //   status: response.status,
      //   data: response.data,
      //   headers: response.headers
      // });
      
      enqueueSnackbar('Boleto gerado com sucesso!', { variant: 'success' });
      
      // Recarregar a lista de installments para atualizar os boletos
      fetchInstallments();
    } catch (error) {
      // Log detalhado do erro
      // console.error('Erro completo ao gerar boleto:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status,
      //   headers: error.response?.headers,
      //   config: error.config
      // });

      // Tentar extrair mensagem de erro mais detalhada
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erro ao gerar boleto';

      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        persist: true  // Manter notificação visível
      });
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

      // Preparar dados de pagamento
      const paymentData = {
        installmentId: selectedInstallmentForPayment.installment_id,
        paymentValue: cleanCurrencyValue(paymentValue),
        bankId: bankId || '2',
        paymentMethod: paymentMethod || 'TRANSFERENCIA',
        paymentDate: paymentDate || new Date(),
        observation: paymentObservation,
        juros: cleanCurrencyValue(juros),
        descontos: cleanCurrencyValue(descontos)
      };

      // Chamar serviço de pagamento
      const result = await installmentsService.confirmPayment(paymentData);
      
      enqueueSnackbar('Pagamento confirmado com sucesso!', { variant: 'success' });
      fetchInstallments();
      setPaymentDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Erro ao confirmar pagamento', { variant: 'error' });
      console.error('Erro no pagamento:', error);
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
    return [
      {
        label: 'Hoje',
        startDate: today,
        endDate: today,
        onClick: () => {
          console.log('🚨 CLICOU EM HOJE');
          handleQuickDateFilter('Hoje');
        }
      },
      {
        label: 'Semana Atual',
        startDate: startOfWeek(today, { locale: ptBR }),
        endDate: endOfWeek(today, { locale: ptBR }),
        onClick: () => {
          console.log('🚨 CLICOU EM SEMANA ATUAL');
          handleQuickDateFilter('Esta Semana');
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
        startDate: subDays(today, 6),
        endDate: today,
        onClick: () => {
          console.log('🚨 CLICOU EM ÚLTIMOS 7 DIAS');
          handleQuickDateFilter('Últimos 7 dias');
        }
      },
      {
        label: 'Últimos 30 dias',
        startDate: subDays(today, 29),
        endDate: today,
        onClick: () => {
          console.log('🚨 CLICOU EM ÚLTIMOS 30 DIAS');
          handleQuickDateFilter('Últimos 30 dias');
        }
      }
    ];
  };

  const handleQuickDateFilter = useCallback((type) => {
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
      case 'Amanhã':
        const tomorrow = addDays(today, 1);
        newStartDate = startOfDay(tomorrow);
        newEndDate = endOfDay(tomorrow);
        break;
      case 'Esta Semana':
        newStartDate = startOfWeek(today, { weekStartsOn: 1 }); // Segunda-feira
        newEndDate = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'Próxima Semana':
        const nextWeekStart = addWeeks(today, 1);
        newStartDate = startOfWeek(nextWeekStart, { weekStartsOn: 1 });
        newEndDate = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
        break;
      case 'Este Mês':
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      case 'Próximo Mês':
        const nextMonth = addMonths(today, 1);
        newStartDate = startOfMonth(nextMonth);
        newEndDate = endOfMonth(nextMonth);
        break;
      default:
        newStartDate = null;
        newEndDate = null;
    }

    console.log('🚨 DATAS CALCULADAS:', { 
      type, 
      startDate: newStartDate, 
      endDate: newEndDate 
    });

    // Atualiza os estados de data
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Atualiza os filtros para a busca na API
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate
      };
      
      console.log('🚨 FILTROS ATUALIZADOS:', updatedFilters);
      
      return updatedFilters;
    });

    // Dispara a busca de parcelas
    fetchInstallments({
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [fetchInstallments]);

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
      const response = await axios.post(
        'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/parcela', 
        { 
          installment_id: installment.installment_id,
          full_name: installment.full_name,
          amount: installment.amount,
          due_date: installment.due_date,
          boleto_number: installment.boletos?.[0]?.boleto_number
        },
        {
          headers: {
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('🚨 RESPOSTA DA NOTIFICAÇÃO:', response.data);

      // Simula um tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('🚨 ERRO AO ENVIAR NOTIFICAÇÃO:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        installment_id: installment.installment_id
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
        ? value.replace(/[^\d,\.]/g, '').replace(',', '.')
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
              <Typography variant="body2" color="text.secondary">
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
              onChange={(newValue) => setStartDate(newValue)}
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
              onChange={(newValue) => setEndDate(newValue)}
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
              <TableCell padding="checkbox">
                <Checkbox 
                  onChange={handleSelectAllInstallments} 
                  checked={false}
                />
              </TableCell>
              <TableCell>ID Parcela</TableCell>
              <TableCell>ID Movimento</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Boletos</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderInstallmentsTable}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        showFirstButton
        showLastButton
      />
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
                  const cleanedValue = cleanCurrencyValue(e.target.value);
                  setPaymentValue(formatCurrency(cleanedValue));
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
                  const cleanedValue = cleanCurrencyValue(e.target.value);
                  setDescontos(formatCurrency(cleanedValue));
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
