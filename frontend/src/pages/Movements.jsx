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
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const status = movement.status || movement.status_name || 'draft';
  const statusId = movement.movement_status_id || movement.status_id || 1;
  const description = movement.description || 'Sem descrição';
  const amount = movement.amount || movement.total_amount || 0;
  const date = movement.date || movement.movement_date || new Date();
  const customer = movement.customer || movement.person_name || 'Cliente não especificado';
  const type = movement.type || movement.type_name || 'Não especificado';
  
  const isConfirmed = statusId === 2;
  const canNotify = isConfirmed; // Agora só mostra o botão se estiver confirmado

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleEmailNotification = () => {
    // TODO: Implementar envio por email
    console.log('Enviando notificação por email...');
    handleNotificationClose();
  };

  const handleWhatsAppNotification = () => {
    // TODO: Implementar envio por WhatsApp
    console.log('Enviando notificação por WhatsApp...');
    handleNotificationClose();
  };

  const handleAllNotifications = () => {
    // TODO: Implementar envio por todos os canais
    console.log('Enviando notificação por todos os canais...');
    handleNotificationClose();
  };

  const handleGenerateInvoice = () => {
    // TODO: Implementar geração de nota fiscal
    console.log('Gerando nota fiscal...');
  };
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" fontWeight="600">
            {description}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={type}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={isConfirmed ? 'Confirmado' : status}
              color={isConfirmed ? 'success' : 'default'}
              size="small"
            />
          </Stack>
        </Box>
        
        <Typography variant="h5" color="primary" fontWeight="600" gutterBottom>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(parseFloat(amount))}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Cliente: {customer}
        </Typography>
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Tooltip title="Visualizar">
          <IconButton size="small">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
            >
              <MenuItem onClick={handleAllNotifications}>
                <NotificationsIcon sx={{ mr: 1 }} /> Enviar por Todos
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleEmailNotification}>
                <EmailIcon sx={{ mr: 1 }} /> Enviar por Email
              </MenuItem>
              <MenuItem onClick={handleWhatsAppNotification}>
                <WhatsAppIcon sx={{ mr: 1 }} /> Enviar por WhatsApp
              </MenuItem>
            </Menu>
          </>
        )}
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

const MovementTable = ({ movements, onSort, orderBy, orderDirection }) => {
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const handleNotificationClick = (event, movement) => {
    setSelectedMovement(movement);
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
    setSelectedMovement(null);
  };

  const handleEmailNotification = () => {
    console.log('Enviando notificação por email...', selectedMovement);
    handleNotificationClose();
  };

  const handleWhatsAppNotification = () => {
    console.log('Enviando notificação por WhatsApp...', selectedMovement);
    handleNotificationClose();
  };

  const handleAllNotifications = () => {
    console.log('Enviando notificação por todos os canais...', selectedMovement);
    handleNotificationClose();
  };

  const renderSortLabel = (column) => {
    return (
      <TableSortLabel
        active={orderBy === column}
        direction={orderBy === column ? orderDirection : 'asc'}
        onClick={() => onSort(column)}
      >
        {column === 'date' ? 'Data' :
         column === 'description' ? 'Descrição' :
         column === 'value' ? 'Valor' :
         column === 'type' ? 'Tipo' : 'Status'}
      </TableSortLabel>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" /> {/* Coluna para o botão de expandir */}
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
                active={orderBy === 'person'}
                direction={orderBy === 'person' ? orderDirection : 'asc'}
                onClick={() => onSort('person')}
              >
                Cliente
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
            <MovementRow key={movement.movement_id || movement.id} movement={movement} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
      default:
        start = startOfDay(subDays(today, 6)); // últimos 7 dias como padrão
        end = endOfDay(today);
    }
    
    onDateRangeChange([start, end]);
    handleClose();
  };

  const handleDateChange = (newValue, isStart) => {
    const [start, end] = dateRange;
    if (isStart) {
      onDateRangeChange([newValue, end]);
    } else {
      onDateRangeChange([start, newValue]);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={() => {
        const [start, end] = dateRange;
        onDateRangeChange([subDays(start, 1), subDays(end, 1)]);
      }}>
        <BeforeIcon />
      </IconButton>
      
      <Button
        onClick={handleClick}
        startIcon={<DateRangeIcon />}
        endIcon={<FilterIcon />}
        variant="outlined"
      >
        {format(dateRange[0], "dd/MM/yyyy")} - {format(dateRange[1], "dd/MM/yyyy")}
      </Button>
      
      <IconButton onClick={() => {
        const [start, end] = dateRange;
        onDateRangeChange([addDays(start, 1), addDays(end, 1)]);
      }}>
        <NextIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data Inicial"
            type="date"
            value={format(dateRange[0], 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange(new Date(e.target.value), true)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Data Final"
            type="date"
            value={format(dateRange[1], 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange(new Date(e.target.value), false)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Divider />
          <MenuItem onClick={() => handlePeriodSelect('today')}>
            <TodayIcon sx={{ mr: 1 }} /> Hoje
          </MenuItem>
          <MenuItem onClick={() => handlePeriodSelect('week')}>
            <DateRangeIcon sx={{ mr: 1 }} /> Últimos 7 dias
          </MenuItem>
          <MenuItem onClick={() => handlePeriodSelect('month')}>
            <DateRangeIcon sx={{ mr: 1 }} /> Últimos 30 dias
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

const Movements = () => {
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  const [formOpen, setFormOpen] = useState(false);
  
  // Estados para filtros
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('2');
  const [typeFilter, setTypeFilter] = useState('2');
  const [personFilter, setPersonFilter] = useState('');
  const [valueMin, setValueMin] = useState('');
  const [valueMax, setValueMax] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), 6)); // últimos 7 dias
    return [start, end];
  });
  
  // Estados para ordenação
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderDirection, setOrderDirection] = useState('DESC');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 10,
        search: searchText || undefined,
        person_id: personFilter || undefined,
        movement_type_id: typeFilter !== 'all' ? typeFilter : undefined,
        value_min: valueMin || undefined,
        value_max: valueMax || undefined,
        start_date: dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : undefined,
        end_date: dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : undefined,
        sort_by: orderBy || 'created_at',
        sort_order: orderDirection || 'DESC'
      };

      // Log dos parâmetros
      console.log('Fetching movements with params:', params);
      
      // Primeiro tenta buscar com includes
      try {
        const response = await movementsService.list({
          ...params,
          include: 'payments.installments.boletos'
        });
        setMovements(response.items);
        setTotalPages(Math.ceil(response.total / limit));
      } catch (error) {
        console.warn('Failed to fetch with includes, trying without:', error);
        // Se falhar, tenta buscar sem includes
        const response = await movementsService.list(params);
        setMovements(response.items);
        setTotalPages(Math.ceil(response.total / limit));
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      enqueueSnackbar('Erro ao carregar movimentações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [
    page,
    limit,
    statusFilter,
    typeFilter,
    personFilter,
    valueMin,
    valueMax,
    dateRange,
    searchText,
    orderBy,
    orderDirection
  ]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderBy(field);
      setOrderDirection('ASC');
    }
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
      default:
        start = startOfDay(subDays(today, 6)); // últimos 7 dias como padrão
        end = endOfDay(today);
    }
    
    setDateRange([start, end]);
  };

  const handleNewMovement = (formData) => {
    console.log('Nova movimentação:', formData);
    // TODO: Implementar a criação da movimentação
    setFormOpen(false);
    // Após criar, recarregar a lista
    fetchMovements();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header com título e botão de nova movimentação */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Movimentações
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/movements/new')}
          sx={{
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            transition: 'transform 0.2s',
          }}
        >
          Nova Movimentação
        </Button>
      </Box>

      <MovementForm 
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleNewMovement}
      />

      {/* Barra de filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Botões de visualização */}
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => newValue && setViewMode(newValue)}
              size="small"
            >
              <ToggleButton value="grid">
                <Tooltip title="Visualização em Grade" placement="top">
                  <GridViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="Visualização em Lista" placement="top">
                  <ListViewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>

          {/* Seletor de período */}
          <Grid item>
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </Grid>

          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="1">Rascunho</MenuItem>
                <MenuItem value="2">Confirmado</MenuItem>
                <MenuItem value="99">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="1">Compra</MenuItem>
                <MenuItem value="2">Venda</MenuItem>
                <MenuItem value="3">Contrato Venda</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <TextField
              size="small"
              label="Buscar"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Descrição..."
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
            <TextField
              size="small"
              label="Valor Mínimo"
              value={valueMin}
              onChange={(e) => setValueMin(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{ width: 150 }}
            />
          </Grid>

          <Grid item>
            <TextField
              size="small"
              label="Valor Máximo"
              value={valueMax}
              onChange={(e) => setValueMax(e.target.value)}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              sx={{ width: 150 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Conteúdo */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : movements.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhuma movimentação encontrada
          </Typography>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <Grid container spacing={3}>
            {movements.map((movement) => (
              <Grid item xs={12} sm={6} md={4} key={movement.id}>
                <MovementCard movement={movement} />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <MovementTable movements={movements} onSort={handleSort} orderBy={orderBy} orderDirection={orderDirection} />
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default Movements;
