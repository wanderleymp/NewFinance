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

interface ContractAdjustmentsTabProps {
  contract: Contract;
}

export function ContractAdjustmentsTab({ contract }: ContractAdjustmentsTabProps) {
  const { data: contractAdjustments = [] } = useQuery({
    queryKey: ['contract-adjustments', contract.id],
    queryFn: () => mockData.getContractAdjustments(contract.id)
  });

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Ajustes de Contrato
      </Typography>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contractAdjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>{adjustment.description}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={adjustment.type} 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                  />
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
