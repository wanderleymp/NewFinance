import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Collapse,
  Typography,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Button,
  Grid,
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
  DialogActions
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
  ListAlt as ListAltIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { endOfDay, format, formatISO, parseISO, startOfDay, subDays, addDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { movementsService } from '../services/api';
import MovementForm from '../components/MovementForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmado':
        return 'success';
      case 'pending':
      case 'pendente':
        return 'warning';
      case 'cancelled':
      case 'cancelado':
        return 'error';
      case 'draft':
      case 'rascunho':
        return 'default';
      default:
        return 'default';
    }
  };

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

  const getTypeColor = (typeId) => {
    switch (typeId.toString()) {
      case '1':
      case '3':
        return 'success';
      case '2':
      case '4':
        return 'info';
      default:
        return 'default';
    }
  };

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
    <Card
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
      <CardContent sx={{ flex: 1, p: 2 }}>
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
      </CardContent>

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
    </Card>
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
        {installment.boletos?.map((boleto) => (
          <Box key={boleto.boleto_id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Tooltip title={`Boleto ${boleto.boleto_number || 'Sem número'}`}>
              <IconButton
                size="small"
                disabled={!boleto.boleto_number}
                onClick={() => window.open(`/api/boletos/${boleto.boleto_id}/pdf`, '_blank')}
              >
                <ReceiptIcon color={boleto.boleto_number ? 'primary' : 'disabled'} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {boleto.status} - {format(new Date(boleto.generated_at), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Box>
        ))}
      </TableCell>
    </TableRow>
  );
};

const MovementRow = ({ movement }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

  const status = movement.status_name || 'Rascunho';
  const statusId = movement.movement_status_id || 1;
  const isConfirmed = statusId === 2;
  const isCanceled = status.toLowerCase() === 'cancelado';

  const handleNotificationClick = async (event) => {
    event.stopPropagation();
    try {
      const response = await axios.post(
        'https://n8n.webhook.agilefinance.com.br/webhook/mensagem/faturamento', 
        { movement_id: movement.movement_id },
        {
          headers: {
            'apikey': 'ffcaa89a3e19bd98e911475c7974309b',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const successMessage = enqueueSnackbar('Notificação enviada com sucesso!', { 
        variant: 'success',
        autoHideDuration: 2000 // Fecha após 2 segundos
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error.response?.data || error.message);
      enqueueSnackbar('Erro ao enviar notificação', { 
        variant: 'error',
        autoHideDuration: 3000 // Fecha após 3 segundos
      });
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.stopPropagation();
    // TODO: Implementar geração de nota fiscal
  };

  const handleGenerateBoleto = async (e, installment) => {
    e.stopPropagation();
    try {
      enqueueSnackbar('Gerando boleto...', { variant: 'info' });
      const response = await axios.post(`/boletos/generate/${installment.installment_id}`);
      if (response.data) {
        enqueueSnackbar('Boleto gerado com sucesso!', { variant: 'success' });
        // Recarregar os dados da movimentação
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      enqueueSnackbar('Erro ao gerar boleto', { variant: 'error' });
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Evita que o clique propague para a linha
    navigate(`/movements/edit/${movement.movement_id}`);
  };

  const handleDelete = async () => {
    try {
      await movementsService.delete(movement.movement_id);
      enqueueSnackbar('Movimento excluído com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao excluir movimento:', error);
      enqueueSnackbar('Erro ao excluir movimento', { variant: 'error' });
    }
  };

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{ 
          cursor: 'pointer',
          '& > *': { borderBottom: 'unset' },
        }}
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
        <TableCell>
          {format(new Date(movement.movement_date || movement.created_at), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>
          <Typography>{movement.description || '-'}</Typography>
        </TableCell>
        <TableCell>{movement.movement_id}</TableCell>
        <TableCell>{movement.person_id}</TableCell>
        <TableCell>{movement.person_name || '-'}</TableCell>
        <TableCell>
          <Chip 
            label={movement.type_name}
            size="small"
            color={movement.movement_type_id === 1 || movement.movement_type_id === 3 ? 'success' : 'info'}
          />
        </TableCell>
        <TableCell align="right">
          {formatCurrency(Number(movement.total_amount || 0))}
        </TableCell>
        <TableCell>
          <Chip
            label={status}
            color={
              status.toLowerCase() === 'confirmado' ? 'success' :
              status.toLowerCase() === 'pendente' ? 'warning' :
              status.toLowerCase() === 'cancelado' ? 'error' :
              'default'
            }
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {isConfirmed && !isCanceled && (
              <>
                <Tooltip title="Gerar Nota Fiscal">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateInvoice(e);
                    }}
                  >
                    <PostAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enviar Notificação">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(e);
                    }}
                  >
                    <NotificationsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {!isCanceled && (
              <Tooltip title="Cancelar Movimentação">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Editar Movimentação">
              <IconButton
                size="small"
                onClick={handleEdit}
              >
                <EditIcon fontSize="small" />
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
                Detalhes da Movimentação #{movement.movement_id}
              </Typography>
              
              {/* Pagamentos e Parcelas */}
              {movement.payments && movement.payments.map((payment) => (
                <Box key={payment.payment_id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Movimentação #{movement.movement_id} - Pagamento - {payment.status}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parcela</TableCell>
                        <TableCell>Vencimento</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Data Prevista</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payment.installments && payment.installments.map((installment) => (
                        <TableRow key={installment.installment_id}>
                          <TableCell>{installment.installment_number}</TableCell>
                          <TableCell>
                            {format(new Date(installment.due_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(installment.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={installment.status}
                              color={installment.status === 'Confirmado' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(installment.expected_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              {installment.boletos && installment.boletos.map((boleto) => (
                                <Box key={boleto.boleto_id}>
                                  {boleto.boleto_number && (
                                    <>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DescriptionIcon />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (boleto.boleto_url) {
                                            window.open(boleto.boleto_url, '_blank');
                                          } else {
                                            // setSelectedBoleto(boleto);
                                            // setBoletoDialogOpen(true);
                                          }
                                        }}
                                        sx={{ mr: 1 }}
                                      >
                                        Boleto {boleto.boleto_number}
                                      </Button>
                                      {boleto.boleto_url && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // setSelectedBoleto(boleto);
                                            // setShareDialogOpen(true);
                                            // fetchContacts();
                                          }}
                                        >
                                          <ShareIcon />
                                        </IconButton>
                                      )}
                                    </>
                                  )}
                                </Box>
                              ))}
                              {(!installment.boletos || installment.boletos.length === 0) && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<RequestQuoteIcon />}
                                  onClick={(e) => handleGenerateBoleto(e, installment)}
                                >
                                  Gerar Boleto
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {/* Diálogo de Compartilhamento */}
      {/* <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Compartilhar Boleto</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Selecione os contatos</InputLabel>
            <Select
              multiple
              value={selectedContacts}
              onChange={(e) => setSelectedContacts(e.target.value)}
              input={<OutlinedInput label="Selecione os contatos" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={contacts.find(c => c.person_id === value)?.name} 
                      size="small" 
                    />
                  ))}
                </Box>
              )}
            >
              {contacts.map((contact) => (
                <MenuItem key={contact.person_id} value={contact.person_id}>
                  {contact.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleShare} 
            variant="contained"
            disabled={!selectedContacts?.length}
          >
            Compartilhar
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Diálogo de Detalhes do Boleto */}
      {/* <Dialog 
        open={boletoDialogOpen} 
        onClose={() => setBoletoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhes do Boleto</DialogTitle>
        <DialogContent>
          {selectedBoleto && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">Linha Digitável:</Typography>
                <Typography>{selectedBoleto.linha_digitavel}</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(
                    selectedBoleto.linha_digitavel,
                    'Linha digitável copiada!'
                  )}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">Código de Barras:</Typography>
                <Typography>{selectedBoleto.codigo_barras}</Typography>
                <IconButton 
                  size="small"
                  onClick={() => handleCopyToClipboard(
                    selectedBoleto.codigo_barras,
                    'Código de barras copiado!'
                  )}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              {selectedBoleto.pix_copia_e_cola && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">PIX Copia e Cola:</Typography>
                  <Typography noWrap sx={{ flex: 1 }}>
                    {selectedBoleto.pix_copia_e_cola}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleCopyToClipboard(
                      selectedBoleto.pix_copia_e_cola,
                      'Código PIX copiado!'
                    )}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBoletoDialogOpen(false)}>Fechar</Button>
          {selectedBoleto?.boleto_url && (
            <Button 
              variant="contained"
              onClick={() => window.open(selectedBoleto.boleto_url, '_blank')}
              startIcon={<DescriptionIcon />}
            >
              Abrir PDF
            </Button>
          )}
        </DialogActions>
      </Dialog> */}

      {/* Diálogo de Confirmação de Cancelamento */}
      {/* <Dialog 
        open={confirmCancelOpen} 
        onClose={() => setConfirmCancelOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancelar Movimentação</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja cancelar a movimentação #{movement.movement_id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleCancelMovement} 
            variant="contained"
            color="error"
          >
            Cancelar Movimentação
          </Button>
        </DialogActions>
      </Dialog> */}
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [movementTypeDialogOpen, setMovementTypeDialogOpen] = useState(false);
  const [movementTypeOptions, setMovementTypeOptions] = useState([]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // Backend espera página começando em 1
        limit: rowsPerPage,
        orderBy,
        orderDirection,
        startDate: format(dateRange[0], 'yyyy-MM-dd'), // Formato de string
        endDate: format(dateRange[1], 'yyyy-MM-dd'), // Formato de string
        include: 'payments.installments.boletos',
        search: searchQuery || undefined, // Adiciona o parâmetro de busca apenas se existir
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };

      console.log('Parâmetros da requisição:', params);

      const response = await movementsService.list(params);
      
      console.log('Resposta completa da API:', response);
      
      // Extração correta dos dados
      const movementsData = response.items?.items || [];
      const totalCount = response.total || response.items?.meta?.total || 0;

      console.log('Items recebidos:', movementsData);
      console.log('Total de itens:', totalCount);
      
      // Correção aqui: use movementsData e totalCount
      setMovements(movementsData);
      setTotalCount(totalCount);
      
    } catch (error) {
      console.error('Erro ao buscar movimentos:', error);
      console.error('Detalhes do erro:', error.response?.data);
      enqueueSnackbar('Erro ao carregar movimentos', { variant: 'error' });
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
  }, [page, rowsPerPage, orderBy, orderDirection, dateRange, statusFilter, typeFilter, searchQuery]); // Adicionado searchQuery

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
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="1">Rascunho</MenuItem>
                <MenuItem value="2">Confirmado</MenuItem>
                <MenuItem value="3">Cancelado</MenuItem>
              </Select>
            </FormControl>
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
