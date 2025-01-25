import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Avatar,
  ListItemIcon,
  Tooltip,
  Button
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Build as ManageServicesIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AttachMoney } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { Contract } from '../types/contract';
import { ContractFullDetailsModal } from './ContractFullDetailsModal';
import { useNavigate } from 'react-router-dom';

interface ContractCardProps {
  contract?: Contract;
  onEdit?: (contract?: Contract) => void;
  onDelete?: () => void;
  onView?: () => void;
  onManageServices?: (contractId: number) => void;
  onRefresh?: () => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
  onManageServices = () => {},
  onRefresh
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatCurrency = (value?: number) => {
    if (value == null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getStatusColor = () => {
    if (!contract?.status) return 'error';
    switch(contract.status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'error';
    }
  };

  const formatRecurrencePeriod = (period?: 'monthly' | 'yearly') => {
    if (!period) return 'Não definido';
    switch(period.toLowerCase()) {
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return 'Não definido';
    }
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return 'Não definido';
    try {
      const parsedDate = typeof date === 'string' 
        ? parseISO(date) 
        : date;
      if (!parsedDate || isNaN(parsedDate.getTime())) return 'Data inválida';
      return format(parsedDate, 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Indefinido';
    switch(status.toLowerCase()) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      default: return 'Indefinido';
    }
  };

  const handleOpenDetailsModal = () => {
    console.log('Abrindo modal de detalhes', contract);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const handleProcessBilling = () => {
    if (contract?.id) {
      navigate(`/contracts/${contract.id}/billing`);
    }
  };

  if (!contract) return null;

  const displayName = contract.fullName || contract.name || 'Sem nome';
  const displayInitial = displayName[0]?.toUpperCase() || 'C';
  const contractId = contract.id || 0;
  const contractValue = typeof contract.value === 'number' ? contract.value : 0;
  const originalValue = typeof contract.total_amount === 'string' 
    ? parseFloat(contract.total_amount) 
    : contractValue;
  const hasValueChange = contractValue !== originalValue;
  const statusLabel = getStatusLabel(contract.status);

  return (
    <>
      <Card 
        variant="outlined" 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 2
          }
        }}
      >
        <CardHeader
          avatar={
            <Avatar 
              sx={{ 
                bgcolor: getStatusColor() === 'success' ? 'success.light' : 'warning.light' 
              }}
            >
              {displayInitial}
            </Avatar>
          }
          action={
            <Tooltip title="Mais opções">
              <IconButton onClick={handleMenuOpen} aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          }
          title={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {displayName}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'primary.main',
                    opacity: 0.8,
                    fontWeight: 500
                  }}
                >
                  #{contractId}
                </Typography>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontStyle: 'italic',
                  opacity: 0.8 
                }}
              >
                {contract.groupName || 'Grupo não definido'}
              </Typography>
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Início: {formatDate(contract.startDate)}
                {contract.endDate && ` • Fim: ${formatDate(contract.endDate)}`}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Recorrência: {formatRecurrencePeriod(contract.recurrencePeriod)} • 
                Vencimento: {contract.dueDay ? `Dia ${contract.dueDay}` : 'Não definido'}
              </Typography>
            </Box>
          }
        />
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  {formatCurrency(contractValue)}
                </Typography>
                {hasValueChange && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      textDecoration: 'line-through',
                      ml: 1
                    }}
                  >
                    {formatCurrency(originalValue)}
                  </Typography>
                )}
              </Box>
              <Chip 
                label={statusLabel}
                color={getStatusColor()} 
                size="small"
                sx={{ height: '22px' }}
              />
            </Box>
            
            {contract.nextBillingDate && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Próximo Faturamento: {formatDate(contract.nextBillingDate)}
              </Typography>
            )}
            
            {contract.billingReference && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Referência: {contract.billingReference}
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'space-between', pt: 0 }}>
          <Box>
            <Tooltip title="Editar">
              <IconButton onClick={() => onEdit(contract)} aria-label="editar" size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gerenciar Serviços">
              <IconButton onClick={() => onManageServices(contractId)} aria-label="gerenciar serviços" size="small">
                <ManageServicesIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Processar Fatura">
              <IconButton 
                color="primary" 
                onClick={handleProcessBilling}
                disabled={contract?.status !== 'active'}
              >
                <AttachMoney />
              </IconButton>
            </Tooltip>
          </Box>
          <Box>
            <Tooltip title="Detalhes">
              <IconButton onClick={handleOpenDetailsModal} aria-label="detalhes" size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton onClick={onDelete} color="error" aria-label="excluir" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem 
            onClick={() => {
              handleMenuClose();
              onManageServices(contractId);
            }}
          >
            <ListItemIcon>
              <ManageServicesIcon fontSize="small" />
            </ListItemIcon>
            Gerenciar Serviços
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleMenuClose();
              onView();
              handleOpenDetailsModal();
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            Visualizar Detalhes
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleMenuClose();
              onEdit(contract);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Editar
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleMenuClose();
              onDelete();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Excluir
          </MenuItem>
        </Menu>
      </Card>

      {/* Modal de Detalhes do Contrato */}
      <ContractFullDetailsModal 
        open={isDetailsModalOpen} 
        onClose={handleCloseDetailsModal} 
        contract={contract} 
      />
    </>
  );
};