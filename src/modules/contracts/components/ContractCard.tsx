import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  ListItemIcon,
  Stack
} from '@mui/material';
import { 
  AddCircleOutline as AddServicesIcon,
  SwapVert as AdjustmentsIcon,
  RequestQuote as BillingIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Build as ManageServicesIcon,
  CheckCircle as ActiveIcon,
  Block as InactiveIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { Contract } from '../types/contract';

interface ContractCardProps {
  contract: Contract;
  onManageServices: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: () => void;
  onView: () => void;
  onBilling?: () => void;
}

export function ContractCard({ 
  contract, 
  onManageServices, 
  onEdit,
  onDelete,
  onView,
  onBilling
}: ContractCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = typeof dateString === 'string' 
        ? parseISO(dateString)
        : dateString;
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    try {
      if (value === null || value === undefined) return 'R$ 0,00';
      
      const numericValue = typeof value === 'string' 
        ? parseFloat(value) 
        : value;
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numericValue);
    } catch (error) {
      console.error('Erro ao formatar valor:', error);
      return 'R$ 0,00';
    }
  };

  const getStatusInfo = () => {
    switch(contract.status?.toLowerCase()) {
      case 'active': return { 
        color: 'success', 
        label: 'Ativo' 
      };
      case 'inactive': return { 
        color: 'warning', 
        label: 'Inativo' 
      };
      default: return { 
        color: 'default', 
        label: 'Status desconhecido' 
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card 
      variant="outlined"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            component="div" 
            noWrap 
            sx={{ 
              maxWidth: isMobile ? '200px' : '250px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {contract.contract_name || 'Contrato sem nome'}
          </Typography>
          <Chip 
            label={statusInfo.label} 
            color={statusInfo.color as any} 
            size="small" 
            variant="outlined"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon fontSize="small" color="action" />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap
            sx={{ 
              maxWidth: isMobile ? '250px' : '300px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {contract.full_name || 'Pessoa não identificada'}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <MoneyIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(contract.contract_value)}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Próximo Faturamento: {formatDate(contract.next_billing_date)}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Adicionar Serviços">
              <IconButton 
                onClick={() => onManageServices(contract)} 
                size="small" 
                color="primary"
              >
                <AddServicesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ajustar Contrato">
              <IconButton 
                onClick={() => onEdit(contract)} 
                size="small" 
                color="primary"
              >
                <AdjustmentsIcon />
              </IconButton>
            </Tooltip>
            {onBilling && (
              <Tooltip title="Faturar Contrato">
                <IconButton 
                  onClick={onBilling}
                  size="small" 
                  color="primary"
                >
                  <BillingIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Visualizar Contrato">
              <IconButton 
                onClick={onView} 
                size="small" 
                color="secondary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <IconButton 
            aria-label="Mais opções"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          Visualizar
        </MenuItem>
        <MenuItem onClick={() => { onEdit(contract); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        {onBilling && (
          <MenuItem onClick={() => { onBilling(); handleMenuClose(); }}>
            <ListItemIcon>
              <BillingIcon fontSize="small" />
            </ListItemIcon>
            Faturar
          </MenuItem>
        )}
        <MenuItem onClick={() => { onManageServices(contract); handleMenuClose(); }}>
          <ListItemIcon>
            <ManageServicesIcon fontSize="small" />
          </ListItemIcon>
          Gerenciar Serviços
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>
    </Card>
  );
}