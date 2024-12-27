import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Pagination,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  NavigateBefore as BeforeIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { movementsService } from '../services/api';
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MovementCard = ({ movement }) => {
  const status = movement.status || movement.status_name || 'draft';
  const description = movement.description || 'Sem descrição';
  const amount = movement.amount || movement.total_amount || 0;
  const date = movement.date || movement.movement_date || new Date();
  const customer = movement.customer || movement.person_name || 'Cliente não especificado';
  const type = movement.type || movement.type_name || 'Não especificado';
  
  const isConfirmed = status.toLowerCase().includes('confirm');
  
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
              label={isConfirmed ? 'Confirmado' : 'Rascunho'}
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
      </Box>
    </Card>
  );
};

const MovementTable = ({ movements }) => (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Data</TableCell>
          <TableCell>Descrição</TableCell>
          <TableCell>Cliente</TableCell>
          <TableCell>Tipo</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Valor</TableCell>
          <TableCell align="right">Ações</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {movements.map((movement) => {
          const status = movement.status || movement.status_name || 'draft';
          const isConfirmed = status.toLowerCase().includes('confirm');
          
          return (
            <TableRow key={movement.id}>
              <TableCell>
                {format(new Date(movement.date || movement.movement_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{movement.description}</TableCell>
              <TableCell>{movement.customer || movement.person_name}</TableCell>
              <TableCell>
                <Chip
                  label={movement.type || movement.type_name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={isConfirmed ? 'Confirmado' : 'Rascunho'}
                  color={isConfirmed ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(parseFloat(movement.amount || movement.total_amount))}
              </TableCell>
              <TableCell align="right">
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

const DateRangeSelector = ({ period, onPeriodChange, dateRange, onDateRangeChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handlePeriodSelect = (newPeriod) => {
    let start, end;
    
    switch (newPeriod) {
      case 'today':
        start = startOfToday();
        end = endOfToday();
        break;
      case 'week':
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      default:
        start = startOfToday();
        end = endOfToday();
    }
    
    onPeriodChange(newPeriod);
    onDateRangeChange([start, end]);
    handleClose();
  };
  
  const handleNavigate = (direction) => {
    const [start, end] = dateRange;
    let newStart, newEnd;
    
    switch (period) {
      case 'today':
        newStart = direction === 'before' ? subDays(start, 1) : addDays(start, 1);
        newEnd = direction === 'before' ? subDays(end, 1) : addDays(end, 1);
        break;
      case 'week':
        newStart = direction === 'before' ? subWeeks(start, 1) : addWeeks(start, 1);
        newEnd = direction === 'before' ? subWeeks(end, 1) : addWeeks(end, 1);
        break;
      case 'month':
        newStart = direction === 'before' ? subMonths(start, 1) : addMonths(start, 1);
        newEnd = direction === 'before' ? subMonths(end, 1) : addMonths(end, 1);
        break;
      default:
        return;
    }
    
    onDateRangeChange([newStart, newEnd]);
  };
  
  const getDateRangeText = () => {
    const [start, end] = dateRange;
    
    if (period === 'today') {
      return format(start, "dd 'de' MMMM", { locale: ptBR });
    } else if (period === 'week') {
      return `${format(start, "dd 'de' MMMM", { locale: ptBR })} - ${format(end, "dd 'de' MMMM", { locale: ptBR })}`;
    } else {
      return format(start, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={() => handleNavigate('before')}>
        <BeforeIcon />
      </IconButton>
      
      <Button
        onClick={handleClick}
        startIcon={period === 'today' ? <TodayIcon /> : <DateRangeIcon />}
        endIcon={<FilterIcon />}
        variant="outlined"
      >
        {getDateRangeText()}
      </Button>
      
      <IconButton onClick={() => handleNavigate('next')}>
        <NextIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handlePeriodSelect('today')}>
          <TodayIcon sx={{ mr: 1 }} /> Hoje
        </MenuItem>
        <MenuItem onClick={() => handlePeriodSelect('week')}>
          <DateRangeIcon sx={{ mr: 1 }} /> Esta Semana
        </MenuItem>
        <MenuItem onClick={() => handlePeriodSelect('month')}>
          <DateRangeIcon sx={{ mr: 1 }} /> Este Mês
        </MenuItem>
      </Menu>
    </Box>
  );
};

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  
  // Novos estados
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [period, setPeriod] = useState('today');
  const [dateRange, setDateRange] = useState([startOfToday(), endOfToday()]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await movementsService.list(page);
      console.log('API Response:', response);
      
      const items = response.data || response.items || response;
      const total = response.total || response.pagination?.total || 1;
      
      console.log('Processed items:', items);
      
      setMovements(Array.isArray(items) ? items : []);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error('Fetch error:', error);
      enqueueSnackbar(error.message, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [page, statusFilter, typeFilter, dateRange]);

  const handlePageChange = (event, value) => {
    setPage(value);
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

      {/* Barra de filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => newValue && setViewMode(newValue)}
              size="small"
            >
              <ToggleButton value="grid">
                <Tooltip title="Visualização em Grade">
                  <GridViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list">
                <Tooltip title="Visualização em Lista">
                  <ListViewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>

          <Grid item>
            <DateRangeSelector
              period={period}
              onPeriodChange={setPeriod}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </Grid>

          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="confirmed">Confirmados</MenuItem>
                <MenuItem value="draft">Rascunhos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="income">Receitas</MenuItem>
                <MenuItem value="expense">Despesas</MenuItem>
                <MenuItem value="transfer">Transferências</MenuItem>
              </Select>
            </FormControl>
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
        <MovementTable movements={movements} />
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
