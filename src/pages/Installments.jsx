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
  Add, // Corrigir import do ícone Add
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
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { formatISO, parseISO, format, addDays, differenceInDays, isPast } from 'date-fns';
import { useSnackbar } from 'notistack';
import { installmentsService, updateInstallmentDueDate } from '../services/api';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isSameDay } from 'date-fns';
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
    // Se for uma string, tenta converter para Date
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
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
  const [installments, setInstallments] = useState({
    items: [],
    total: 0,
    page: 0,
    limit: 10
  });

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
    return installments.items.filter(installment => {
      const matchStatus = !filters.status || installment.status === filters.status;
      const matchFullName = !filters.full_name || 
        installment.full_name.toLowerCase().includes(filters.full_name.toLowerCase());
      
      return matchStatus && matchFullName;
    });
  }, [installments.items, filters]);

  // Optimize data fetching with useCallback
  const fetchInstallments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar filtros para a API
      const apiFilters = {
        page: page + 1,  
        limit: rowsPerPage,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.full_name ? { full_name: filters.full_name } : {})
      };

      console.log('🚨 FILTROS DA API:', apiFilters);

      const response = await installmentsService.list(apiFilters);

      console.log('🔍 DIAGNÓSTICO PAGINAÇÃO DETALHADO:', {
        apiResponse: response,
        localPage: page,
        apiPage: response.page,
        apiTotal: response.total,
        apiTotalPages: response.meta?.totalPages || Math.ceil(response.total / rowsPerPage),
        localRowsPerPage: rowsPerPage
      });

      setInstallments({
        items: response.items,
        total: response.total,
        page: response.page,
        limit: response.limit || rowsPerPage
      });

      // Sincronizar estados de paginação
      setPage(response.page - 1);
      setRowsPerPage(response.limit || rowsPerPage);

      console.log('🚨 PAGINAÇÃO SINCRONIZADA:', {
        apiPage: response.page,
        localPage: response.page - 1,
        total: response.total,
        limit: response.limit || rowsPerPage
      });

    } catch (err) {
      console.error('🚨 Erro ao buscar parcelas:', err);
      setError(err);
      setInstallments({
        items: [],
        total: 0,
        page: 0,
        limit: rowsPerPage
      });
      enqueueSnackbar('Erro ao carregar parcelas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  // Controlled effect for data fetching
  useEffect(() => {
    console.log('🚨 INSTALLMENTS: Dados de paginação', {
      items: installments.items.length,
      total: installments.total,
      page,
      rowsPerPage,
      filters: {
        ...filters,
        full_name: filters.full_name ? `"${filters.full_name}"` : null
      }
    });
    fetchInstallments();
  }, [fetchInstallments, filters, page, rowsPerPage]);

  // Renderização condicional da tabela
  const renderInstallmentsTable = useMemo(() => {
    console.log('🚨 Renderizando installments:', {
      items: installments.items.length,
      total: installments.total
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

    if (!installments || !installments.items || installments.items.length === 0) {
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

    return (installments?.items || []).map(installment => (
      // Render logic here
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
            {installment.status === 'Pendente' && 
             installment.boletos && 
             installment.boletos.some(boleto => boleto.status === 'A_RECEBER') && (
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

            {/* Botão para gerar boleto */}
            {installment.status === 'Pendente' && 
             (!installment.boletos || 
              installment.boletos.length === 0 || 
              (installment.boletos.length > 0 && 
               installment.boletos.every(boleto => 
                 boleto.status === 'A_RECEBER' && 
                 !boleto.boleto_number
               )
              )
             ) && (
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

            {/* Botão de Liquidação de Título */}
            {installment.status === 'Pendente' && (
              <IconButton 
                size="small"
                color="success"
                onClick={() => handleOpenPaymentDialog(installment)}
                title="Liquidar Título"
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'success.light',
                  '&:hover': { 
                    bgcolor: 'success.light', 
                    color: 'success.contrastText' 
                  }
                }}
              >
                <PaymentIcon fontSize="small" />
              </IconButton>
            )}

            {/* Botão de Edição de Data de Vencimento */}
            <IconButton 
              size="small"
              color="secondary"
              onClick={(event) => {
                event.stopPropagation();
                handleEditDueDate(installment);
              }}
              title="Editar Data de Vencimento"
              sx={{ 
                border: '1px solid', 
                borderColor: 'secondary.light',
                '&:hover': { 
                  bgcolor: 'secondary.light', 
                  color: 'secondary.contrastText' 
                }
              }}
            >
              <CalendarTodayIcon fontSize="small" />
            </IconButton>

            {/* Botão de Compartilhamento */}
            <IconButton
              size="small"
              onClick={(event) => handleShareClick(event, installment)}
              title="Compartilhar"
              sx={{ 
                border: '1px solid', 
                borderColor: 'info.light',
                '&:hover': { 
                  bgcolor: 'info.light', 
                  color: 'info.contrastText' 
                }
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    ));
  }, [installments.items, isLoading, fetchError]);

  // Função de cálculo de juros e multa
  const calculateInterestAndPenalty = useCallback((originalDueDate, newDueDate, originalBalance) => {
    if (!originalDueDate || !newDueDate) return originalBalance;

    const originalDate = parseISO(originalDueDate);
    const newDate = parseISO(newDueDate);
    const daysOverdue = differenceInDays(newDate, originalDate);

    if (daysOverdue <= 0) return originalBalance;

    // Configurações de juros e multa (ajuste conforme necessário)
    const dailyInterestRate = 0.033 / 100; // 0.033% ao dia
    const penaltyRate = 2 / 100; // 2% de multa

    const interest = originalBalance * dailyInterestRate * daysOverdue;
    const penalty = originalBalance * penaltyRate;
    const totalNewBalance = originalBalance + interest + penalty;

    return totalNewBalance;
  }, []);

  // Função auxiliar para calcular e formatar novo valor com juros
  const handleCalculateNewAmount = useCallback((installment, newDueDate, updateWithFees) => {
    if (!updateWithFees) return formatCurrency(installment.balance);

    const newBalance = calculateInterestAndPenalty(
      installment.due_date, 
      newDueDate, 
      parseFloat(cleanCurrencyValue(installment.balance))
    );

    return formatCurrency(newBalance);
  }, [calculateInterestAndPenalty]);

  const handleChangePage = useCallback((event, newPage) => {
    console.log('🚨 PAGINAÇÃO: Nova página', newPage);
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('🚨 PAGINAÇÃO: Linhas por página', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

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
    return calculateInstallmentsSummary(installments.items);
  }, [installments.items]);

  const handleSelectAllInstallments = (event) => {
    // console.log('Seleção de todas as parcelas:', event.target.checked);
    if (event.target.checked) {
      const allInstallmentIds = installments.items.map(item => item.installment_id);
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
    // console.log('Edição de data de vencimento:', installment);
    if (installment) {
      // Definir estados iniciais
      setSelectedInstallmentForDueDateEdit(installment);
      
      // Definir nova data
      const originalDueDate = parseISO(installment.due_date);
      const newDueDate = isPast(originalDueDate) ? new Date() : originalDueDate;
      setNewDueDate(newDueDate);

      // Definir valor
      const originalBalance = formatCurrency(installment.balance || 0);
      setNewAmount(originalBalance);

      // Se já estiver vencido, calcular valor atualizado
      if (isPast(originalDueDate)) {
        const updatedBalance = calculateInterestAndPenalty(originalDueDate, new Date(), parseFloat(cleanCurrencyValue(originalBalance)));
        setNewAmount(formatCurrency(updatedBalance));
        setUpdateBoletoWithFees(true);
        setUpdateBoletoOnly(true);
      } else {
        setUpdateBoletoWithFees(false);
        setUpdateBoletoOnly(false);
      }
      
      // Forçar abertura do modal
      setEditDueDateDialogOpen(true);
    }
  }, [calculateInterestAndPenalty]);

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
      const formattedDueDate = formatISO(newDueDate, { representation: 'date' });

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
    // console.log('Obtendo faixas de datas rápidas');
    const today = new Date();
    return [
      {
        label: 'Hoje',
        startDate: today,
        endDate: today
      },
      {
        label: 'Semana Atual',
        startDate: startOfWeek(today, { locale: ptBR }),
        endDate: endOfWeek(today, { locale: ptBR })
      },
      {
        label: 'Mês Atual',
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      },
      {
        label: 'Últimos 7 dias',
        startDate: subDays(today, 6),
        endDate: today
      },
      {
        label: 'Últimos 30 dias',
        startDate: subDays(today, 29),
        endDate: today
      }
    ];
  };

  const handleQuickDateFilter = useCallback((type) => {
    console.log('🚨 Filtro de data clicado:', type);  // Adicionar log de diagnóstico
    const now = new Date();
    let startDate, endDate;

    // Mapear labels para tipos
    const typeMap = {
      'Hoje': 'today',
      'Semana Atual': 'thisWeek',
      'Mês Atual': 'thisMonth',
      'Últimos 7 dias': 'lastWeek',
      'Últimos 30 dias': 'lastMonth'
    };

    const mappedType = typeMap[type] || type;

    switch(mappedType) {
      case 'today':
        startDate = now;
        endDate = now;
        break;
      case 'thisWeek':
        startDate = startOfWeek(now, { locale: ptBR });
        endDate = endOfWeek(now, { locale: ptBR });
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastWeek':
        startDate = startOfWeek(subDays(now, 7), { locale: ptBR });
        endDate = endOfWeek(subDays(now, 7), { locale: ptBR });
        break;
      case 'lastMonth':
        const lastMonthEnd = subDays(startOfMonth(now), 1);
        startDate = startOfMonth(lastMonthEnd);
        endDate = lastMonthEnd;
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));

    // Adicionar chamada para buscar parcelas com o novo filtro
    fetchInstallments();
  }, [fetchInstallments]);

  const handleClearDateFilter = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      startDate: null,
      endDate: null
    }));
  }, []);

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
    // console.log('Notificando parcela:', installment);
    // Cria um estado de processamento específico para este installment
    // const updatedInstallments = installments.items.map(item => 
    //   item.installment_id === installment.installment_id 
    //     ? { ...item, isNotifying: true } 
    //     : item
    // );
    
    // setInstallments(prev => ({
    //   ...prev,
    //   items: updatedInstallments
    // }));

    try {
      const response = await axios.post(
        'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/parcela', 
        { installment_id: installment.installment_id },
        {
          headers: {
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
            'Content-Type': 'application/json'
          }
        }
      );

      // Simula um tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      enqueueSnackbar('Notificação enviada com sucesso!', { variant: 'success' });
    } catch (error) {
      // console.error('Erro ao enviar notificação:', error);
      enqueueSnackbar('Erro ao enviar notificação', { variant: 'error' });
    } finally {
      // Remove o estado de processamento
      // const resetInstallments = installments.items.map(item => 
      //   item.installment_id === installment.installment_id 
      //     ? { ...item, isNotifying: false } 
      //     : item
      // );
      
      // setInstallments(prev => ({
      //   ...prev,
      //   items: resetInstallments
      // }));
    }
  };

  const handleShareClick = (event, installment = null) => {
    // console.log('Clicando no botão de compartilhamento:', event, installment);
    // setShareAnchorEl(event.currentTarget);
    // setSelectedInstallment(installment);
  };

  const handleShareClose = () => {
    // console.log('Fechando o menu de compartilhamento');
    // setShareAnchorEl(null);
    // setSelectedInstallment(null);
  };

  const handleWhatsAppShare = () => {
    // console.log('Compartilhando via WhatsApp');
    handleShareClose();
  };

  const handleEmailShare = () => {
    // console.log('Compartilhando via Email');
    handleShareClose();
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
    //   differenceInDays(newDueDate, parseISO(selectedInstallmentForDueDateEdit.due_date)) > 0 ||
    //   // Parcela já está vencida
    //   isPast(parseISO(selectedInstallmentForDueDateEdit.due_date))
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
        <IconButton 
          onClick={() => handleShareClick(null)} 
          color="primary"
        >
          <ShareIcon />
        </IconButton>
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
                {installments.items.length} parcelas
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
                {installments.items.filter(item => item.status === 'Pendente').length} parcelas
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
                {installments.items.filter(item => item.status === 'Pago').length} parcelas
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
              value={filters.startDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, startDate: newValue }))}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
            <DatePicker
              label="Data Final"
              value={filters.endDate}
              onChange={(newValue) => setFilters(prev => ({ ...prev, endDate: newValue }))}
              renderInput={(params) => <TextField {...params} size="small" />}
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
                onClick={() => handleQuickDateFilter(range.label)}
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
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={installments.total}
        rowsPerPage={rowsPerPage}
        page={page}
        labelDisplayedRows={({ from, to, count }) => 
          `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        onPageChange={(event, newPage) => {
          console.log('🚨 PAGINAÇÃO: Nova página', newPage);
          setPage(newPage);
        }}
        onRowsPerPageChange={(event) => {
          const newRowsPerPage = parseInt(event.target.value, 10);
          console.log('🚨 PAGINAÇÃO: Linhas por página', newRowsPerPage);
          setRowsPerPage(newRowsPerPage);
          setPage(0); // Resetar para primeira página
        }}
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
                  onChange={(date) => {
                    setNewDueDate(date);
                    if (selectedInstallmentForDueDateEdit) {
                      const calculatedAmount = handleCalculateNewAmount(
                        selectedInstallmentForDueDateEdit, 
                        date, 
                        updateBoletoWithFees
                      );
                      setNewAmount(calculatedAmount);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" margin="normal" />}
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
