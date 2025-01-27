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
  IconButton, 
  Tooltip, 
  Chip, 
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  TableSortLabel
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
  Close as CloseIcon
} from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList'; // Importação correta do ícone
import { useSnackbar } from 'notistack';
import { movementsService } from '../services/api';
import MovementForm from '../components/MovementForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { endOfDay, format, formatISO, parseISO, startOfDay, subDays, addDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  Stack, 
  ToggleButtonGroup, 
  ToggleButton, 
  FormControl, 
  InputLabel, 
  Select, 
  Pagination, 
  InputAdornment, 
  TextField, 
  OutlinedInput, 
  TablePagination, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText, 
  Fab, 
  Checkbox,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
  Button,
  Link
} from '@mui/material';

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

const MovementRow = ({ movement }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

  // Log completo do movimento para diagnóstico
  console.log('🚨 Movimento completo:', JSON.stringify(movement, null, 2));

  // Mapeamento dos novos campos da API
  const movementId = movement.movement_id;
  const customerName = movement.full_name || 'Cliente não especificado';
  const totalAmount = movement.total_amount;
  const movementDate = movement.movement_date;
  const description = movement.description;
  const statusName = movement.status_name;
  const typeName = movement.type_name;

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

  const handleViewDetails = () => {
    navigate(`/movements/${movementId}`);
  };

  const handleEditMovement = () => {
    navigate(`/movements/edit/${movementId}`);
  };

  const handleCancelMovement = async () => {
    try {
      console.log('🚨 Tentando cancelar movimento:', {
        movementId,
        statusName,
        currentStatus: movement.movement_status_id,
        totalAmount,
        movementDate
      });

      // Verificar condições de cancelamento
      if (movement.movement_status_id === 3) { // Assumindo 3 como status de cancelado
        enqueueSnackbar('Movimentação já está cancelada!', { variant: 'warning' });
        return;
      }

      const result = await movementsService.cancel(movementId);
      console.log('✅ Movimento cancelado com sucesso:', result);
      enqueueSnackbar('Movimentação cancelada com sucesso!', { variant: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro detalhado ao cancelar movimentação:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        movementDetails: {
          id: movementId,
          currentStatus: movement.movement_status_id,
          statusName
        }
      });
      enqueueSnackbar(
        error.response?.data?.message || 
        error.message || 
        'Erro ao cancelar movimentação', 
        { variant: 'error' }
      );
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
        sx={{ 
          cursor: 'pointer',
          '& > *': { borderBottom: 'unset' },
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{movementId}</TableCell>
        <TableCell>{customerName}</TableCell>
        <TableCell>{formatCurrency(totalAmount)}</TableCell>
        <TableCell>{format(parseISO(movementDate), 'dd/MM/yyyy')}</TableCell>
        <TableCell>{description}</TableCell>
        <TableCell>
          <Chip 
            label={statusName} 
            size="small" 
            color={getStatusColor(statusName)} 
          />
        </TableCell>
        <TableCell>
          <Chip 
            label={typeName} 
            size="small" 
            color={getTypeColor(typeName)} 
          />
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="Gerar Nota Fiscal">
              <IconButton
                size="small"
                color="primary"
                onClick={handleGenerateInvoice}
              >
                <PostAddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Enviar Notificação">
              <IconButton
                size="small"
                color="primary"
                onClick={handleNotificationClick}
              >
                <NotificationsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar">
              <IconButton
                size="small"
                color="error"
                onClick={handleCancelMovement}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Detalhes">
              <IconButton onClick={handleViewDetails}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton onClick={handleEditMovement}>
                <EditIcon />
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
  movements, 
  onSort, 
  orderBy, 
  orderDirection, 
  page, 
  rowsPerPage, 
  onPageChange, 
  onRowsPerPageChange, 
  totalCount 
}) => {
  const [selectedMovement, setSelectedMovement] = useState(null);

  const handleClick = (movement) => {
    setSelectedMovement(selectedMovement === movement ? null : movement);
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
                <TableSortLabel
                  hideSortIcon
                  active={false}
                >
                  <IconButton size="small" disabled>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? orderDirection : 'asc'}
                  onClick={() => onSort('date')}
                >
                  Data
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? orderDirection : 'asc'}
                  onClick={() => onSort('description')}
                >
                  Descrição
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'movement_id'}
                  direction={orderBy === 'movement_id' ? orderDirection : 'asc'}
                  onClick={() => onSort('movement_id')}
                >
                  Código
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'person_id'}
                  direction={orderBy === 'person_id' ? orderDirection : 'asc'}
                  onClick={() => onSort('person_id')}
                >
                  Código Cliente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'person_name'}
                  direction={orderBy === 'person_name' ? orderDirection : 'asc'}
                  onClick={() => onSort('person_name')}
                >
                  Nome Cliente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'movement_type_id'}
                  direction={orderBy === 'movement_type_id' ? orderDirection : 'asc'}
                  onClick={() => onSort('movement_type_id')}
                >
                  Tipo
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'total_amount'}
                  direction={orderBy === 'total_amount' ? orderDirection : 'asc'}
                  onClick={() => onSort('total_amount')}
                >
                  Valor
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status_name'}
                  direction={orderBy === 'status_name' ? orderDirection : 'asc'}
                  onClick={() => onSort('status_name')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(movements) && movements.map((movement) => (
              <MovementRow key={movement.movement_id} movement={movement} />
            ))}
            {(!movements || movements.length === 0) && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Nenhuma movimentação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="body2" color="text.secondary">
          Total de registros: {totalCount}
        </Typography>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Box>
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
    : [subDays(new Date(), 30), new Date()];

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
  CANCELED: 99
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
    const newSelectedStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    onStatusChange(newSelectedStatuses);
  };

  const allNonCanceledStatuses = [
    MOVEMENT_STATUS.DRAFT, 
    MOVEMENT_STATUS.CONFIRMED
  ];

  const isAllSelected = allNonCanceledStatuses
    .every(status => selectedStatuses.includes(status));

  const handleSelectAll = () => {
    onStatusChange(
      isAllSelected ? [] : [...allNonCanceledStatuses]
    );
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
        Status ({selectedStatuses.length} selecionados)
      </Button>
      <Menu
        id="status-filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleSelectAll}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={
              selectedStatuses.length > 0 && 
              selectedStatuses.length < allNonCanceledStatuses.length
            }
          />
          Selecionar Todos
        </MenuItem>
        {[
          { status: MOVEMENT_STATUS.DRAFT, label: 'Rascunho' },
          { status: MOVEMENT_STATUS.CONFIRMED, label: 'Confirmado' },
          { status: MOVEMENT_STATUS.CANCELED, label: 'Cancelado' }
        ].map(({ status, label }) => (
          <MenuItem 
            key={status} 
            onClick={() => handleStatusToggle(status)}
          >
            <Checkbox 
              checked={selectedStatuses.includes(status)}
            />
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const Movements = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'card'
  const [orderBy, setOrderBy] = useState('date');
  const [orderDirection, setOrderDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState([startOfDay(subDays(new Date(), 30)), endOfDay(new Date())]);
  const [selectedStatuses, setSelectedStatuses] = useState([
    MOVEMENT_STATUS.DRAFT, 
    MOVEMENT_STATUS.CONFIRMED
  ]); // Padrão: Rascunho e Confirmado, excluindo Cancelado
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [movementTypeDialogOpen, setMovementTypeDialogOpen] = useState(false);
  const [movementTypeOptions, setMovementTypeOptions] = useState([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      const allNonCanceledStatuses = [
        MOVEMENT_STATUS.DRAFT, 
        MOVEMENT_STATUS.CONFIRMED
      ];

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        orderBy: orderBy || 'date',
        orderDirection: orderDirection || 'desc',
        startDate: format(dateRange[0], 'yyyy-MM-dd'),
        endDate: format(dateRange[1], 'yyyy-MM-dd'),
        include: 'payments.installments.boletos',
        search: searchQuery || undefined,
        movement_status_id: selectedStatuses.length > 0 
          ? selectedStatuses 
          : allNonCanceledStatuses,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        orderBySecondary: 'movement_id',
        orderDirectionSecondary: 'desc'
      };

      console.log('🔍 Parâmetros detalhados da requisição:', {
        ...params,
        selectedStatuses,
        allNonCanceledStatuses
      });

      const response = await movementsService.list(params);
      
      console.log('🚨 Estrutura da resposta:', {
        items: response.items,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        itemsType: typeof response.items,
        itemsLength: response.items?.length || 0
      });
      
      const movementsData = response.items || [];
      const totalCount = response.total || movementsData.length || 0;

      setMovements(movementsData);
      setTotalCount(totalCount);
      setPage(response.page - 1); // Ajuste para página baseada em 0
      setRowsPerPage(response.limit);
      
    } catch (error) {
      console.error('🔴 Erro na busca de movimentações:', error);
      enqueueSnackbar('Erro ao carregar movimentos', { variant: 'error' });
      setMovements([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);

    // Limpa o timeout anterior se existir
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Cria um novo timeout para fazer a busca
    const timeoutId = setTimeout(() => {
      setPage(0); // Reset da página ao buscar
      fetchMovements();
    }, 500); // Delay de 500ms

    setSearchTimeout(timeoutId);
  };

  useEffect(() => {
    fetchMovements();
  }, [page, rowsPerPage, orderBy, orderDirection, dateRange, selectedStatuses, typeFilter, searchQuery]); // Adicionado searchQuery

  // Limpa o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset página ao ordenar
  };

  const handleNewMovement = () => {
    // Abrir um modal de seleção de tipo de movimento
    const options = [
      { 
        label: 'Movimento Expresso', 
        description: 'Rápido e simples, para lançamentos básicos', 
        path: '/movements/new-express',
        icon: <SpeedIcon />
      },
      { 
        label: 'Movimento Detalhado', 
        description: 'Completo, com múltiplos itens e pagamentos', 
        path: '/movements/new-detailed',
        icon: <ListAltIcon />
      }
    ];

    setMovementTypeDialogOpen(true);
    setMovementTypeOptions(options);
  };

  const toggleAIAssistant = () => {
    setIsAIModalOpen(!isAIModalOpen);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Cabeçalho com título e botões de visualização */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Typography variant="h5">Movimentos</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(e, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
          >
            <ToggleButton value="list">
              <ListViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="card">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Barra de filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <OutlinedInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar movimentações..."
              size="small"
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <MovementStatusFilter 
              selectedStatuses={selectedStatuses}
              onStatusChange={(newStatuses) => {
                setSelectedStatuses(newStatuses);
                // Refetch movements quando status mudar
                fetchMovements();
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Tipo"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="1">Venda</MenuItem>
                <MenuItem value="2">Compra</MenuItem>
                <MenuItem value="3">Contrato Venda</MenuItem>
                <MenuItem value="4">Contrato Compra</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewMovement}
              sx={{ 
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                textTransform: 'none',
                borderRadius: 1
              }}
            >
              Nova Movimentação
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'list' ? (
        <Paper 
          elevation={0} 
          sx={{ 
            overflow: 'hidden',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            background: 'transparent',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? orderDirection : 'asc'}
                      onClick={() => onSort('date')}
                    >
                      Data
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Código Cliente</TableCell>
                  <TableCell>Nome Cliente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((movement) => (
                  <MovementRow key={movement.movement_id} movement={movement} />
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              Total de registros: {totalCount}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Itens por página:
              </Typography>
              <Select
                value={rowsPerPage}
                onChange={(e) => handleChangeRowsPerPage(e)}
                size="small"
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              <Typography variant="body2" color="text.secondary">
                {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalCount)} de ${totalCount}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={() => handleChangePage(null, page - 1)}
                  disabled={page === 0}
                >
                  <BeforeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleChangePage(null, page + 1)}
                  disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                >
                  <NextIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {movements.map((movement) => (
            <Grid item xs={12} sm={6} md={4} key={movement.movement_id}>
              <MovementCard movement={movement} />
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[6, 10, 24, 48]}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Box>

      <Fab 
        color="primary" 
        onClick={toggleAIAssistant}
        sx={{ 
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          boxShadow: '0 10px 25px rgba(37, 117, 252, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 15px 35px rgba(37, 117, 252, 0.4)',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(37, 117, 252, 0.7)',
            },
            '70%': {
              transform: 'scale(1)',
              boxShadow: '0 0 0 20px rgba(37, 117, 252, 0)',
            },
            '100%': {
              transform: 'scale(0.95)',
              boxShadow: '0 0 0 0 rgba(37, 117, 252, 0)',
            },
          },
          '&:not(:hover)': {
            animation: 'pulse 2s infinite',
          },
        }}
      >
        <AIIcon />
      </Fab>

      <Dialog
        open={isAIModalOpen}
        onClose={toggleAIAssistant}
        aria-labelledby="ai-assistant-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="ai-assistant-dialog">
          AI Financial Assistant
          <Button 
            onClick={toggleAIAssistant} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            How can I help you with your finances today? Ask me anything about your financial data, transactions, or insights.
          </DialogContentText>
          {/* Future: Add AI chat interface or input */}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleAIAssistant} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={movementTypeDialogOpen} 
        onClose={() => setMovementTypeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Selecione o tipo de movimento</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {movementTypeOptions.map((option) => (
              <Button 
                key={option.path} 
                variant="contained" 
                startIcon={option.icon} 
                onClick={() => navigate(option.path)}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMovementTypeDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Movements;
