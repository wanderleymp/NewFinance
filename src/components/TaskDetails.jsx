import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot 
} from '@mui/lab';
import { 
  Close as CloseIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { taskService } from '../services/taskService';

const STATUS_COLORS = {
  pending: 'warning',
  running: 'primary',
  completed: 'success',
  failed: 'error'
};

const LOG_LEVEL_ICONS = {
  error: <ErrorIcon color="error" />,
  warning: <WarningIcon color="warning" />,
  info: <InfoIcon color="info" />,
  success: <SuccessIcon color="success" />
};

function TaskDetails({ task, onClose }) {
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('TaskDetails: Renderizando componente', { task, onClose });

  useEffect(() => {
    async function fetchTaskLogs() {
      console.log('TaskDetails: Iniciando busca de logs', { taskId: task?.task_id });
      
      if (!task || !task.task_id) {
        console.warn('TaskDetails: Tarefa ou ID da tarefa inválido');
        setError('Tarefa inválida');
        setLoading(false);
        return;
      }

      try {
        console.log('TaskDetails: Buscando logs para task:', task.task_id);
        const logs = await taskService.getTaskLogs(task.task_id);
        
        console.log('TaskDetails: Logs recebidos', logs);
        
        if (logs && logs.length > 0) {
          setTaskLogs(logs);
        } else {
          console.warn('TaskDetails: Nenhum log encontrado');
          setError('Nenhum log encontrado para esta tarefa');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('TaskDetails: Falha ao buscar logs da task', error);
        setError(error.message || 'Erro ao buscar logs da tarefa');
        setLoading(false);
      }
    }

    fetchTaskLogs();
  }, [task]);

  const handleExportCSV = () => {
    const csvContent = [
      'Timestamp,Level,Message',
      ...taskLogs.map(log => 
        `${log.timestamp},${log.level},${log.message.replace(/,/g, ';')}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `task_${task.task_id}_logs.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    console.log('TaskDetails: Fechando modal');
    onClose();
  };

  if (!task) {
    console.warn('TaskDetails: Sem tarefa para renderizar');
    return null;
  }

  return (
    <Dialog 
      open={!!task} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Task Details: {task.name || task.task_id}
          </Typography>
          <Box>
            <Tooltip title="Export Logs">
              <IconButton 
                onClick={handleExportCSV} 
                color="primary"
                disabled={loading || !taskLogs.length}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Task Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Task ID:</Typography>
                        <Typography variant="body2">{task.task_id}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Type:</Typography>
                        <Typography variant="body2">{task.type}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Priority:</Typography>
                        <Typography variant="body2">{task.priority}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Status:</Typography>
                        <Chip 
                          label={task.status} 
                          color={STATUS_COLORS[task.status]} 
                          size="small" 
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Retry Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Retries:</Typography>
                        <Typography variant="body2">
                          {task.retries} / {task.max_retries}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">Created At:</Typography>
                        <Typography variant="body2">
                          {new Date(task.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      {task.next_retry_at && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="textSecondary">Next Retry:</Typography>
                          <Typography variant="body2">
                            {new Date(task.next_retry_at).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Task Logs
            </Typography>

            {taskLogs.length === 0 ? (
              <Alert severity="info">
                Nenhum log encontrado para esta tarefa
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taskLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          {LOG_LEVEL_ICONS[log.level] || <InfoIcon color="info" />}
                          {log.level}
                        </TableCell>
                        <TableCell>{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetails;
