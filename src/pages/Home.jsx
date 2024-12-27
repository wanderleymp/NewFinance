import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Jan', valor: 4000 },
  { name: 'Fev', valor: 3000 },
  { name: 'Mar', valor: 5000 },
  { name: 'Abr', valor: 2780 },
  { name: 'Mai', valor: 1890 },
  { name: 'Jun', valor: 2390 },
];

const Home = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Bem-vindo, {user?.username || 'Usuário'}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Aqui está um resumo das suas finanças
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Visão Geral Financeira
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                    />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Saldo Total
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.primary.main, my: 2 }}>
                R$ 12.345,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atualizado hoje às 09:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 4,
                  height: '100%',
                  bgcolor: theme.palette.success.main,
                  borderTopRightRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              />
              <Typography variant="h6" gutterBottom fontWeight="600">
                Receitas
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.success.main, my: 2 }}>
                R$ 5.678,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este Mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 4,
                  height: '100%',
                  bgcolor: theme.palette.error.main,
                  borderTopRightRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              />
              <Typography variant="h6" gutterBottom fontWeight="600">
                Despesas
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.error.main, my: 2 }}>
                R$ 3.421,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este Mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 4,
                  height: '100%',
                  bgcolor: theme.palette.info.main,
                  borderTopRightRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              />
              <Typography variant="h6" gutterBottom fontWeight="600">
                Economia
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.info.main, my: 2 }}>
                R$ 2.257,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este Mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
