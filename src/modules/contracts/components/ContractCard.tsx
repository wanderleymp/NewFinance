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
  ListItemIcon
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
  Build as ManageServicesIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Contract } from '../types/contract';
import { mockData } from '../services/mockData';
import { BillingConfirmationModal } from './BillingConfirmationModal';
import toast from 'react-hot-toast';

// Log de importação de ícones
console.log('Ícones importados:', {
  AddServicesIcon: AddServicesIcon ? 'Importado' : 'Não importado',
  AdjustmentsIcon: AdjustmentsIcon ? 'Importado' : 'Não importado',
  BillingIcon: BillingIcon ? 'Importado' : 'Não importado',
  MoreVertIcon: MoreVertIcon ? 'Importado' : 'Não importado',
  ViewIcon: ViewIcon ? 'Importado' : 'Não importado',
  ManageServicesIcon: ManageServicesIcon ? 'Importado' : 'Não importado',
  EditIcon: EditIcon ? 'Importado' : 'Não importado'
});

interface ContractCardProps {
  contract: Contract;
  onManageServices: (contract: Contract) => void;
  onManageAdjustments: () => void;
  onEdit: (contract: Contract) => void;
  onDelete: () => void;
  onView: () => void;
}

export function ContractCard({ 
  contract, 
  onManageServices, 
  onManageAdjustments,
  onEdit,
  onDelete,
  onView 
}: ContractCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBillContract = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Faturamento realizado com sucesso!');
      setIsConfirmationOpen(false);
    } catch (error) {
      toast.error('Erro ao realizar faturamento. Tente novamente.');
    }
  };

  const canBill = contract.status === 'ativo';
  const person = mockData.people.find(p => p.id === contract.personId);

  const getStatusColor = () => {
    switch(contract.status) {
      case 'ativo': return 'success';
      case 'inativo': return 'warning';
      default: return 'error';
    }
  };

  const handleManageServices = () => {
    console.log('Gerenciar serviços no card', contract);
    console.log('onManageServices type:', typeof onManageServices);
    console.log('onManageServices exists:', !!onManageServices);
    
    if (typeof onManageServices === 'function') {
      try {
        onManageServices(contract);
      } catch (error) {
        console.error('Erro ao chamar onManageServices:', error);
      }
    } else {
      console.warn('onManageServices não é uma função');
    }
    
    handleMenuClose();
  };

  const handleEditClick = () => {
    console.group('🖊️ ContractCard - Botão Editar');
    console.log('Contrato:', {
      id: contract.id,
      name: contract.name
    });
    console.log('onEdit type:', typeof onEdit);
    console.log('onEdit exists:', !!onEdit);
    
    try {
      if (onEdit) {
        console.log('🔓 Chamando onEdit com contrato');
        onEdit(contract);
      } else {
        console.warn('⚠️ Função onEdit não definida');
      }
    } catch (error) {
      console.error('❌ Erro ao chamar onEdit:', error);
    } finally {
      console.groupEnd();
    }
  };

  return (
    <>
      <Card 
        variant="outlined"
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between'
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
              {contract.name}
            </Typography>
            <Chip 
              label={contract.status} 
              color={getStatusColor()} 
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
                maxWidth: isMobile ? '180px' : '250px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}
            >
              {person?.name || 'N/A'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <MoneyIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(contract.currentValue)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Próximo Faturamento: {format(new Date(contract.nextBillingDate), 'dd/MM/yyyy')}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            sx={{ 
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 0
            }}
          >
            <Box display="flex" gap={1}>
              <Tooltip title="Adicionar Serviços">
                <IconButton 
                  onClick={onManageServices} 
                  size="small" 
                  color="primary"
                >
                  <AddServicesIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ajustar Contrato">
                <IconButton 
                  onClick={onManageAdjustments} 
                  size="small" 
                  color="primary"
                >
                  <AdjustmentsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={canBill ? "Faturar Contrato" : "Contrato não pode ser faturado"}>
                <span>
                  <IconButton 
                    onClick={() => canBill && setIsConfirmationOpen(true)}
                    disabled={!canBill}
                    size="small" 
                    color={canBill ? 'primary' : 'default'}
                  >
                    <BillingIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Tooltip title="Mais Ações">
              <IconButton 
                onClick={handleMenuOpen}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleManageServices}>
          <ListItemIcon>
            <ManageServicesIcon fontSize="small" />
          </ListItemIcon>
          Gerenciar Serviços
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>

      {isConfirmationOpen && (
        <BillingConfirmationModal 
          open={isConfirmationOpen} 
          onClose={() => {
            console.log('🔒 Fechando modal de confirmação de faturamento');
            setIsConfirmationOpen(false);
          }}
          onConfirm={handleBillContract}
          contractName={contract.name}
          billingValue={contract.totalValue}
        />
      )}
    </>
  );
}