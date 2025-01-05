import React, { useState, useEffect } from 'react';
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
  Button
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarIcon,
  FilterList as FilterListIcon,
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon, 
  Share as ShareIcon,
  Edit as EditIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { installmentsService } from '../services/api';
import { useSnackbar } from 'notistack';
import { format, formatISO, parseISO } from 'date-fns';
import moment from 'moment-timezone';

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

      console.log('Params enviados para buscar installments:', params);

      const responseData = await installmentsService.list(params);
      
      // Log detalhado para verificar o conteúdo completo dos itens
      console.log('Detalhes completos dos installments:', 
        JSON.stringify(responseData.items, null, 2)
      );

      // Log para verificar o formato dos valores
      console.log('Valores de installments recebidos:', 
        responseData.items.map(item => ({
          id: item.installment_id,
          originalAmount: item.amount,
          amountType: typeof item.amount,
          fullDetails: Object.keys(item)
        }))
      );

      // Mapear para o formato esperado
      const installmentsData = {
        data: responseData.items || [],
        total: responseData.meta?.totalItems || 0
      };

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

  const formatDateDisplay = (date) => {
    return date ? format(date, 'dd MMM yyyy', { locale: ptBR }) : '';
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
    if (typeof value === 'number' && value < 1000) {
      return value;
    }

    // Remove pontos de milhar
    const cleanValue = typeof value === 'string' 
      ? value.replace(/\./g, '').replace(',', '.')
      : value.toString();

    // Converte para número
    const numericValue = parseFloat(cleanValue);

    // Se o valor for muito grande, divide por 100
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

  const handleUpdateDueDate = async () => {
    if (!selectedInstallmentForDueDateEdit || !newDueDate) return;

    try {
      // Converter valor usando a nova função
      const formattedAmount = convertBRLToNumber(newAmount);

      // Log adicional
      console.log('Valor formatado antes do envio:', formattedAmount);

      // Formatar data para zero hora no timezone de São Paulo
      const formattedDate = moment(newDueDate)
        .tz('America/Sao_Paulo')
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        .format('YYYY-MM-DDTHH:mm:ssZ');

      await installmentsService.updateDueDate(
        selectedInstallmentForDueDateEdit.installment_id, 
        {
          due_date: formattedDate,
          amount: formattedAmount
        }
      );
      
      enqueueSnackbar('Data de vencimento atualizada com sucesso!', { variant: 'success' });
      loadInstallments();
      setEditDueDateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar data de vencimento:', error);
      enqueueSnackbar('Erro ao atualizar data de vencimento', { variant: 'error' });
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

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Contas a Receber</Typography>
        <Tooltip title="Compartilhar lista">
          <IconButton onClick={(e) => handleShareClick(e)}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>

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
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
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
                <TableCell>{installment.installment_id}</TableCell>
                <TableCell>{installment.full_name}</TableCell>
                <TableCell>
                  {formatDateDisplay(parseISO(installment.due_date))}
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
                  <IconButton onClick={(e) => handleShareClick(e, installment)}>
                    <ShareIcon />
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

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={handleWhatsAppShare}>
          <WhatsAppIcon sx={{ mr: 1 }} />
          Compartilhar via WhatsApp
        </MenuItem>
        <MenuItem onClick={handleEmailShare}>
          <EmailIcon sx={{ mr: 1 }} />
          Compartilhar via Email
        </MenuItem>
      </Menu>

      <Dialog 
        open={editDueDateDialogOpen} 
        onClose={() => setEditDueDateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            typography: 'h6', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingBottom: 2
          }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Alterar Vencimento - {selectedInstallmentForDueDateEdit?.full_name || 'Parcela'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                <DesktopDatePicker
                  label="Nova Data de Vencimento"
                  value={newDueDate}
                  onChange={(newValue) => setNewDueDate(newValue)}
                  slots={{
                    textField: (params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        label="Nova Data de Vencimento" 
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                          sx: {
                            position: 'relative',
                            transform: 'none',
                            marginBottom: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            marginTop: '0 !important'
                          }
                        }}
                      />
                    )
                  }}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Valor"
                value={newAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove caracteres não numéricos, exceto vírgula
                  const cleanValue = value.replace(/[^\d,]/g, '');
                  setNewAmount(cleanValue);
                }}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
              />
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
            onClick={handleUpdateDueDate} 
            color="primary" 
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Confirmar Pagamento</DialogTitle>
        <DialogContent>
          <TextField
            label="Valor"
            value={paymentValue}
            onChange={(e) => setPaymentValue(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  R$
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmPayment} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
