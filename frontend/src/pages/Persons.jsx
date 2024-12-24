import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  Avatar,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  ContactPhone as ContactsIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import personsService from '../services/personsService';

const Persons = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      };

      console.log('Enviando parâmetros:', params);
      const response = await personsService.listDetails(params);
      console.log('Response completa:', response);
      
      const { items, meta } = response?.data || {};
      
      if (!items || !Array.isArray(items)) {
        console.error('Formato de resposta inválido:', response?.data);
        enqueueSnackbar('Erro ao carregar pessoas: formato de resposta inválido', { variant: 'error' });
        return;
      }

      setPersons(items);
      setTotalCount(meta?.totalItems || items.length);
      
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      enqueueSnackbar(`Erro ao carregar pessoas: ${error.message}`, { variant: 'error' });
      setPersons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, [page, rowsPerPage, search, typeFilter, statusFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0); // Volta para primeira página ao pesquisar
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleDelete = async (personId) => {
    try {
      await personsService.remove(personId);
      enqueueSnackbar('Pessoa excluída com sucesso!', { variant: 'success' });
      loadPersons();
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
      enqueueSnackbar('Erro ao excluir pessoa', { variant: 'error' });
    }
  };

  const getStatusChipProps = (active) => {
    return {
      label: active ? 'Ativo' : 'Inativo',
      color: active ? 'success' : 'error',
      variant: 'outlined',
    };
  };

  const getTypeChip = (type) => {
    switch (type?.toUpperCase()) {
      case 'PERSON':
        return {
          label: 'PF',
          color: 'primary',
          variant: 'outlined',
        };
      case 'COMPANY':
        return {
          label: 'PJ',
          color: 'primary',
          variant: 'outlined',
        };
      default:
        return {
          label: type || 'N/A',
          color: 'default',
          variant: 'outlined',
        };
    }
  };

  const formatDocument = (value, type) => {
    if (!value) return '-';
    
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata CNPJ: 00.000.000/0000-00
    if (type === 'CNPJ') {
      return numbers.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    
    // Formata CPF: 000.000.000-00
    return numbers.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
  };

  const filteredPersons = persons.filter((person) => {
    const matchesSearch = 
      (person.full_name?.toLowerCase().includes(search.toLowerCase()) ||
       person.fantasy_name?.toLowerCase().includes(search.toLowerCase()) ||
       person.document?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'PF' && person.type === 'PERSON') ||
      (typeFilter === 'PJ' && person.type === 'COMPANY');
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && person.active) ||
      (statusFilter === 'inactive' && !person.active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const paginatedPersons = filteredPersons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleOpenContacts = (person) => {
    setSelectedPerson(person);
    setContactsModalOpen(true);
  };

  const handleCloseContacts = () => {
    setContactsModalOpen(false);
    setSelectedPerson(null);
  };

  const getContactIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <EmailIcon fontSize="small" />;
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" />;
      case 'phone':
        return <PhoneIcon fontSize="small" />;
      default:
        return <ContactsIcon fontSize="small" />;
    }
  };

  const handleOpenNewMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNewMenu = () => {
    setAnchorEl(null);
  };

  const handleNewPerson = (type) => {
    handleCloseNewMenu();
    navigate('/persons/new', { state: { personType: type } });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5" component="h1" gutterBottom>
            Pessoas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seus clientes e fornecedores
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => navigate('/persons/import-cnpj')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Importar CNPJ
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/persons/new')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Nova Pessoa
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nome, fantasia ou documento..."
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo"
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="PF">Pessoa Física</MenuItem>
                <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Tipo</TableCell>
              <TableCell>Nome / Razão Social</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Localização</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Contatos</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Data Nasc.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key="loading">
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : paginatedPersons.length === 0 ? (
              <TableRow key="empty">
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    Nenhuma pessoa encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPersons.map((person, index) => (
                <TableRow
                  hover
                  key={person.person_id || `temp-${index}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Chip {...getTypeChip(person.documents?.[0]?.document_type === 'CNPJ' ? 'COMPANY' : 'PERSON')} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                        }}
                      >
                        {person.full_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {person.full_name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {person.fantasy_name && (
                            <Typography variant="caption" color="text.secondary">
                              {person.fantasy_name}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDocument(
                              person.documents?.[0]?.document_value,
                              person.documents?.[0]?.document_type
                            )}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {person.addresses?.[0]?.city || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {person.contacts?.length > 0 ? (
                      <Tooltip title="Ver contatos">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenContacts(person)}
                        >
                          <ContactsIcon fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            ({person.contacts.length})
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Adicionar contatos">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenContacts(person)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {person.birth_date ? format(new Date(person.birth_date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip {...getStatusChipProps(person.active)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/persons/${person.person_id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          if (window.confirm(`Deseja realmente excluir ${person.full_name}?`)) {
                            handleDelete(person.person_id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ 
        py: 2,
        px: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="body2" color="text.secondary">
          Total de registros: {filteredPersons.length}
        </Typography>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Itens por página"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Box>
      {/* Modal de Contatos */}
      <Dialog 
        open={contactsModalOpen} 
        onClose={handleCloseContacts}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Contatos - {selectedPerson?.full_name}
          <IconButton
            aria-label="close"
            onClick={handleCloseContacts}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPerson?.contacts?.length > 0 ? (
            <List>
              {selectedPerson.contacts.map((contact, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(contact.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {contact.contact_type === 'phone' ? <PhoneIcon /> : contact.contact_type === 'whatsapp' ? <WhatsAppIcon /> : <EmailIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={contact.contact_value}
                    secondary={contact.description || contact.contact_type}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              Nenhum contato cadastrado
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContacts}>Fechar</Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              handleCloseContacts();
              navigate(`/persons/${selectedPerson.id}/edit`, { state: { activeTab: 1 } });
            }}
          >
            Adicionar Contato
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Persons;
