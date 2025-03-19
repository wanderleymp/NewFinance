import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography 
} from '@mui/material';

const FinanceDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Painel Financeiro
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Resumo de Receitas</Typography>
              {/* Adicionar gráficos e estatísticas */}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Resumo de Despesas</Typography>
              {/* Adicionar gráficos e estatísticas */}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">Saldo Atual</Typography>
              {/* Adicionar informações de saldo */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default FinanceDashboard;
