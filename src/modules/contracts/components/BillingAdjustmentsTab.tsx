import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Chip,
  Button
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../services/mockData';
import { Contract } from '../types/contract';

interface BillingAdjustmentsTabProps {
  contract: Contract;
}

export function BillingAdjustmentsTab({ contract }: BillingAdjustmentsTabProps) {
  const { data: billingAdjustments = [] } = useQuery({
    queryKey: ['billing-adjustments', contract.id],
    queryFn: () => mockData.getBillingAdjustments(contract.id)
  });

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Ajustes de Faturamento
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billingAdjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>{adjustment.description}</TableCell>
                <TableCell align="right">
                  R$ {adjustment.value.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  {adjustment.date.toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={adjustment.status} 
                    color={
                      adjustment.status === 'aprovado' ? 'success' : 
                      adjustment.status === 'pendente' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                  >
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
