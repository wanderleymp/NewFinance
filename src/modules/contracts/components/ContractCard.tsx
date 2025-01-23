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
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Build as ManageServicesIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { Contract } from '../types/contract';
import { ContractFullDetailsModal } from './ContractFullDetailsModal';

interface ContractCardProps {
  contract?: Contract;
  onEdit?: (contract?: Contract) => void;
  onDelete?: () => void;
  onView?: () => void;
  onManageServices?: (contractId: number) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
  onManageServices = () => {}
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
    switch(contract?.status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'error';
    }
  };

  const formatStartDate = (startDate?: Date | string | null) => {
    if (!startDate) return 'Data não definida';
    
    try {
      const parsedDate = typeof startDate === 'string' 
        ? parseISO(startDate) 
        : startDate;
      
      // Verificar se a data é válida
      if (isNaN(parsedDate.getTime())) {
        return 'Data inválida';
      }
      
      return format(parsedDate, 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  const handleOpenDetailsModal = () => {
    console.log('Abrindo modal de detalhes', contract);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  if (!contract) return null;

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
              {(contract.fullName || contract.name)[0].toUpperCase()}
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
                  {contract.fullName || contract.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'primary.main',
                    opacity: 0.8,
                    fontWeight: 500
                  }}
                >
                  #{contract.id}
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
                {contract.name || 'Descrição não disponível'}
              </Typography>
            </Box>
          }
          subheader={
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.5,
                color: 'text.secondary',
                opacity: 0.8
              }}
            >
              {formatStartDate(contract.startDate)}
            </Typography>
          }
        />
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 'bold'
              }}
            >
              {formatCurrency(contract.value)}
            </Typography>
            <Chip 
              label={contract.status === 'active' ? 'Ativo' : 'Inativo'} 
              color={getStatusColor()} 
              size="small"
              sx={{ height: '22px' }}
            />
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
              <IconButton onClick={() => onManageServices(contract.id)} aria-label="gerenciar serviços" size="small">
                <ManageServicesIcon fontSize="small" />
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
              onManageServices(contract.id);
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