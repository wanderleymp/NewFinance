import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  NavigateBefore as BeforeIcon,
  NavigateNext as NextIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { installmentsService } from '../services/api';
import {
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  format,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        start = startOfDay(subDays(today, 6));
        end = endOfDay(today);
        break;
      case 'month':
        start = startOfDay(subDays(today, 29));
        end = endOfDay(today);
        break;
      default:
        start = startOfDay(today);
        end = endOfDay(today);
    }
    
    onDateRangeChange([start, end]);
    handleClose();
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
    </Box>
  );
};

const BoletosList = ({ boletos }) => {
  return (
    <Box sx={{ pl: 4, pr: 4, pb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Boletos
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data de Geração</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boletos.map((boleto) => (
              <TableRow key={boleto.boleto_id}>
                <TableCell>{boleto.boleto_number || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={boleto.status}
                    size="small"
                    color={
                      boleto.status === 'A_RECEBER'
                        ? 'warning'
                        : boleto.status === 'Emitido'
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {format(parseISO(boleto.generated_at), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Visualizar Boleto">
                    <IconButton size="small">
                      <ReceiptIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const InstallmentRow = ({ installment }) => {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  return (
    <>
      <TableRow
        sx={{ '& > *': { borderBottom: expanded ? 'none' : 'inherit' } }}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ mr: 1 }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          {installment.installment_id}
        </TableCell>
        <TableCell>{installment.payment_id}</TableCell>
        <TableCell>
          {format(parseISO(installment.due_date), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>{formatCurrency(installment.amount)}</TableCell>
        <TableCell>{installment.installment_number}</TableCell>
        <TableCell>
          <Chip
            label={installment.status}
            color={installment.status === 'Pendente' ? 'warning' : 'success'}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <BoletosList boletos={installment.boletos} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Receivables = () => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([startOfDay(new Date()), endOfDay(new Date())]);
  const [sortConfig, setSortConfig] = useState({ field: 'due_date', direction: 'asc' });
  const { enqueueSnackbar } = useSnackbar();

  const handleSort = (field) => {
    setSortConfig((prevConfig) => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: 10,
        search: searchText || undefined,
        start_date: dateRange[0],
        end_date: dateRange[1],
        sort_by: sortConfig.field,
        sort_order: sortConfig.direction.toUpperCase()
      };

      // Log dos parâmetros
      console.log('Fetching installments with params:', params);
      
      const response = await installmentsService.list(params);
      console.log('API Response:', response);
      
      setInstallments(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching installments:', error);
      enqueueSnackbar('Erro ao carregar contas a receber', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallments();
  }, [page, dateRange, sortConfig, searchText]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Contas a Receber
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'installment_id'}
                  direction={sortConfig.field === 'installment_id' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('installment_id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>ID Pagamento</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'due_date'}
                  direction={sortConfig.field === 'due_date' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('due_date')}
                >
                  Data de Vencimento
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'amount'}
                  direction={sortConfig.field === 'amount' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Valor
                </TableSortLabel>
              </TableCell>
              <TableCell>Parcela</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {installments.map((installment) => (
              <InstallmentRow key={installment.installment_id} installment={installment} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Receivables;
