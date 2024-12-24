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
  TablePagination
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
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { endOfDay, format, parseISO, startOfDay, subDays, addDays, isValid } from 'date-fns';
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
  const description = movement.description || 'Sem descrição';
  const amount = movement.amount || movement.total_amount || 0;
  const date = movement.date || movement.movement_date || new Date();
  const customer = movement.customer || movement.person_name || 'Cliente não especificado';
  const personId = movement.person_id || 'N/A';
  const type = movement.type || movement.type_name || 'Não especificado';

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
          <Chip
            label={status}
            size="small"
            color={getStatusColor(status)}
            sx={{ ml: 1 }}
          />
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
              label={type}
              size="small"
              color="primary"
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
  const status = movement.status || movement.status_name || 'draft';
  const statusId = movement.movement_status_id || movement.status_id || 1;
  const isConfirmed = statusId === 2;

  const handleNotificationClick = (event) => {
    event.stopPropagation();
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleGenerateInvoice = (event) => {
    event.stopPropagation();
    // TODO: Implementar geração de nota fiscal
    console.log('Gerando nota fiscal...');
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
          {format(new Date(movement.date || movement.created_at), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>
          <Typography>{movement.description || '-'}</Typography>
        </TableCell>
        <TableCell>
          {movement.person_name || movement.person?.name || '-'}
        </TableCell>
        <TableCell align="right">
          {formatCurrency(movement.amount || movement.total_amount || 0)}
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
            {isConfirmed && (
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
                <Tooltip title="Enviar Notificação">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={handleNotificationClick}
                  >
                    <NotificationsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            onClick={(e) => e.stopPropagation()}
          >
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
          </Menu>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalhes da Movimentação
              </Typography>
              {/* Aqui você pode adicionar mais detalhes da movimentação */}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
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
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? orderDirection : 'asc'}
                  onClick={() => onSort('description')}
                >
                  Descrição
                </TableSortLabel>
              </TableCell>
              <TableCell>ID Cliente</TableCell>
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
            {movements.map((movement) => (
              <MovementRow key={movement.id} movement={movement} />
            ))}
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
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState('date');
  const [orderDirection, setOrderDirection] = useState('desc');
  const [dateRange, setDateRange] = useState([
    subDays(new Date(), 30),
    new Date()
  ]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('table');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        orderBy,
        orderDirection,
        ...(dateRange[0] && { startDate: format(dateRange[0], 'yyyy-MM-dd') }),
        ...(dateRange[1] && { endDate: format(dateRange[1], 'yyyy-MM-dd') }),
      };

      console.log('Fetching movements with params:', params);
      const response = await movementsService.list(params);
      console.log('Raw API response:', response);

      const { items, meta } = response?.data || {};

      if (!items || !Array.isArray(items)) {
        console.error('Formato de resposta inválido:', response?.data);
        enqueueSnackbar('Erro ao carregar movimentações: formato de resposta inválido', { variant: 'error' });
        return;
      }

      setMovements(items);
      setTotalCount(meta?.totalItems || items.length);
      
    } catch (error) {
      console.error('Error fetching movements:', error);
      enqueueSnackbar(`Erro ao carregar movimentações: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, rowsPerPage, orderBy, orderDirection, dateRange]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Movimentações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie todas as movimentações financeiras
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/movements/new')}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Nova Movimentação
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => newValue && setViewMode(newValue)}
              size="small"
              aria-label="Modo de visualização"
              sx={{ 
                backgroundColor: 'background.paper',
                '& .MuiToggleButton-root': {
                  border: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="table" aria-label="Visualização em tabela">
                <Tooltip title="Visualização em Tabela">
                  <ListViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label="Visualização em grade">
                <Tooltip title="Visualização em Cards">
                  <GridViewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total de Registros
              </Typography>
              <Typography variant="h4">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'table' ? (
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
        <>
          <Grid container spacing={3}>
            {movements.map((movement) => (
              <Grid item xs={12} sm={6} md={4} key={movement.id}>
                <MovementCard movement={movement} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              Total de registros: {totalCount}
            </Typography>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[6, 12, 24, 48]}
              labelRowsPerPage="Cards por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Movements;
