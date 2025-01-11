import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Switch, 
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaskDashboard from '../components/TaskDashboard';
import TaskList from '../components/TaskList';
import TaskDetails from '../components/TaskDetails';
import { taskService } from '../services/taskService';

const lightTheme = createTheme();
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function TaskMonitoring() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  useEffect(() => {
    const handleShowSnackbar = (event) => {
      console.log('Evento de Snackbar recebido:', event.detail);
      setSnackbarMessage(event.detail.message);
      setSnackbarSeverity(event.detail.severity || 'error');
      setSnackbarOpen(true);
    };

    window.addEventListener('show-snackbar', handleShowSnackbar);

    return () => {
      window.removeEventListener('show-snackbar', handleShowSnackbar);
    };
  }, []);

  const handleTaskSelect = async (task) => {
    console.group('TaskMonitoring: Seleção de Task');
    console.log('Task selecionada:', task);
    
    try {
      // Tenta buscar os detalhes completos da tarefa
      const taskDetails = await taskService.getTaskById(task.task_id);
      
      console.log('TaskMonitoring: Detalhes da task recebidos', taskDetails);
      
      if (taskDetails) {
        setSelectedTask(taskDetails);
      } else {
        console.warn('TaskMonitoring: Detalhes da task não encontrados');
        throw new Error('Não foi possível carregar os detalhes da tarefa');
      }
    } catch (err) {
      console.error('TaskMonitoring: Erro ao selecionar task:', err);
      
      // Dispara evento de snackbar
      window.dispatchEvent(new CustomEvent('show-snackbar', {
        detail: {
          message: err.message || 'Erro ao carregar detalhes da tarefa',
          severity: 'error'
        }
      }));

      // Tenta recuperar a tarefa original caso a busca por ID falhe
      setSelectedTask(task);
    } finally {
      console.groupEnd();
    }
  };

  const handleCloseTaskDetails = () => {
    console.log('TaskMonitoring: Fechando detalhes da task');
    setSelectedTask(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box 
        sx={{ 
          backgroundColor: isDarkMode ? '#121212' : '#f4f4f4', 
          minHeight: '100vh',
          py: 4 
        }}
      >
        <Container maxWidth="xl">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}
          >
            <Typography variant="h4" component="h1">
              Task Monitoring Dashboard
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TaskDashboard />
            </Grid>
            <Grid item xs={12} md={8}>
              <TaskList onTaskSelect={handleTaskSelect} />
            </Grid>
          </Grid>

          {selectedTask && (
            <TaskDetails 
              task={selectedTask} 
              onClose={handleCloseTaskDetails} 
            />
          )}

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbarSeverity} 
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default TaskMonitoring;
