import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usersService } from '../services/api';
import DataTable from '../components/DataTable';

export default function Users() {
  const [users, setUsers] = useState({ items: [], meta: {} });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    active: true,
  });
  const { enqueueSnackbar } = useSnackbar();

  const loadUsers = async () => {
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
      };
      const data = await usersService.list(params);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        active: user.active,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        await usersService.update(selectedUser.id, dataToSend);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      } else {
        await usersService.create(formData);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      enqueueSnackbar('Erro ao salvar usuário', { variant: 'error' });
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usersService.delete(user.id);
        enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' });
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'active',
      headerName: 'Ativo',
      width: 100,
      renderCell: (params) => (
        <FormControlLabel
          control={<Switch checked={params.value} disabled />}
          label=""
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Usuário
        </Button>
      </Box>

      <DataTable
        rows={users.items}
        columns={columns}
        pageSize={10}
        rowCount={users.meta.totalItems}
        page={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label={selectedUser ? 'Nova Senha (opcional)' : 'Senha'}
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
