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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { endOfDay, format, formatISO, parseISO, startOfDay, subDays, addDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { movementsService } from '../services/api';
import MovementForm from '../components/MovementForm';
import { useNavigate } from 'react-router-dom';

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
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(parseFloat(value));
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
  const [open, setOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedBoleto, setSelectedBoleto] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [boletoDialogOpen, setBoletoDialogOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const status = movement.status_name || 'Rascunho';
  const statusId = movement.movement_status_id || 1;
  const isConfirmed = statusId === 2;
  const isCanceled = status.toLowerCase() === 'cancelado';

  const handleNotificationClick = (event) => {
    event.stopPropagation();
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleGenerateInvoice = async (e) => {
    e.stopPropagation();
    // TODO: Implementar geração de nota fiscal
  };

  const handleGenerateBoleto = async (e, installment) => {
    e.stopPropagation();
    try {
      enqueueSnackbar('Gerando boleto...', { variant: 'info' });
      const response = await api.post(`/boletos/generate/${installment.installment_id}`);
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

  const fetchContacts = async () => {
    try {
      const response = await api.get('/persons');
      setContacts(response.data);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    }
  };

  const handleShare = async () => {
    try {
      await api.post('/boletos/share', {
        boleto_id: selectedBoleto.boleto_id,
        person_ids: selectedContacts
      });
      enqueueSnackbar('Boleto compartilhado com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao compartilhar boleto:', error);
      enqueueSnackbar('Erro ao compartilhar boleto', { variant: 'error' });
    }
    setShareDialogOpen(false);
  };

  const handleCopyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar(message, { variant: 'success' });
  };

  const handleCancelMovement = async () => {
    try {
      await api.post(`/movements/${movement.movement_id}/cancel`);
      enqueueSnackbar('Movimentação cancelada com sucesso!', { variant: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao cancelar movimentação:', error);
      enqueueSnackbar('Erro ao cancelar movimentação', { variant: 'error' });
    }
    setConfirmCancelOpen(false);
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
        <TableCell>
          {movement.person_name || '-'}
        </TableCell>
        <TableCell>{movement.type_name}</TableCell>
        <TableCell align="right">
          {formatCurrency(movement.total_amount)}
        </TableCell>
        <TableCell>
          <Chip
            label={status}
            color={isConfirmed ? 'success' : 'default'}
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
                    onClick={handleGenerateInvoice}
                  >
                    <PostAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {movement.payments?.some(payment => 
                  payment.installments?.some(installment => 
                    installment.boletos?.some(boleto => boleto.boleto_url)
                  )
                ) && (
                  <Tooltip title="Enviar Notificação">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleNotificationClick}
                    >
                      <NotificationsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
            {!isCanceled && (
              <Tooltip title="Cancelar Movimentação">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmCancelOpen(true);
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedBoleto?.boleto_url ? (
              <>
                <MenuItem onClick={() => {
                  // TODO: Implementar envio por email
                  handleNotificationClose();
                }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  Enviar por Email
                </MenuItem>
                <MenuItem onClick={() => {
                  // TODO: Implementar envio por WhatsApp
                  handleNotificationClose();
                }}>
                  <WhatsAppIcon fontSize="small" sx={{ mr: 1 }} />
                  Enviar por WhatsApp
                </MenuItem>
              </>
            ) : (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  Nenhum boleto disponível para compartilhar
                </Typography>
              </MenuItem>
            )}
          </Menu>
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
                                            setSelectedBoleto(boleto);
                                            setBoletoDialogOpen(true);
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
                                            setSelectedBoleto(boleto);
                                            setShareDialogOpen(true);
                                            fetchContacts();
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
      <Dialog 
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
      </Dialog>

      {/* Diálogo de Detalhes do Boleto */}
      <Dialog 
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
      </Dialog>

      {/* Diálogo de Confirmação de Cancelamento */}
      <Dialog 
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
      </Dialog>
    </>
  );
};

const MovementTable = ({ movements, onSort, orderBy, orderDirection, page, rowsPerPage, onPageChange, onRowsPerPageChange, totalCount }) => {
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
                  active={orderBy === 'movement_date'}
                  direction={orderBy === 'movement_date' ? orderDirection : 'asc'}
                  onClick={() => onSort('movement_date')}
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
              <TableCell>ID</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'customer'}
                  direction={orderBy === 'customer' ? orderDirection : 'asc'}
                  onClick={() => onSort('customer')}
                >
                  Cliente
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? orderDirection : 'asc'}
                  onClick={() => onSort('type')}
                >
                  Tipo
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? orderDirection : 'asc'}
                  onClick={() => onSort('amount')}
                >
                  Valor
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? orderDirection : 'asc'}
                  onClick={() => onSort('status')}
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
        include: 'payments.installments.boletos'
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
  }, [page, rowsPerPage, orderBy, orderDirection, dateRange, statusFilter, typeFilter]);

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

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h4">Movimentos</Typography>
        
        {/* Novo componente de seleção de visualização */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            aria-label="view mode"
          >
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="Visualização em Lista">
                <ListViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view">
              <Tooltip title="Visualização em Cards">
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar movimentações..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="1">Rascunho</MenuItem>
                <MenuItem value="2">Confirmado</MenuItem>
                <MenuItem value="3">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
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
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/movements/new')}
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
        />
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(movements) && movements.map((movement) => (
            <Grid item xs={12} sm={6} md={4} key={movement.id || `movement-${movement.movement_id}`}>
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
    </Box>
  );
};

export default Movements;
