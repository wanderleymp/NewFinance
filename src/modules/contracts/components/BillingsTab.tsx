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
  Button,
  Box
} from '@mui/material';
import { 
  Receipt as ReceiptIcon, 
  Download as DownloadIcon 
} from '@mui/icons-material';
import { Contract } from '../types/contract';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../services/mockData';

interface BillingsTabProps {
  contract: Contract;
}

export function BillingsTab({ contract }: BillingsTabProps) {
  const { data: billings = [] } = useQuery({
    queryKey: ['billings', contract.id],
    queryFn: () => mockData.getBillings(contract.id)
  });

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Histórico de Faturamentos
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Período</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Vencimento</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billings.map((billing) => (
              <TableRow key={billing.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                    {billing.period}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  R$ {billing.value.toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  {billing.dueDate.toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={billing.status} 
                    color={
                      billing.status === 'pago' ? 'success' : 
                      billing.status === 'pendente' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    startIcon={<DownloadIcon />}
                  >
                    Baixar
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
