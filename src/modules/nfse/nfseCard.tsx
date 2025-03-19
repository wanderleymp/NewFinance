import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip 
} from '@mui/material';
import { Nfse } from './nfseTypes';

interface NfseCardProps {
  nfse: Nfse;
}

export const NfseCard: React.FC<NfseCardProps> = ({ nfse }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EMITIDA': return 'success';
      case 'PENDENTE': return 'warning';
      case 'CANCELADA': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ minWidth: 275, margin: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Typography variant="h6">NFSe #{nfse.nfseId}</Typography>
            <Chip 
              label={nfse.invoice.status} 
              color={getStatusColor(nfse.invoice.status)} 
              size="small" 
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Valor do Serviço</Typography>
            <Typography variant="subtitle1">
              {nfse.serviceValue.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">ID Fatura</Typography>
            <Typography variant="subtitle1">{nfse.invoiceId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">Data de Criação</Typography>
            <Typography variant="subtitle1">
              {new Date(nfse.createdAt).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
