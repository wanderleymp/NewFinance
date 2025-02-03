import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
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
  IconButton, 
  Tooltip, 
  Chip, 
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  TableSortLabel,
  Radio,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PostAdd as PostAddIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  List as ListViewIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  NavigateBefore as BeforeIcon,
  NavigateNext as NextIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Share as ShareIcon,
  Description as DescriptionIcon,
  ContentCopy as ContentCopyIcon,
  QrCode as QrCodeIcon,
  RequestQuote as RequestQuoteIcon,
  Cancel as CancelIcon,
  Speed as SpeedIcon,
  ListAlt as ListAltIcon,
  RocketLaunch as AIIcon,
  Close as CloseIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList'; // Importação correta do ícone
import { movementsService } from '../services/api';
import MovementForm from '../components/MovementForm';
import axios from 'axios';
import { endOfDay, format, formatISO, parseISO, startOfDay, subDays, addDays, isValid, sub } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  Stack, 
  ToggleButtonGroup, 
  ToggleButton, 
  Pagination, 
  InputAdornment, 
  OutlinedInput, 
  TablePagination, 
  Fab, 
  Checkbox,
  Divider,
  Menu,
  Link
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Funções utilitárias para cores de status e tipo
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmado':
    case 'confirmed':
      return 'success';
    case 'pendente':
    case 'pending':
      return 'warning';
    case 'cancelado':
    case 'cancelled':
      return 'error';
    case 'draft':
    case 'rascunho':
      return 'default';
    default:
      return 'default';
  }
};

const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'venda':
    case 'sale':
    case 'contrato venda':
      return 'success';
    case 'compra':
    case 'purchase':
    case 'contrato compra':
      return 'info';
    default:
      return 'default';
  }
};

const MovementCard = ({ movement }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const status = movement.status || movement.status_name || 'draft';
  const statusId = movement.movement_status_id || movement.status_id || 1;
  const isConfirmed = statusId === 2;

  const description = movement.description || 'Sem descrição';
  const amount = movement.amount || movement.total_amount || 0;
  const date = movement.date || movement.movement_date || new Date();
  const customer = movement.customer || movement.person_name || 'Cliente não especificado';
  const personId = movement.person_id || 'N/A';
  const typeId = movement.movement_type_id || movement.type_id || 1;

  const handleEdit = () => {
    navigate(`/movements/${movement.id}`);
  };

  const handleDelete = async () => {
    try {
      await movementsService.delete(movement.id);
      enqueueSnackbar('Movimento excluído com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao excluir movimento:', error);
      enqueueSnackbar('Erro ao excluir movimento', { variant: 'error' });
    }
  };

  return (
    <Box
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Box sx={{ flex: 1, p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {format(parseISO(date), 'dd/MM/yyyy')}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={getTypeLabel(typeId)}
              size="small"
              color={getTypeColor(typeId)}
            />
            <Chip
              label={status}
              size="small"
              color={getStatusColor(status)}
            />
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Cliente
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip 
                label={personId}
                size="small"
                variant="outlined"
                sx={{ minWidth: 70 }}
              />
              <Typography variant="body1">
                {customer}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Tipo
            </Typography>
            <Chip 
              label={getTypeLabel(typeId)}
              size="small"
              color={getTypeColor(typeId)}
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Valor
            </Typography>
            <Typography 
              variant="h6" 
              color={amount >= 0 ? 'success.main' : 'error.main'}
              sx={{ mt: 0.5 }}
            >
              {formatCurrency(amount)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

const getTypeLabel = (typeId) => {
  switch (typeId.toString()) {
    case '1':
      return 'Venda';
    case '2':
      return 'Compra';
    case '3':
      return 'Contrato Venda';
    case '4':
      return 'Contrato Compra';
    default:
      return 'Não especificado';
  }
};

const renderInstallmentDetails = (movement) => {
  console.log('🔍 Dados do movimento para Installments:', JSON.stringify(movement, null, 2));
  
  const installments = movement.installments || 
                       movement.payments?.flatMap(p => p.installments || []) || 
                       movement.payment?.installments || 
                       [];

  console.log('🔢 Parcelas encontradas:', installments.length);

  if (installments.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        Sem parcelas cadastradas
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Parcelas</Typography>
      <List dense>
        {installments.map((installment, index) => (
          <ListItem key={installment.installment_id || index}>
            <ListItemText
              primary={`Parcela ${installment.installment_number || (index + 1)}`}
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    Valor: {formatCurrency(installment.amount || 0)}
                    {' | '}
                    Status: {installment.status || 'Não definido'}
                    {installment.due_date && (
                      <>
                        {' | '}
                        Vencimento: {format(parseISO(installment.due_date), 'dd/MM/yyyy')}
                      </>
                    )}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const renderBoletoDetails = (movement) => {
  const boletos = movement.boletos || [];

  console.log('🔍 Dados completos do movimento:', movement);
  console.log('🔍 Boletos encontrados:', boletos);

  if (boletos.length === 0) {
    return null;
  }

  const handleOpenPdf = (boleto) => {
    console.log('🔍 Dados do boleto ao clicar:', boleto);
    
    // Tentar encontrar a URL do boleto em diferentes locais
    const url = boleto.url || // tenta url direto
                boleto.boleto_url || // tenta boleto_url
                boleto.pdf_url || // tenta pdf_url
                (boleto.payment && boleto.payment.boleto_url) || // tenta no payment
                (typeof boleto === 'string' ? boleto : null); // se for string direta
    
    console.log('🔍 URL encontrada:', url);
    
    if (url) {
      window.open(url, '_blank');
    } else {
      enqueueSnackbar('URL do boleto não disponível', { variant: 'warning' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'A_RECEBER':
        return 'success';
      case 'PENDENTE':
        return 'warning';
      case 'CANCELADO':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Boletos</Typography>
      {boletos.map((boleto, index) => {
        // Log para cada boleto individual
        console.log(`🔍 Processando boleto ${index + 1}:`, boleto);
        
        return (
          <Box 
            key={boleto.boleto_id || index} 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            mb={1}
            sx={{
              backgroundColor: 'background.paper',
              p: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Boleto {boleto.boleto_number || (index + 1)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={boleto.status || 'Não definido'} 
                  size="small" 
                  color={getStatusColor(boleto.status)}
                  sx={{ height: 24 }}
                />
                {boleto.generated_at && (
                  <Typography variant="body2" color="text.secondary">
                    Gerado em: {format(parseISO(boleto.generated_at), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                )}
              </Box>
            </Box>
            {(boleto.status === 'A_RECEBER' || boleto.status === 'PENDENTE') && (
              <IconButton 
                size="small"
                onClick={() => handleOpenPdf(boleto)}
                disabled={!(boleto.url || boleto.boleto_url || boleto.pdf_url || (boleto.payment && boleto.payment.boleto_url))}
                sx={{ cursor: 'pointer' }}
              >
                <ReceiptIcon 
                  color={(boleto.url || boleto.boleto_url || boleto.pdf_url || (boleto.payment && boleto.payment.boleto_url)) ? 'primary' : 'disabled'} 
                />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const renderInvoiceDetails = (movement) => {
  console.log('🔍 Invoices do movimento:', {
    invoices: movement.invoices,
    detalhes: movement.invoices?.map(i => ({
      status: i.status,
      pdfUrl: i.pdf_url
    }))
  });

  const invoices = movement.invoices || [];

  if (invoices.length === 0) {
    return null;
  }

  const handleOpenPdf = (pdfUrl) => {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'autorizada':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Notas Fiscais</Typography>
      {invoices.map((invoice, index) => (
        <Box 
          key={invoice.invoice_id || index} 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={1}
          sx={{
            backgroundColor: 'background.paper',
            p: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Nota Fiscal {invoice.number || (index + 1)}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={invoice.status || 'Não definido'} 
                size="small" 
                color={getStatusColor(invoice.status)}
                sx={{ height: 24 }}
              />
              {invoice.total_amount && (
                <Typography variant="body2" color="text.secondary">
                  Valor: {formatCurrency(invoice.total_amount)}
                </Typography>
              )}
            </Box>
          </Box>
          {(invoice.status === 'autorizada' || invoice.status === 'pendente') && (
            <IconButton 
              size="small"
              onClick={() => handleOpenPdf(invoice.pdf_url)}
              disabled={!invoice.pdf_url}
            >
              <DescriptionIcon color={invoice.pdf_url ? 'primary' : 'disabled'} />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
};

const InstallmentRow = ({ installment }) => {
  return (
    <TableRow>
      <TableCell>{installment.installment_number}</TableCell>
      <TableCell>{format(new Date(installment.due_date), 'dd/MM/yyyy')}</TableCell>
      <TableCell>{formatCurrency(installment.amount)}</TableCell>
      <TableCell>
        <Chip 
          label={installment.status}
          color={installment.status === 'Pendente' ? 'warning' : 'success'}
        />
      </TableCell>
      <TableCell>
        {renderBoletoDetails([installment])}
      </TableCell>
    </TableRow>
  );
};

const MovementRow = ({ movement, onMovementUpdate }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

  // Log para debug
  console.log('🎯 Dados do movimento recebidos:', movement);

  // Mapeamento dos campos da API
  const movementId = movement.movement_id;
  const customerName = movement.full_name || 'Cliente não especificado';
  const totalAmount = movement.total_amount;
  const movementDate = movement.movement_date;
  const description = movement.description;
  const statusName = movement.status_name;
  const typeName = movement.type_name;

  // Se não tiver ID, não renderiza a linha
  if (!movementId) {
    console.warn('⚠️ Movimento sem ID detectado:', movement);
    return null;
  }

  // Detalhes de pagamentos
  const payments = movement.payments || [];
  const installments = movement.installments || 
                       payments.flatMap(p => p.installments || []) || 
                       [];
  const invoices = movement.invoices || 
                   payments.flatMap(p => p.invoices || []) || 
                   [];

  // Função para renderizar detalhes
  const renderDetails = () => {
    console.log('🔍 Detalhes do movimento:', {
      installments,
      invoices,
      boletos: movement.boletos,
      payments
    });

    const hasDetails = 
      installments.length > 0 || 
      invoices.length > 0 || 
      payments.some(p => p.installments?.length > 0) ||
      (movement.boletos && movement.boletos.length > 0) ||
      (movement.invoices && movement.invoices.length > 0);

    if (!hasDetails) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
          Nenhum detalhe disponível para esta movimentação
        </Typography>
      );
    }

    return (
      <>
        {renderInstallmentDetails(movement)}
        {renderBoletoDetails(movement)}
        {renderInvoiceDetails(movement)}
      </>
    );
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/movements/${movementId}`);
  };

  const handleEditMovement = (e) => {
    e.stopPropagation();
    navigate(`/movements/edit/${movementId}`);
  };

  const handleCancelMovement = async (e) => {
    e.stopPropagation();
    try {
      console.log('🔄 Iniciando cancelamento do movimento:', {
        movementId,
        statusName,
        currentStatus: movement.movement_status_id
      });

      if (movement.movement_status_id === MOVEMENT_STATUS.CANCELED) {
        enqueueSnackbar('Movimentação já está cancelada!', { variant: 'warning' });
        return;
      }

      // Envia o status CANCELED na requisição
      const result = await movementsService.cancel(movementId, MOVEMENT_STATUS.CANCELED);
      console.log('✅ Movimento cancelado com sucesso:', result);
      
      // Busca os dados atualizados do movimento
      const refreshedData = await movementsService.get(movementId);
      
      if (refreshedData) {
        // Notifica o componente pai da atualização
        if (typeof onMovementUpdate === 'function') {
          onMovementUpdate(refreshedData);
        }
      }

      // Mostra mensagem de sucesso
      enqueueSnackbar('Movimentação cancelada com sucesso!', { 
        variant: 'success',
        autoHideDuration: 3000
      });
      
    } catch (error) {
      console.error('❌ Erro ao cancelar movimentação:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        enqueueSnackbar('Sessão expirada. Por favor, faça login novamente.', { 
          variant: 'error',
          autoHideDuration: 5000
        });
        navigate('/login');
      } else {
        enqueueSnackbar(
          error.response?.data?.message || 
          error.message || 
          'Erro ao cancelar movimentação', 
          { variant: 'error' }
        );
      }
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.stopPropagation();
    try {
      enqueueSnackbar('Gerando Nota Fiscal...', { variant: 'info' });
      const nfse = await movementsService.generateNfse(movementId);
      
      enqueueSnackbar('Nota Fiscal gerada com sucesso!', { variant: 'success' });
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao gerar Nota Fiscal:', error);
      enqueueSnackbar(error.message || 'Erro ao gerar Nota Fiscal', { variant: 'error' });
    }
  };

  const handleNotificationClick = async (event) => {
    event.stopPropagation();
    try {
      const response = await axios.post(
        'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/faturamento', 
        { movement_id: movementId },
        {
          headers: {
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
            'Content-Type': 'application/json'
          }
        }
      );
      
      enqueueSnackbar('Notificação enviada com sucesso!', { 
        variant: 'success',
        autoHideDuration: 2000
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error.response?.data || error.message);
      enqueueSnackbar('Erro ao enviar notificação', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  return (
    <>
      <TableRow 
        hover
        onClick={() => setOpen(!open)}
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          cursor: 'pointer',
          backgroundColor: open ? 'action.hover' : 'inherit'
        }}
      >
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">{format(parseISO(movementDate), 'dd/MM/yyyy')}</TableCell>
        <TableCell align="left">{description}</TableCell>
        <TableCell align="center">{movementId}</TableCell>
        <TableCell align="center">{movement.person_id}</TableCell>
        <TableCell align="left">{customerName}</TableCell>
        <TableCell align="left">{typeName}</TableCell>
        <TableCell align="right">{formatCurrency(totalAmount)}</TableCell>
        <TableCell align="center">
          <Chip 
            label={statusName}
            color={getStatusColor(statusName)}
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title="Visualizar Detalhes">
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMovement();
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelMovement(e);
                }}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Enviar Notificação">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(e);
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalhes da Movimentação
              </Typography>
              {renderDetails()}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const MovementTable = ({ 
  movements = [], 
  onSort, 
  orderBy, 
  orderDirection, 
  page, 
  rowsPerPage, 
  onPageChange, 
  onRowsPerPageChange, 
  totalCount,
  onMovementUpdate 
}) => {
  const safeMovements = Array.isArray(movements) ? movements : [];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    onSort(property, isAsc ? 'desc' : 'asc');
    setPage(0);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: 'transparent',
        '& .MuiTableCell-root': {
          borderColor: 'divider',
        },
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="medium">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <IconButton size="small" disabled>
                  <KeyboardArrowDownIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'movement_date'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('movement_date')}
                >
                  Data
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('description')}
                >
                  Descrição
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'movement_id'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('movement_id')}
                >
                  Código
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'person_id'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('person_id')}
                >
                  Código Cliente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'full_name'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('full_name')}
                >
                  Nome Cliente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type_name'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('type_name')}
                >
                  Tipo
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'total_amount'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('total_amount')}
                >
                  Valor
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'status_name'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleRequestSort('status_name')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeMovements.map((movement) => (
              <MovementRow 
                key={movement.movement_id} 
                movement={movement}
                onMovementUpdate={onMovementUpdate}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Itens por página"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  );
};

const DateRangeSelector = ({ dateRange, onDateRangeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodSelect = (newPeriod) => {
    let start, end;
    const today = new Date();
    
    switch (newPeriod) {
      case 'today':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'week':
        start = startOfDay(subDays(today, 6)); // últimos 7 dias
        end = endOfDay(today);
        break;
      case 'month':
        start = startOfDay(subDays(today, 29)); // últimos 30 dias
        end = endOfDay(today);
        break;
      case 'month3':
        start = startOfDay(subDays(today, 89)); // últimos 90 dias
        end = endOfDay(today);
        break;
      case 'month6':
        start = startOfDay(subDays(today, 179)); // últimos 180 dias
        end = endOfDay(today);
        break;
      case 'year':
        start = startOfDay(subDays(today, 364)); // últimos 365 dias
        end = endOfDay(today);
        break;
      default:
        return;
    }
    
    onDateRangeChange([start, end]);
    handleClose();
  };

  // Garantir que dateRange é um array com duas datas válidas
  const [startDate, endDate] = Array.isArray(dateRange) && dateRange.length === 2 
    ? dateRange.map(date => date instanceof Date ? date : new Date())
    : [subDays(new Date(), 7), new Date()];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={() => {
        onDateRangeChange([subDays(startDate, 1), subDays(endDate, 1)]);
      }}>
        <BeforeIcon />
      </IconButton>
      
      <Button
        onClick={handleClick}
        startIcon={<DateRangeIcon />}
        endIcon={<FilterIcon />}
        variant="outlined"
        size="small"
      >
        {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
      </Button>
      
      <IconButton onClick={() => {
        onDateRangeChange([addDays(startDate, 1), addDays(endDate, 1)]);
      }}>
        <NextIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Período
          </Typography>
          <Stack spacing={1}>
            <Button size="small" onClick={() => handlePeriodSelect('today')}>
              Hoje
            </Button>
            <Button size="small" onClick={() => handlePeriodSelect('week')}>
              Últimos 7 dias
            </Button>
            <Button size="small" onClick={() => handlePeriodSelect('month')}>
              Últimos 30 dias
            </Button>
            <Button size="small" onClick={() => handlePeriodSelect('month3')}>
              Últimos 90 dias
            </Button>
            <Button size="small" onClick={() => handlePeriodSelect('month6')}>
              Últimos 180 dias
            </Button>
            <Button size="small" onClick={() => handlePeriodSelect('year')}>
              Último ano
            </Button>
          </Stack>
        </Box>
      </Menu>
    </Box>
  );
};

const MOVEMENT_STATUS = {
  DRAFT: 1,
  CONFIRMED: 2,
  CANCELED: 3
};

const MOVEMENT_STATUS_LABELS = {
  [MOVEMENT_STATUS.DRAFT]: 'Rascunho',
  [MOVEMENT_STATUS.CONFIRMED]: 'Confirmado',
  [MOVEMENT_STATUS.CANCELED]: 'Cancelado'
};

const MovementStatusFilter = ({ 
  selectedStatuses, 
  onStatusChange 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusToggle = (status) => {
    // Se o status já está selecionado, remove ele (nenhum filtro)
    if (selectedStatuses.includes(status)) {
      onStatusChange([]);
    } else {
      // Caso contrário, seleciona apenas este status
      onStatusChange([status]);
    }
  };

  return (
    <Box>
      <Button
        id="status-filter-button"
        aria-controls={open ? 'status-filter-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        endIcon={<FilterListIcon />}
      >
        Status: {selectedStatuses.length === 0 ? 'Nenhum' : (
          selectedStatuses.includes(MOVEMENT_STATUS.DRAFT) ? 'Rascunho' :
          selectedStatuses.includes(MOVEMENT_STATUS.CONFIRMED) ? 'Confirmado' :
          selectedStatuses.includes(MOVEMENT_STATUS.CANCELED) ? 'Cancelado' : 'Nenhum'
        )}
      </Button>
      <Menu
        id="status-filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleStatusToggle(MOVEMENT_STATUS.DRAFT)}>
          <Radio checked={selectedStatuses.includes(MOVEMENT_STATUS.DRAFT)} />
          Rascunho
        </MenuItem>
        <MenuItem onClick={() => handleStatusToggle(MOVEMENT_STATUS.CONFIRMED)}>
          <Radio checked={selectedStatuses.includes(MOVEMENT_STATUS.CONFIRMED)} />
          Confirmado
        </MenuItem>
        <MenuItem onClick={() => handleStatusToggle(MOVEMENT_STATUS.CANCELED)}>
          <Radio checked={selectedStatuses.includes(MOVEMENT_STATUS.CANCELED)} />
          Cancelado
        </MenuItem>
      </Menu>
    </Box>
  );
};

const MovementFilters = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchParams,
  onFilterChange
}) => {
  const [localSearchParams, setLocalSearchParams] = useState(searchParams);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Atualiza os filtros locais quando os props mudam
  useEffect(() => {
    setLocalSearchParams(searchParams);
  }, [searchParams]);

  // Debounce para atualização dos filtros
  const updateFilters = useCallback((params) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      onFilterChange(params);
    }, 500);

    setSearchTimeout(timeoutId);
  }, [onFilterChange]);

  // Handler para mudança nos campos de texto
  const handleInputChange = (field) => (event) => {
    const newParams = {
      ...localSearchParams,
      [field]: event.target.value
    };
    setLocalSearchParams(newParams);
    updateFilters(newParams);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filtros de Data */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <DatePicker
            label="Data Inicial"
            value={startDate}
            onChange={onStartDateChange}
            slotProps={{
              textField: {
                size: 'small'
              }
            }}
          />
          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={onEndDateChange}
            slotProps={{
              textField: {
                size: 'small'
              }
            }}
          />
        </Box>
      </LocalizationProvider>

      {/* Outros Filtros */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Código"
          value={localSearchParams.movementId}
          onChange={handleInputChange('movementId')}
        />
        <TextField
          size="small"
          label="Código Cliente"
          value={localSearchParams.personId}
          onChange={handleInputChange('personId')}
        />
        <TextField
          size="small"
          label="Descrição"
          value={localSearchParams.description}
          onChange={handleInputChange('description')}
        />
        <FormControl size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={localSearchParams.typeId}
            onChange={handleInputChange('typeId')}
            label="Tipo"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="1">Entrada</MenuItem>
            <MenuItem value="2">Saída</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

const Movements = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]); // Garantindo array vazio como estado inicial
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('movement_date');
  const [orderDirection, setOrderDirection] = useState('DESC');
  
  // Novo estado para rastrear carregamentos
  const [loadCount, setLoadCount] = useState(0);
  
  // Inicializando com status Confirmado
  const [selectedStatuses, setSelectedStatuses] = useState([MOVEMENT_STATUS.CONFIRMED]);
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 7 }));
  const [endDate, setEndDate] = useState(new Date());
  const [searchParams, setSearchParams] = useState({
    personId: '',
    movementId: '',
    description: '',
    statusId: '',
    typeId: ''
  });
  const [openNewMovementModal, setOpenNewMovementModal] = useState(false);

  // Função para abrir o modal de novo movimento
  const handleOpenNewMovementModal = () => {
    setOpenNewMovementModal(true);
  };

  // Função para fechar o modal de novo movimento
  const handleCloseNewMovementModal = () => {
    setOpenNewMovementModal(false);
  };

  // Função para criar novo movimento
  const handleNewMovement = (type) => {
    navigate(`/movements/new/${type}`);
    handleCloseNewMovementModal();
  };

  // Função para atualizar um movimento na lista
  const handleMovementUpdate = (updatedMovement) => {
    console.log('🔄 Atualizando movimento:', updatedMovement);
    
    // Verifica se o movimento foi cancelado
    const isCanceled = 
      updatedMovement.movement_status_id === MOVEMENT_STATUS.CANCELED ||
      updatedMovement.status_name === 'Cancelado';

    setMovements(prevMovements => {
      // Se o movimento foi cancelado, remove da lista
      if (isCanceled) {
        console.log('❌ Movimento cancelado, removendo da lista:', updatedMovement.movement_id);
        return prevMovements.filter(movement => 
          movement.movement_id !== updatedMovement.movement_id
        );
      }
      
      // Caso contrário, atualiza o movimento na lista
      return prevMovements.map(movement => 
        movement.movement_id === updatedMovement.movement_id 
          ? updatedMovement 
          : movement
      );
    });
  };

  // Função para carregar os movimentos
  const loadMovements = useCallback(async () => {
    // Incrementa o contador de carregamentos
    setLoadCount(prevCount => prevCount + 1);

    // Limita o número de tentativas de carregamento
    if (loadCount >= 3) {
      console.warn('⚠️ Limite de carregamentos atingido. Interrompendo chamadas.');
      return;
    }

    if (loading) {
      console.log(`🔄 Carregamento em andamento. Contagem: ${loadCount}`);
      return; // Evita múltiplas chamadas simultâneas
    }
    
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        orderBy,
        orderDirection,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        ...(searchParams.description && { search: searchParams.description }),
        ...(selectedStatuses.length > 0 && { movement_status_id: selectedStatuses[0] })
      };

      console.log(`🔄 Carregando movimentos (Tentativa ${loadCount}):`, params);
      const response = await movementsService.list(params);
      console.log('✅ Resposta da API:', response);
      
      if (!response || !response.items) {
        console.error('❌ Resposta inválida da API:', response);
        throw new Error('Resposta inválida da API');
      }

      setMovements(response.items);
      setTotalCount(response.total || 0);
      // Reseta o contador de carregamentos em caso de sucesso
      setLoadCount(0);
    } catch (error) {
      console.error('❌ Erro ao carregar movimentos:', error);
      if (error.response) {
        console.error('Detalhes do erro:', error.response);
      }
      enqueueSnackbar('Erro ao carregar movimentos. Por favor, tente novamente.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      // Limpa os dados em caso de erro
      setMovements([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, orderDirection, startDate, endDate, searchParams, selectedStatuses, enqueueSnackbar]);

  // Efeito para carregar os movimentos quando os parâmetros mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMovements();
    }, 300); // Adiciona um pequeno delay para evitar múltiplas chamadas

    return () => clearTimeout(timer);
  }, [loadMovements]);

  // Handlers para ordenação e paginação
  const handleSort = (field, direction) => {
    setOrderDirection(direction);
    setOrderBy(field);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler para atualização dos filtros
  const handleFilterChange = (filters) => {
    // Remove o statusId dos filtros de busca pois agora ele é controlado separadamente
    const { statusId, ...otherFilters } = filters;
    setSearchParams(otherFilters);
    setPage(0);
  };

  const handleStatusChange = (statuses) => {
    setSelectedStatuses(statuses);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenNewMovementModal}
            startIcon={<AddIcon />}
          >
            Novo Movimento
          </Button>
        </Box>

        <MovementFilters
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          searchParams={searchParams}
          onFilterChange={handleFilterChange}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <MovementStatusFilter
            selectedStatuses={selectedStatuses}
            onStatusChange={handleStatusChange}
          />
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <MovementTable
          movements={movements}
          onSort={handleSort}
          orderBy={orderBy}
          orderDirection={orderDirection}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalCount={totalCount}
          onMovementUpdate={handleMovementUpdate}
        />
      )}
      {/* Modal de Novo Movimento */}
      <Dialog open={openNewMovementModal} onClose={handleCloseNewMovementModal}>
        <DialogTitle>Selecione o Tipo de Movimento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, p: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleNewMovement('express')}
              startIcon={<FlashOnIcon />}
            >
              Movimento Express
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewMovementModal}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Movements;
