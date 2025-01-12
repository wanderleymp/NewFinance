import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { contactsService } from '../services/api';
import DataTable from '../components/DataTable';
import CardView from '../components/CardView';

const CONTACT_TYPES = [
  { value: 'EMAIL', label: 'Email', icon: EmailIcon },
  { value: 'PHONE', label: 'Telefone', icon: PhoneIcon },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: WhatsAppIcon },
];

const ContactTypeIcon = ({ type }) => {
  const contactType = CONTACT_TYPES.find(t => t.value === type.toUpperCase());
  if (!contactType) return null;
  const Icon = contactType.icon;
  return <Icon />;
};

export default function Contacts() {
  const [contacts, setContacts] = useState({ items: [], meta: {} });
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    type: 'EMAIL',
    value: '',
    name: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: 10,
        search: search || undefined,
        type: typeFilter || undefined,
      };
      const data = await contactsService.list(params);
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      enqueueSnackbar('Erro ao carregar contatos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadContacts();
  }, [page, search, typeFilter]);

  const handleOpenDialog = (contact = null) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData({
        type: contact.type.toUpperCase(),
        value: contact.value,
        name: contact.name,
      });
    } else {
      setSelectedContact(null);
      setFormData({
        type: 'EMAIL',
        value: '',
        name: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContact(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        type: formData.type.toLowerCase(),
      };

      if (selectedContact) {
        await contactsService.update(selectedContact.id, submitData);
        enqueueSnackbar('Contato atualizado com sucesso', { variant: 'success' });
      } else {
        await contactsService.create(submitData);
        enqueueSnackbar('Contato criado com sucesso', { variant: 'success' });
      }
      handleCloseDialog();
      loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      enqueueSnackbar('Erro ao salvar contato', { variant: 'error' });
    }
  };

  const handleDelete = async (contact) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      try {
        await contactsService.delete(contact.id);
        enqueueSnackbar('Contato excluído com sucesso', { variant: 'success' });
        loadContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        enqueueSnackbar('Erro ao excluir contato', { variant: 'error' });
      }
    }
  };

  const columns = [
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContactTypeIcon type={params.value} />
          {CONTACT_TYPES.find(t => t.value === params.value.toUpperCase())?.label}
        </Box>
      ),
    },
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'value', headerName: 'Valor', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const renderContactCard = (contact) => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ContactTypeIcon type={contact.type} />
        <Typography variant="subtitle1" color="primary">
          {CONTACT_TYPES.find(t => t.value === contact.type.toUpperCase())?.label}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom>
        {contact.name || 'Sem nome'}
      </Typography>
      <Typography color="text.secondary">
        {contact.value}
      </Typography>
    </>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Contatos
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="table">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="card">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="">Todos</MenuItem>
              {CONTACT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon fontSize="small" />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Contato
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {viewMode === 'table' ? (
          <DataTable
            rows={contacts.items}
            columns={columns}
            pageSize={10}
            rowCount={contacts.meta.totalItems}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            loading={loading}
          />
        ) : (
          <CardView
            items={contacts.items}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
            page={page}
            totalPages={Math.ceil((contacts.meta.totalItems || 0) / 10)}
            onPageChange={setPage}
            renderContent={renderContactCard}
            loading={loading}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContact ? 'Editar Contato' : 'Novo Contato'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Tipo"
              >
                {CONTACT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon fontSize="small" />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Valor"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.value || !formData.type}
          >
            {selectedContact ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
