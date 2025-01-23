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
  ListItemIcon
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Build as ManageServicesIcon
} from '@mui/icons-material';
import { parseISO } from 'date-fns';
import { Contract } from '../types/contract';

interface ContractCardProps {
  contract?: Contract;
  onEdit?: (contract?: Contract) => void;
  onDelete?: () => void;
  onView?: () => void;
  onManageServices?: (contract?: Contract) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
  onManageServices = () => {}
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    try {
      const parsedDate = parseISO(dateString);
      return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusInfo = () => {
    if (!contract) return { 
      label: 'Sem Status', 
      color: 'default' 
    };

    const statusNormalized = contract.status?.toLowerCase();

    switch (statusNormalized) {
      case 'ativo':
      case 'active':
        return { label: 'Ativo', color: 'success' };
      case 'inativo':
      case 'inactive':
        return { label: 'Inativo', color: 'error' };
      case 'pendente':
      case 'pending':
        return { label: 'Pendente', color: 'warning' };
      case 'cancelado':
      case 'canceled':
        return { label: 'Cancelado', color: 'error' };
      case 'suspenso':
      case 'suspended':
        return { label: 'Suspenso', color: 'warning' };
      default:
        return { label: 'Desconhecido', color: 'default' };
    }
  };

  if (!contract) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Contrato não disponível
        </Typography>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: getStatusInfo().color,
              width: 56, 
              height: 56 
            }}
          >
            {contract.name?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
        title={contract.name || 'Contrato sem nome'}
        subheader={contract.fullName || 'Nome não informado'}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Valor
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {formatCurrency(contract.value)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Grupo
          </Typography>
          <Typography variant="subtitle2">
            {contract.groupName || 'Não definido'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Próx. Cobrança
          </Typography>
          <Typography variant="subtitle2">
            {formatDate(contract.nextBillingDate)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Período
          </Typography>
          <Typography variant="subtitle2">
            {contract.recurrencePeriod === 'yearly' ? 'Anual' : 'Mensal'}
          </Typography>
        </Box>

        <Chip 
          label={getStatusInfo().label} 
          color={getStatusInfo().color as any} 
          variant="outlined"
          sx={{ width: '100%' }}
        />
      </CardContent>

      <CardActions disableSpacing>
        <IconButton 
          aria-label="editar" 
          onClick={() => onEdit(contract)}
          color="primary"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          aria-label="serviços" 
          onClick={() => onManageServices(contract)}
          color="secondary"
        >
          <ManageServicesIcon />
        </IconButton>
        <IconButton 
          aria-label="deletar" 
          onClick={onDelete}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onView(); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          Visualizar Detalhes
        </MenuItem>
        <MenuItem onClick={() => { onEdit(contract); handleMenuClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar Contrato
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Excluir Contrato
        </MenuItem>
      </Menu>
    </Card>
  );
};