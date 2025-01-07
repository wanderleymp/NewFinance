import React, { useState, useEffect, useMemo } from 'react';
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
  Checkbox
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarIcon,
  FilterList as FilterListIcon,
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon, 
  Share as ShareIcon,
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { 
  AttachMoney as MoneyIcon, 
  CheckCircle as PaidIcon, 
  PendingActions as PendingIcon 
} from '@mui/icons-material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { formatISO, parseISO, format, addDays } from 'date-fns';
import { useSnackbar } from 'notistack';
import { installmentsService, updateInstallmentDueDate } from '../services/api';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isSameDay } from 'date-fns';
import axios from 'axios';

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

export default function Installments() {
  const [installments, setInstallments] = useState({
    data: [],
    total: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('');
  const [fullNameFilter, setFullNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [editDueDateDialogOpen, setEditDueDateDialogOpen] = useState(false);
  const [selectedInstallmentForDueDateEdit, setSelectedInstallmentForDueDateEdit] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInstallmentForPayment, setSelectedInstallmentForPayment] = useState(null);
  const [paymentValue, setPaymentValue] = useState('');
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [isNotifyingSelected, setIsNotifyingSelected] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const statusOptions = [
    { value: '', label: 'Nenhum' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' }
  ];

  const loadInstallments = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        start_date: startDate ? formatISO(startDate, { representation: 'date' }) : undefined,
        end_date: endDate ? formatISO(endDate, { representation: 'date' }) : undefined,
        status: status || undefined,
        full_name: fullNameFilter || undefined,
      };

      // Log detalhado de todos os parâmetros
      console.log('PARÂMETROS COMPLETOS:', JSON.stringify({
        page: params.page,
        limit: params.limit,
        start_date: params.start_date,
        end_date: params.end_date,
        status: params.status,
        full_name: params.full_name,
        fullNameFilter: fullNameFilter,
        currentStatus: status
      }, null, 2));

      console.log('Params enviados para buscar installments:', params);

      const responseData = await installmentsService.list(params);
      
      // Log detalhado para verificar o conteúdo completo dos itens
      console.log('Detalhes completos dos installments:', 
        JSON.stringify(responseData.items, null, 2)
      );

      // Correção na extração dos dados
      const installmentsData = {
        data: responseData.items || [],
        total: responseData.total || responseData.meta?.total || 0
      };

      console.log('Resposta completa da API:', responseData);
      console.log('Total de itens:', installmentsData.total);
      console.log('Dados de installments:', installmentsData);

      setInstallments(installmentsData);
    } catch (error) {
      console.error('Error loading installments:', error);
      enqueueSnackbar('Erro ao carregar contas a receber', { variant: 'error' });
      setInstallments({ data: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Status atual:', status);
    loadInstallments();
  }, [page, rowsPerPage, startDate, endDate, status, fullNameFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderBoletoStatus = (status) => {
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
    // Cria um estado de processamento específico para este installment
    const updatedInstallments = installments.data.map(item => 
      item.installment_id === installment.installment_id 
        ? { ...item, isNotifying: true } 
        : item
    );
    
    setInstallments(prev => ({
      ...prev,
      data: updatedInstallments
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
      const resetInstallments = installments.data.map(item => 
        item.installment_id === installment.installment_id 
          ? { ...item, isNotifying: false } 
          : item
      );
      
      setInstallments(prev => ({
        ...prev,
        data: resetInstallments
      }));
    }
  };

  const handleShareClick = (event, installment = null) => {
    setShareAnchorEl(event.currentTarget);
    setSelectedInstallment(installment);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
    setSelectedInstallment(null);
  };

  const handleWhatsAppShare = () => {
    // Lógica para compartilhar via WhatsApp
    handleShareClose();
  };

  const handleEmailShare = () => {
    // Lógica para compartilhar via Email
    handleShareClose();
  };

  const normalizeCurrencyValue = (value) => {
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
    // Normaliza o valor primeiro
    const normalizedValue = normalizeCurrencyValue(value);
    
    // Formata para string brasileira
    return normalizedValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleEditDueDate = (installment) => {
    setSelectedInstallmentForDueDateEdit(installment);
    setNewDueDate(new Date(installment.due_date));
    
    // Formatar valor para exibição correta
    setNewAmount(formatCurrency(installment.balance));
    setEditDueDateDialogOpen(true);
  };

  const convertBRLToNumber = (value) => {
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

  const handleUpdateDueDate = async (installmentId, newDueDate) => {
    try {
      // Ativa o estado de carregamento
      setIsUpdatingDueDate(true);

      // Converte a data para o formato ISO
      const formattedDueDate = formatISO(newDueDate, { representation: 'date' });

      console.log('Iniciando atualização de data de vencimento:', { 
        installmentId, 
        newDueDate: formattedDueDate, 
        apiSource: 'N8N' 
      });

      // Usa N8N como API principal para este submite específico
      const result = await updateInstallmentDueDate(installmentId, formattedDueDate, 'N8N');
      
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
    // Só abre para status Pendente
    if (installment.status !== 'Pendente') return;

    setSelectedInstallmentForPayment(installment);
    setPaymentValue(installment.amount.toString().replace('.', ','));
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInstallmentForPayment) return;

    try {
      // Converter valor de volta para formato numérico
      const numericValue = parseFloat(paymentValue.replace(',', '.'));
      
      // Preparar dados para pagamento
      const paymentData = {
        value: numericValue,
        payment_date: formatISO(new Date(), { representation: 'date' })
      };

      // Chamar serviço de pagamento (você precisará adicionar este método)
      await installmentsService.confirmPayment(
        selectedInstallmentForPayment.installment_id, 
        paymentData
      );
      
      enqueueSnackbar('Pagamento confirmado com sucesso!', { variant: 'success' });
      loadInstallments();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      enqueueSnackbar('Erro ao confirmar pagamento', { variant: 'error' });
    }
  };

  const getQuickDateRanges = () => {
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
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const calculateInstallmentsSummary = (data) => {
    console.group('Cálculo de Resumo de Installments');
    console.log('Dados recebidos:', data);

    if (!data || data.length === 0) {
      console.log('Dados vazios, retornando resumo zerado');
      console.groupEnd();
      return {
        totalAmount: 0,
        pendingAmount: 0,
        paidAmount: 0,
        totalInstallments: 0,
        pendingInstallments: 0,
        paidInstallments: 0
      };
    }

    const paymentStatusMap = {
      'Pendente': 'pending',
      'Pago': 'paid',
      'Parcial': 'partial',
      'Vencido': 'overdue'
    };

    const summary = data.reduce((acc, installment) => {
      // Log de cada installment sendo processado
      console.log('Processando installment:', {
        id: installment.installment_id,
        amount: installment.amount,
        status: installment.status
      });

      // Normaliza o valor
      const amount = normalizeCurrencyValue(installment.amount);
      
      // Incrementa totais
      acc.totalAmount += amount;
      acc.totalInstallments += 1;

      // Determina o status de pagamento
      const paymentStatus = paymentStatusMap[installment.status] || 'unknown';

      // Separa por status
      switch (paymentStatus) {
        case 'pending':
          acc.pendingAmount += amount;
          acc.pendingInstallments += 1;
          console.log(`Installment Pendente: +${amount}`);
          break;
        case 'paid':
          acc.paidAmount += amount;
          acc.paidInstallments += 1;
          console.log(`Installment Pago: +${amount}`);
          break;
        case 'partial':
          acc.pendingAmount += amount / 2;
          acc.paidAmount += amount / 2;
          acc.pendingInstallments += 1;
          acc.paidInstallments += 1;
          console.log(`Installment Parcial: +${amount/2} (pendente e pago)`);
          break;
        case 'overdue':
          acc.pendingAmount += amount;
          acc.pendingInstallments += 1;
          console.log(`Installment Vencido: +${amount}`);
          break;
        default:
          console.warn('Status de installment não reconhecido:', installment.status);
      }

      return acc;
    }, {
      totalAmount: 0,
      pendingAmount: 0,
      paidAmount: 0,
      totalInstallments: 0,
      pendingInstallments: 0,
      paidInstallments: 0
    });

    console.log('Resumo final:', summary);
    console.groupEnd();

    return summary;
  };

  const installmentsSummary = useMemo(() => {
    return calculateInstallmentsSummary(installments.data);
  }, [installments.data]);

  useEffect(() => {
    console.log('Estado completo de installments:', installments);
  }, [installments]);

  const handleSelectAllInstallments = (event) => {
    if (event.target.checked) {
      const allInstallmentIds = installments.data.map(item => item.installment_id);
      setSelectedInstallments(allInstallmentIds);
    } else {
      setSelectedInstallments([]);
    }
  };

  const handleSelectInstallment = (installmentId) => {
    setSelectedInstallments(prev => 
      prev.includes(installmentId)
        ? prev.filter(id => id !== installmentId)
        : [...prev, installmentId]
    );
  };

  const handleNotifySelectedInstallments = async () => {
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
        {/* Removido ícone de notificação de listagem */}
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
                R$ {formatCurrency(installmentsSummary.totalAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {installmentsSummary.totalInstallments} parcelas
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
                R$ {formatCurrency(installmentsSummary.pendingAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {installmentsSummary.pendingInstallments} parcelas
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
                R$ {formatCurrency(installmentsSummary.paidAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {installmentsSummary.paidInstallments} parcelas
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
            <DesktopDatePicker
              label="Data Inicial"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slots={{
                textField: (params) => <TextField {...params} size="small" />
              }}
              format="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
            <DesktopDatePicker
              label="Data Final"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slots={{
                textField: (params) => <TextField {...params} size="small" />
              }}
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
                  checked={selectedInstallments.length === installments.data.length}
                />
              </TableCell>
              <TableCell>ID Parcela</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Boletos</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {installments.data.map((installment) => (
              <TableRow key={installment.installment_id} hover>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selectedInstallments.includes(installment.installment_id)} 
                    onChange={() => handleSelectInstallment(installment.installment_id)}
                  />
                </TableCell>
                <TableCell>{installment.installment_id}</TableCell>
                <TableCell>{installment.full_name}</TableCell>
                <TableCell>
                  {formatDateDisplay(installment.due_date)}
                </TableCell>
                <TableCell>R$ {formatCurrency(installment.amount)}</TableCell>
                <TableCell>
                  {renderInstallmentStatus(installment.status)}
                </TableCell>
                <TableCell>
                  {installment.boletos.map((boleto) => (
                    <Box key={boleto.boleto_id} sx={{ mb: 1 }}>
                      {renderBoletoStatus(boleto.status)} {boleto.boleto_number}
                    </Box>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleNotifyInstallment(installment)} 
                    disabled={installment.isNotifying}
                  >
                    {installment.isNotifying ? (
                      <CircularProgress size={24} />
                    ) : (
                      <NotificationsIcon />
                    )}
                  </IconButton>
                  <IconButton onClick={() => handleEditDueDate(installment)}>
                    <CalendarTodayIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenPaymentDialog(installment)}>
                    <EditIcon />
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
        labelRowsPerPage="Linhas por página"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h6">Resumo:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="body1">
            Total: R$ {formatCurrency(installmentsSummary.totalAmount)}
          </Typography>
          <Typography variant="body1">
            Pendente: R$ {formatCurrency(installmentsSummary.pendingAmount)}
          </Typography>
          <Typography variant="body1">
            Pago: R$ {formatCurrency(installmentsSummary.paidAmount)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
