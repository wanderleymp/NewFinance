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
import { Receipt } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { Contract } from '../types/contract';
import { ContractFullDetailsModal } from './ContractFullDetailsModal';
import { BillingConfirmationModal } from './BillingConfirmationModal';
import { contractService } from '../services/contractService';
import toast from 'react-hot-toast';
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
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
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

  const handleBillingDetails = () => {
    console.log('🚨 Navegando para detalhes de faturamento', {
      contractId: contract?.id,
      contractName: contract?.name,
      contractStatus: contract?.status
    });

    if (contract?.id) {
      try {
        console.log('🚨 Iniciando navegação para rota de faturamento');
        navigate(`/contracts-recurring/${contract.id}/billing`);
        console.log('🚨 Navegação concluída com sucesso');
      } catch (error) {
        console.error('🚨 Erro na navegação:', error);
      }
    } else {
      console.warn('🚨 ID do contrato não definido');
    }
  };

  const handleBillContract = async () => {
    if (!contract) return;

    try {
      // Identifica o ID da fatura ou do contrato
      const billingId = contract.billings?.[0]?.id || String(contract.id);
      
      if (!billingId) {
        toast.error('Não foi possível identificar a fatura para processamento.');
        return;
      }

      // Log detalhado
      console.log('Processando faturamento', {
        billingId,
        contractId: contract.id,
        contractName: contract.name,
        contractStatus: contract.status
      });

      // Usa o método de processamento de fatura
      await contractService.processBilling(String(billingId));
      
      // Notificação de sucesso
      toast.success('Fatura processada com sucesso', { 
        duration: 3000,
        position: 'bottom-right'
      });

      // Fecha o modal de confirmação
      setIsConfirmationOpen(false);
      
      // Atualiza a lista se o callback de refresh estiver disponível
      if (onRefresh) onRefresh();
    } catch (error) {
      // Log e tratamento de erro
      console.error('Erro no processamento de fatura:', error);
      
      toast.error('Erro ao processar fatura. Tente novamente.', {
        duration: 4000,
        position: 'bottom-right'
      });
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
          justifyContent: 'space-between' 
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
        <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Visualizar Detalhes">
              <IconButton onClick={() => setIsDetailsModalOpen(true)} size="small">
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar Contrato">
              <IconButton onClick={() => onEdit(contract)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gerenciar Serviços">
              <IconButton onClick={() => onManageServices(contract.id)} size="small">
                <ManageServicesIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Faturar Contrato">
              <IconButton 
                onClick={() => setIsConfirmationOpen(true)} 
                size="small"
                disabled={contract.status !== 'active'}
              >
                <Receipt 
                  className={`w-4 h-4 ${
                    contract.status === 'active' 
                      ? 'text-blue-500 hover:text-blue-700' 
                      : 'text-gray-400'
                  }`} 
                />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title="Excluir Contrato">
            <IconButton onClick={onDelete} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

      {contract && (
        <BillingConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleBillContract}
          contract={contract}
        />
      )}
    </>
  );
};