import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination,
  Chip,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  FilterList as FilterIcon, 
  Visibility as DetailsIcon 
} from '@mui/icons-material';
import { taskService } from '../services/taskService';

const STATUS_COLORS = {
  pending: 'warning',
  running: 'primary',
  completed: 'success',
  failed: 'error'
};

function TaskList({ onTaskSelect }) {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const result = await taskService.getTasks({
        ...filters,
        page: page + 1,
        limit: rowsPerPage
      });
      setTasks(result.data);
      setTotalTasks(result.total);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6">Task List</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Tasks">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2, 
          flexWrap: 'wrap' 
        }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              label="Type"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="">All</MenuItem>
              {/* Add task types dynamically if possible */}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              label="Priority"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Retries</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Loading tasks...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No tasks found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.task_id} hover>
                    <TableCell>{task.task_id}</TableCell>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status} 
                        color={STATUS_COLORS[task.status]} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{`${task.retries}/${task.max_retries}`}</TableCell>
                    <TableCell>
                      {new Date(task.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation(); // Previne eventos de propagação
                            console.group('TaskList: Detalhes da Task');
                            console.log('Task clicada:', task);
                            console.log('onTaskSelect:', typeof onTaskSelect);
                            
                            try {
                              // Verifica se onTaskSelect é uma função válida
                              if (typeof onTaskSelect !== 'function') {
                                throw new Error('onTaskSelect não é uma função válida');
                              }

                              // Validação dos dados da tarefa
                              if (!task || !task.task_id) {
                                throw new Error('Dados da tarefa inválidos');
                              }

                              // Chama onTaskSelect com os dados da tarefa
                              onTaskSelect(task);
                            } catch (error) {
                              console.error('Erro ao abrir detalhes da task:', error);
                              
                              // Mostra um snackbar ou toast com a mensagem de erro
                              window.dispatchEvent(new CustomEvent('show-snackbar', {
                                detail: {
                                  message: error.message,
                                  severity: 'error'
                                }
                              }));
                            } finally {
                              console.groupEnd();
                            }
                          }}
                        >
                          <DetailsIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalTasks} 
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Tasks por página"
        />
      </CardContent>
    </Card>
  );
}

export default TaskList;
