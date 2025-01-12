// DIAGNÓSTICO CRÍTICO
console.error('🚨 DIAGNÓSTICO CRÍTICO: MÓDULO INSTALLMENTS CARREGADO');
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
console.error('🚨 INSTALLMENTS MODULE LOADED GLOBALLY');

// Forçar log de diagnóstico
window.debugInstallments.log('Importações carregadas');

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

export default function Installments() {
  // Logs de diagnóstico crítico
  console.error('🚨 INSTALLMENTS: COMPONENTE INICIADO');
  window.debugInstallments.log('Componente iniciado');
  
  const { enqueueSnackbar } = useSnackbar();
  const [installments, setInstallments] = useState({
    items: [],
    total: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('');
  const [fullNameFilter, setFullNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [editDueDateDialogOpen, setEditDueDateDialogOpen] = useState(false);
  const [selectedInstallmentForDueDateEdit, setSelectedInstallmentForDueDateEdit] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
  const [paymentValue, setPaymentValue] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date()); // Adicionar novo estado para data de pagamento
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
  const [isNotifyingSelected, setIsNotifyingSelected] = useState(false);
  const [updateBoletoWithFees, setUpdateBoletoWithFees] = useState(false);
  const [updateBoletoOnly, setUpdateBoletoOnly] = useState(false);
  const [bankId, setBankId] = useState('');
  const [juros, setJuros] = useState('0');
  const [descontos, setDescontos] = useState('0');

  console.group('Installments - Inicialização');
  console.log('Estado inicial:', {
    installments,
    page,
    rowsPerPage,
    startDate,
    endDate,
    status,
    fullNameFilter,
    loading,
    error,
    filtersVisible,
    shareAnchorEl,
    selectedInstallment,
    selectedInstallments,
    editDueDateDialogOpen,
    selectedInstallmentForDueDateEdit,
    newDueDate,
    newAmount,
    paymentDialogOpen,
    selectedInstallmentForPayment,
    paymentValue,
    paymentDate,
    isUpdatingDueDate,
    isNotifyingSelected,
    updateBoletoWithFees,
    updateBoletoOnly,
    bankId,
    juros,
    descontos
  });
  console.groupEnd();

  // Log de diagnóstico adicional
  useEffect(() => {
    console.error('🚨 INSTALLMENTS COMPONENT MOUNTED');
  }, []);

  const statusOptions = [
    { value: '', label: 'Nenhum' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' }
  ];

  // Função de cálculo de juros e multa
  const calculateInterestAndPenalty = useCallback((originalDueDate, newDueDate, originalBalance) => {
    console.log('Calculando juros e multa:', {
      originalDueDate,
      newDueDate,
      originalBalance
    });
    // Calcular dias de atraso
    const daysOverdue = differenceInDays(newDueDate, originalDueDate);

    // Calcular meses de atraso
    const monthsOverdue = Math.ceil(daysOverdue / 30);

    // Taxa de juros mensal
    const monthlyInterestRate = 0.07; // 7% ao mês

    // Taxa de multa
    const penaltyRate = 0.02; // 2% de multa

    // Calcular juros e multa
    const interest = originalBalance * (monthlyInterestRate * monthsOverdue);
    const penalty = originalBalance * penaltyRate;

    // Calcular novo valor
    const newBalance = originalBalance + interest + penalty;

    console.log('Resultado do cálculo:', {
      daysOverdue,
      monthsOverdue,
      interest,
      penalty,
      newBalance
    });

    return newBalance;
  }, []);

  const loadInstallments = useCallback(async () => {
    console.group('Installments - Carregamento de Parcelas');
    console.log('Parâmetros da busca:', {
      page: page + 1,
      limit: rowsPerPage,
      ...(startDate && { startDate: formatISO(startDate, { representation: 'date' }) }),
      ...(endDate && { endDate: formatISO(endDate, { representation: 'date' }) }),
      ...(status && { status }),
      ...(fullNameFilter && { fullName: fullNameFilter }),
    });

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(startDate && { startDate: formatISO(startDate, { representation: 'date' }) }),
        ...(endDate && { endDate: formatISO(endDate, { representation: 'date' }) }),
        ...(status && { status }),
        ...(fullNameFilter && { fullName: fullNameFilter }),
      };

      console.log('Enviando parâmetros para a API:', params);

      const installmentsData = await installmentsService.list(params);

      console.log('Dados de installments recebidos:', installmentsData);

      if (installmentsData && installmentsData.items && installmentsData.items.length > 0) {
        setInstallments(installmentsData);
        console.log('Parcelas carregadas com sucesso:', installmentsData.items.length);
      } else {
        console.warn('Nenhuma parcela encontrada ou dados inválidos');
        setInstallments({ items: [], total: 0 });
      }
    } catch (error) {
      console.error('Erro ao carregar parcelas:', error);
      setError(error);
      setInstallments({ items: [], total: 0 });
      enqueueSnackbar('Erro ao carregar parcelas', { variant: 'error' });
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [page, rowsPerPage, startDate, endDate, status, fullNameFilter, enqueueSnackbar]);

  useEffect(() => {
    console.log('Efeito de busca de parcelas disparado');
    loadInstallments();
  }, [loadInstallments]);

  const handleChangePage = (event, newPage) => {
    console.log('Mudança de página:', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    console.log('Mudança de quantidade de linhas por página:', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateInstallmentsSummary = useCallback((installmentsData) => {
    console.log('Calculando resumo de parcelas:', installmentsData);
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

    console.log('Resultado do resumo:', {
      totalReceivable,
      totalReceived,
      totalOverdue
    });

    return {
      totalReceivable,
      totalReceived,
      totalOverdue
    };
  }, []);

  const installmentsSummary = useMemo(() => {
    console.log('Calculando resumo de parcelas:', installments.items);
    return calculateInstallmentsSummary(installments.items);
  }, [installments.items]);

  const handleSelectAllInstallments = (event) => {
    console.log('Seleção de todas as parcelas:', event.target.checked);
    if (event.target.checked) {
      const allInstallmentIds = installments.items.map(item => item.installment_id);
      setSelectedInstallments(allInstallmentIds);
    } else {
      setSelectedInstallments([]);
    }
  };

  const handleSelectInstallment = (installmentId) => {
    console.log('Seleção de parcela:', installmentId);
    setSelectedInstallments(prev => 
      prev.includes(installmentId)
        ? prev.filter(id => id !== installmentId)
        : [...prev, installmentId]
    );
  };

  const handleNotifySelectedInstallments = async () => {
    console.log('Notificação de parcelas selecionadas:', selectedInstallments);
    if (selectedInstallments.length === 0) {
      enqueueSnackbar('Nenhuma parcela selecionada', { variant: 'warning' });
      return;
    }

    setIsNotifyingSelected(true);

    try {
      const notificationPromises = selectedInstallments.map(installmentId => 
        axios.post(
          'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/parcela', 
          { installment_id: installmentId },
          {
            headers: {
              'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
              'Content-Type': 'application/json'
            }
          }
        )
      );

      // Simula um tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      await Promise.all(notificationPromises);
      
      enqueueSnackbar(`Notificação enviada para ${selectedInstallments.length} parcela(s)`, { 
        variant: 'success',
        autoHideDuration: 2000 // Tempo específico para auto-hide
      });
      
      setSelectedInstallments([]); // Limpa seleção após notificação
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      enqueueSnackbar('Erro ao enviar notificações', { variant: 'error' });
    } finally {
      setIsNotifyingSelected(false);
    }
  };

  const handleGenerateBoleto = useCallback(async (installment) => {
    console.log('Geração de boleto:', installment);
    try {
      // Chamar serviço de geração de boleto
      const response = await installmentsService.generateBoleto(installment.installment_id);
      
      // Log detalhado da resposta
      console.log('Resposta da geração de boleto:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      enqueueSnackbar('Boleto gerado com sucesso!', { variant: 'success' });
      
      // Recarregar a lista de installments para atualizar os boletos
      loadInstallments();
    } catch (error) {
      // Log detalhado do erro
      console.error('Erro completo ao gerar boleto:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });

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
  }, [enqueueSnackbar, loadInstallments]);

  const handleEditDueDate = useCallback((installment) => {
    console.log('Edição de data de vencimento:', installment);
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
    console.log('Atualização de data de vencimento:', {
      installmentId,
      newDueDate,
      newAmount,
      updateBoletoWithFees,
      updateBoletoOnly
    });
    try {
      // Ativa o estado de carregamento
      setIsUpdatingDueDate(true);

      // Converte a data para o formato ISO
      const formattedDueDate = formatISO(newDueDate, { representation: 'date' });

      console.log('Iniciando atualização de data de vencimento:', { 
        installmentId, 
        newDueDate: formattedDueDate, 
        newAmount,
        updateBoletoWithFees,
        updateBoletoOnly,
        apiSource: 'N8N' 
      });

      // Usa N8N como API principal para este submite específico
      const result = await updateInstallmentDueDate(installmentId, formattedDueDate, newAmount, updateBoletoWithFees, updateBoletoOnly, 'N8N');
      
      console.log('Resultado da atualização de data de vencimento:', result);

      // Atualiza o estado local ou mostra feedback
      enqueueSnackbar('Data de vencimento atualizada com sucesso!', { variant: 'success' });
      
      // Recarrega os dados de installments
      await loadInstallments();

      // Fecha o modal de edição de data
      setEditDueDateDialogOpen(false);
    } catch (error) {
      console.error('Erro detalhado ao atualizar data de vencimento:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      enqueueSnackbar('Erro ao atualizar data de vencimento', { variant: 'error' });
    } finally {
      // Desativa o estado de carregamento
      setIsUpdatingDueDate(false);
    }
  };

  const handleOpenPaymentDialog = (installment) => {
    console.log('Abertura de diálogo de pagamento:', installment);
    // Só abre para status Pendente
    if (installment.status !== 'Pendente') return;

    setSelectedInstallmentForPayment(installment);
    setPaymentValue(installment.amount.toString().replace('.', ','));
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    console.log('Confirmação de pagamento:', {
      selectedInstallmentForPayment,
      paymentValue,
      paymentDate
    });
    if (!selectedInstallmentForPayment) return;

    try {
      // Converter valores para numéricos
      const numericValue = parseFloat(paymentValue.replace(',', '.'));
      const numericJuros = parseFloat(juros.replace(',', '.') || '0');
      const numericDescontos = parseFloat(descontos.replace(',', '.') || '0');
      
      // Preparar dados para pagamento
      const paymentData = {
        installment_id: selectedInstallmentForPayment.installment_id,
        bank_id: bankId ? parseInt(bankId) : 2, // Default para 2 se não informado
        valor: numericValue,
        juros: numericJuros,
        descontos: numericDescontos,
        date: formatISO(paymentDate, { representation: 'date' })
      };

      console.log('Payload de pagamento:', paymentData);

      // Chamar serviço de pagamento
      await installmentsService.confirmPayment(paymentData);
      
      enqueueSnackbar('Pagamento confirmado com sucesso!', { variant: 'success' });
      loadInstallments();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      enqueueSnackbar('Erro ao confirmar pagamento', { variant: 'error' });
    } finally {
      // Limpar estados
      setBankId('');
      setJuros('0');
      setDescontos('0');
    }
  };

  const getQuickDateRanges = () => {
    console.log('Obtendo faixas de datas rápidas');
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

  const handleQuickDateFilter = (range) => {
    console.log('Aplicando filtro de data rápida:', range);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const renderBoletoStatus = (status) => {
    console.log('Renderizando status de boleto:', status);
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
    console.log('Formatando data para exibição:', dateString);
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

  const renderInstallmentStatus = (status) => {
    console.log('Renderizando status de parcela:', status);
    const statusColors = {
      'Pendente': 'warning',
      'Pago': 'success'
    };
    return <Chip 
      label={status} 
      color={statusColors[status] || 'default'} 
      size="small" 
    />;
  };

  const handleNotifyInstallment = async (installment) => {
    console.log('Notificando parcela:', installment);
    // Cria um estado de processamento específico para este installment
    const updatedInstallments = installments.items.map(item => 
      item.installment_id === installment.installment_id 
        ? { ...item, isNotifying: true } 
        : item
    );
    
    setInstallments(prev => ({
      ...prev,
      items: updatedInstallments
    }));

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
      console.error('Erro ao enviar notificação:', error);
      enqueueSnackbar('Erro ao enviar notificação', { variant: 'error' });
    } finally {
      // Remove o estado de processamento
      const resetInstallments = installments.items.map(item => 
        item.installment_id === installment.installment_id 
          ? { ...item, isNotifying: false } 
          : item
      );
      
      setInstallments(prev => ({
        ...prev,
        items: resetInstallments
      }));
    }
  };

  const handleShareClick = (event, installment = null) => {
    console.log('Clicando no botão de compartilhamento:', event, installment);
    setShareAnchorEl(event.currentTarget);
    setSelectedInstallment(installment);
  };

  const handleShareClose = () => {
    console.log('Fechando o menu de compartilhamento');
    setShareAnchorEl(null);
    setSelectedInstallment(null);
  };

  const handleWhatsAppShare = () => {
    console.log('Compartilhando via WhatsApp');
    handleShareClose();
  };

  const handleEmailShare = () => {
    console.log('Compartilhando via Email');
    handleShareClose();
  };

  const normalizeCurrencyValue = (value) => {
    console.log('Normalizando valor de moeda:', value);
    // Se já for um número com casas decimais, retorna como está
    if (typeof value === 'number') {
      return value;
    }

    // Remove pontos de milhar e substitui vírgula por ponto
    const cleanValue = typeof value === 'string' 
      ? value.replace(/\./g, '').replace(',', '.')
      : value.toString();

    // Converte para número
    const numericValue = parseFloat(cleanValue);

    // Retorna o valor convertido, dividindo por 100 se for muito grande
    return numericValue >= 1000 ? numericValue / 100 : numericValue;
  };

  const formatCurrency = (value) => {
    console.log('Formatando valor de moeda:', value);
    // Normaliza o valor primeiro
    const normalizedValue = normalizeCurrencyValue(value);
    
    // Formata para string brasileira
    return normalizedValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const convertBRLToNumber = (value) => {
    console.log('Convertendo valor de BRL para número:', value);
    // Remove pontos de milhar
    const cleanValue = value.replace(/\./g, '')
      // Substitui vírgula por ponto
      .replace(',', '.');
    
    // Converte para número com duas casas decimais
    const result = parseFloat(parseFloat(cleanValue).toFixed(2));
    
    // Log detalhado
    console.log('Conversão de valor:', {
      original: value,
      cleaned: cleanValue,
      result: result
    });

    return result;
  };

  const isOverdueDate = selectedInstallmentForDueDateEdit?.due_date && newDueDate && 
    (
      // Nova data posterior à data original
      differenceInDays(newDueDate, parseISO(selectedInstallmentForDueDateEdit.due_date)) > 0 ||
      // Parcela já está vencida
      isPast(parseISO(selectedInstallmentForDueDateEdit.due_date))
    );

  const handleUpdateDueDateWithInterestAndPenalty = async (installmentId, newDueDate, newAmount, updateBoletoWithFees, updateBoletoOnly) => {
    console.log('Atualizando data de vencimento com juros e multa:', {
      installmentId,
      newDueDate,
      newAmount,
      updateBoletoWithFees,
      updateBoletoOnly
    });
    try {
      // Ativa o estado de carregamento
      setIsUpdatingDueDate(true);

      // Converte a data para o formato ISO
      const formattedDueDate = formatISO(newDueDate, { representation: 'date' });

      console.log('Iniciando atualização de data de vencimento:', { 
        installmentId, 
        newDueDate: formattedDueDate, 
        newAmount,
        updateBoletoWithFees,
        updateBoletoOnly,
        apiSource: 'N8N' 
      });

      // Usa N8N como API principal para este submite específico
      const result = await updateInstallmentDueDate(
        installmentId, 
        formattedDueDate, 
        newAmount, 
        updateBoletoWithFees, 
        updateBoletoOnly, 
        'N8N',
        { 
          // Garante que apenas a atualização de boleto seja enviada no submit único
          update_boleto_only: true 
        }
      );
      
      console.log('Resultado da atualização de data de vencimento:', result);

      // Atualiza o estado local ou mostra feedback
      enqueueSnackbar('Data de vencimento atualizada com sucesso!', { variant: 'success' });
      
      // Recarrega os dados de installments
      await loadInstallments();

      // Fecha o modal de edição de data
      setEditDueDateDialogOpen(false);
    } catch (error) {
      console.error('Erro detalhado ao atualizar data de vencimento:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      enqueueSnackbar('Erro ao atualizar data de vencimento', { variant: 'error' });
    } finally {
      // Desativa o estado de carregamento
      setIsUpdatingDueDate(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {selectedInstallments.length > 0 && (
        <Box sx={{ 
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
        </Box>
      )}
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
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" />}
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
              renderInput={(params) => <TextField {...params} size="small" />}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <TextField
            label="Nome"
            value={fullNameFilter}
            onChange={(e) => setFullNameFilter(e.target.value)}
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
                  startDate && endDate && 
                  isSameDay(startDate, range.startDate) && 
                  isSameDay(endDate, range.endDate) 
                    ? 'primary' 
                    : 'secondary'
                }
                onClick={() => handleQuickDateFilter(range)}
              >
                {range.label}
              </Button>
            ))}
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
                  checked={selectedInstallments.length === installments.items.length}
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
            {installments.items.map((installment) => (
              <TableRow key={installment.installment_id} hover>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selectedInstallments.includes(installment.installment_id)} 
                    onChange={() => handleSelectInstallment(installment.installment_id)}
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
                  {installment.boletos.map((boleto) => (
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
                  {/* Botão de Notificação */}
                  {installment.status === 'Pendente' && 
                   installment.boletos && 
                   installment.boletos.some(boleto => boleto.status === 'A_RECEBER') && (
                    <IconButton 
                      color="warning"
                      onClick={() => handleNotifyInstallment(installment)} 
                      disabled={installment.isNotifying}
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
                      {installment.isNotifying ? (
                        <CircularProgress size={24} color="warning" />
                      ) : (
                        <NotificationsIcon />
                      )}
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
                      <Add />
                    </IconButton>
                  )}

                  {/* Botão de Liquidação de Título */}
                  {installment.status === 'Pendente' && (
                    <IconButton 
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
                      <PaymentIcon />
                    </IconButton>
                  )}

                  {/* Botão de Edição de Data de Vencimento */}
                  <IconButton 
                    size="small"
                    color="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log('Botão de edição clicado:', installment);
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
                    <CalendarMonthIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={installments.total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
          console.log('Fechando modal de edição de data de vencimento');
          setEditDueDateDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <CalendarMonthIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Alterar Parcela</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Seção de informações da parcela vencida */}
          {isPast(parseISO(selectedInstallmentForDueDateEdit?.due_date)) && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2, 
                '& .MuiAlert-message': { 
                  display: 'flex', 
                  flexDirection: 'column' 
                } 
              }}
            >
              <Box>
                <Typography variant="subtitle2">
                  Parcela Vencida
                </Typography>
                <Typography variant="body2">
                  Vencimento Original: {safeFormatDate(selectedInstallmentForDueDateEdit.due_date)}
                </Typography>
                <Typography variant="body2">
                  Valor Original: {formatCurrency(selectedInstallmentForDueDateEdit.balance)}
                </Typography>
              </Box>
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Nova Data de Vencimento"
                  value={newDueDate}
                  onChange={(newValue) => {
                    console.log('Nova data selecionada:', newValue);
                    setNewDueDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" variant="outlined" />}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Novo Valor"
                value={newAmount}
                onChange={(e) => {
                  const cleanedValue = cleanCurrencyValue(e.target.value);
                  setNewAmount(formatCurrency(cleanedValue));
                }}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1, 
                border: '1px solid rgba(0,0,0,0.12)', 
                borderRadius: 1, 
                p: 2, 
                mt: 1 
              }}>
                {isOverdueDate && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={updateBoletoWithFees}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setUpdateBoletoWithFees(isChecked);
                          
                          if (isChecked && selectedInstallmentForDueDateEdit) {
                            const originalBalance = parseFloat(cleanCurrencyValue(selectedInstallmentForDueDateEdit.balance));
                            const newBalance = calculateInterestAndPenalty(parseISO(selectedInstallmentForDueDateEdit.due_date), newDueDate, originalBalance);
                            setNewAmount(formatCurrency(newBalance));
                          } else if (!isChecked && selectedInstallmentForDueDateEdit) {
                            setNewAmount(formatCurrency(selectedInstallmentForDueDateEdit.balance));
                          }
                        }}
                      />
                    }
                    label="Atualizar Valor com Juros e Multa"
                  />
                )}
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
            onClick={() => setEditDueDateDialogOpen(false)} 
            color="secondary"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              console.log('Confirmando alteração de data de vencimento', {
                installmentId: selectedInstallmentForDueDateEdit?.installment_id,
                newDueDate,
                newAmount: cleanCurrencyValue(newAmount),
                updateBoletoWithFees,
                updateBoletoOnly
              });
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
