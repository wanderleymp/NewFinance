import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Button,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Computer as ComputerIcon,
  DataUsage as DataUsageIcon,
  CloudQueue as CloudQueueIcon,
  SignalWifiOff as SignalWifiOffIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import systemService from '../services/systemService';
import useInterval from '../hooks/useInterval';

const SystemStatus = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(5000); // 5 segundos padrão
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const loadHealth = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await systemService.getHealth();
      
      if (result.success) {
        setHealth(result.data);
        setError(null);
        setIsOffline(false);
        setLastUpdate(new Date());
      } else {
        setError(result.error);
        setIsOffline(result.offline);
        if (result.offline) {
          enqueueSnackbar('Servidor indisponível', { 
            variant: 'error',
            autoHideDuration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar status do sistema:', error);
      setError('Erro inesperado ao carregar status do sistema');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [enqueueSnackbar]);

  // Usar o hook personalizado para atualização apenas quando não houver erro
  useInterval(loadHealth, error || isOffline ? null : updateInterval);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleIntervalChange = (event) => {
    setUpdateInterval(event.target.value);
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastUpdate);
  };

  const formatMemory = (value) => {
    return value.replace(' GB', '').replace(' MB', '').replace(' KB', '');
  };

  const getStatusColor = (status) => {
    return status === 'healthy' ? 'success' : 'error';
  };

  const getCPUUsage = () => {
    if (!health?.system?.cpu?.usage) return 0;
    const avgUsage = health.system.cpu.usage.reduce((acc, curr) => 
      acc + parseFloat(curr.usage.replace('%', '')), 0) / health.system.cpu.usage.length;
    return avgUsage.toFixed(2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isOffline) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          icon={<CloudOffIcon />}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadHealth}
              startIcon={<RefreshIcon />}
              disabled={refreshing}
            >
              Tentar Novamente
            </Button>
          }
          sx={{ mb: 2 }}
        >
          O servidor está offline ou inacessível
        </Alert>
        <Typography variant="body2" color="textSecondary">
          Última tentativa: {formatLastUpdate()}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadHealth}
              startIcon={<RefreshIcon />}
              disabled={refreshing}
            >
              Tentar Novamente
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
        <Typography variant="body2" color="textSecondary">
          Última atualização bem-sucedida: {formatLastUpdate()}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" component="h1">
            Status do Sistema
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Última atualização: {formatLastUpdate()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Intervalo de Atualização</InputLabel>
            <Select
              value={updateInterval}
              label="Intervalo de Atualização"
              onChange={handleIntervalChange}
            >
              <MenuItem value={1000}>1 segundo</MenuItem>
              <MenuItem value={5000}>5 segundos</MenuItem>
              <MenuItem value={10000}>10 segundos</MenuItem>
              <MenuItem value={30000}>30 segundos</MenuItem>
              <MenuItem value={60000}>1 minuto</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={refreshing ? 'Atualizando...' : 'Atualizar Agora'}>
            <IconButton 
              onClick={loadHealth} 
              disabled={refreshing}
              sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Geral */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {health?.status === 'healthy' ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              ) : (
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              )}
              <Box>
                <Typography variant="h6">Status do Sistema</Typography>
                <Chip
                  label={health?.status === 'healthy' ? 'Saudável' : 'Com Problemas'}
                  color={getStatusColor(health?.status)}
                  size="small"
                />
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CloudQueueIcon />
              <Box>
                <Typography variant="body2" color="textSecondary">Versão</Typography>
                <Typography variant="body1">{health?.version}</Typography>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TimerIcon />
              <Box>
                <Typography variant="body2" color="textSecondary">Uptime</Typography>
                <Typography variant="body1">{health?.system?.app?.uptime}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* CPU e Memória */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SpeedIcon color="primary" />
                  <Typography variant="h6">CPU</Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Utilização
                    </Typography>
                    <Typography variant="body2">{getCPUUsage()}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(getCPUUsage())} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Cores: {health?.system?.cpu?.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Modelo: {health?.system?.cpu?.model}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MemoryIcon color="primary" />
                  <Typography variant="h6">Memória</Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Utilização
                    </Typography>
                    <Typography variant="body2">{health?.system?.memory?.usagePercentage}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(health?.system?.memory?.usagePercentage)} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">Total</Typography>
                    <Typography variant="body1">{health?.system?.memory?.total}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">Usado</Typography>
                    <Typography variant="body1">{health?.system?.memory?.used}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">Livre</Typography>
                    <Typography variant="body1">{health?.system?.memory?.free}</Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Database */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="h6">Banco de Dados</Typography>
                </Box>
                {Object.entries(health?.databases || {}).map(([name, db]) => (
                  <Box key={name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">{name}</Typography>
                      <Chip
                        label={db.success ? 'Online' : 'Offline'}
                        color={db.success ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Tempo de Resposta: {db.responseTime}
                      </Typography>
                      <Typography variant="body2">
                        Conexões Ativas: {db.activeConnections}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                        {db.version}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema Operacional */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ComputerIcon color="primary" />
                  <Typography variant="h6">Sistema Operacional</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Plataforma</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {health?.system?.os?.platform}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Arquitetura</Typography>
                    <Typography variant="body1">{health?.system?.os?.arch}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Release</Typography>
                    <Typography variant="body1">{health?.system?.os?.release}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Uptime do Sistema</Typography>
                    <Typography variant="body1">{health?.system?.os?.uptime}</Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemStatus;
