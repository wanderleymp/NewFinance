import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  LinearProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  CheckCircle as CompletedIcon,
  PendingOutlined as PendingIcon,
  RunCircle as RunningIcon,
  ErrorOutline as FailedIcon,
  Speed as PerformanceIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { taskService } from '../services/taskService';

const STATUS_COLORS = {
  pending: '#FFC107',
  running: '#2196F3',
  completed: '#4CAF50',
  failed: '#F44336'
};

function TaskDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const stats = await taskService.getDashboardStats();
        console.log('Fetched Dashboard Stats:', stats);
        
        if (!stats || Object.keys(stats).length === 0) {
          setError(new Error('No dashboard stats available'));
        } else {
          setDashboardStats(stats);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
        setError(error);
        setLoading(false);
      }
    }

    fetchDashboardStats();
    const intervalId = setInterval(fetchDashboardStats, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  if (error || !dashboardStats) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Erro ao carregar estatísticas
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {error?.message || 'Não foi possível obter os dados do dashboard'}
        </Typography>
      </Paper>
    );
  }

  const statusData = [
    { name: 'Pending', value: dashboardStats.statusCounts?.pending || 0, icon: <PendingIcon color="warning" /> },
    { name: 'Running', value: dashboardStats.statusCounts?.running || 0, icon: <RunningIcon color="primary" /> },
    { name: 'Completed', value: dashboardStats.statusCounts?.completed || 0, icon: <CompletedIcon color="success" /> },
    { name: 'Failed', value: dashboardStats.statusCounts?.failed || 0, icon: <FailedIcon color="error" /> }
  ];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Task Performance Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Task Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name.toLowerCase()]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      `${name} Tasks`
                    ]}
                  />
                  <Legend 
                    iconType="circle"
                    formatter={(value) => (
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        {statusData.find(item => item.name === value)?.icon}
                        <Typography component="span" sx={{ ml: 1 }}>{value}</Typography>
                      </Box>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PerformanceIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography>
                      Success Rate: 
                      <Chip 
                        label={`${dashboardStats.successRate || 0}%`} 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PerformanceIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography>
                      Avg Processing: 
                      <Chip 
                        label={`${dashboardStats.avgProcessingTime || 0} sec`} 
                        color="secondary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PerformanceIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Typography>
                      Total Tasks: 
                      <Chip 
                        label={dashboardStats.totalTasks || 0} 
                        color="info" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default TaskDashboard;
