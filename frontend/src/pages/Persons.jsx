import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Grid,
  IconButton,
  Typography,
  MenuItem,
  Chip,
  Tooltip,
  Menu,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Contacts as ContactsIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import personsService from '../services/personsService';
import ImportCnpjDialog from '../components/ImportCnpjDialog';

const PersonRow = ({ person, onEdit, onDelete }) => {
  const handleLocationClick = (address) => {
    if (address) {
      const query = `${address.street}, ${address.number}, ${address.city}, ${address.state}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  // Pega o primeiro endereço (se existir)
  const mainAddress = person.addresses?.[0];
  
  // Pega o documento principal (CPF ou CNPJ)
  const mainDocument = person.documents?.find(doc => 
    doc.document_type === 'CPF' || doc.document_type === 'CNPJ'
  );

  // Formata o documento
  const formatDocument = (doc) => {
    if (!doc) return '-';
    if (doc.document_type === 'CPF') {
      return doc.document_value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return doc.document_value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <TableRow hover>
      <TableCell>
        {person.person_type === 'PF' ? (
          <Tooltip title="Pessoa Física">
            <PersonIcon fontSize="small" color="primary" />
          </Tooltip>
        ) : (
          <Tooltip title="Pessoa Jurídica">
            <BusinessIcon fontSize="small" color="primary" />
          </Tooltip>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="textSecondary">
          #{person.id}
        </Typography>
      </TableCell>
      <TableCell>{person.full_name}</TableCell>
      <TableCell>{person.fantasy_name || '-'}</TableCell>
      <TableCell>{formatDocument(mainDocument)}</TableCell>
      <TableCell>
        {mainAddress ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{mainAddress.city}</Typography>
            <Tooltip title="Ver no Maps">
              <IconButton 
                size="small" 
                onClick={() => handleLocationClick(mainAddress)}
                sx={{ color: 'primary.main' }}
              >
                <LocationIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : '-'}
      </TableCell>
      <TableCell>
        {person.contacts?.length > 0 ? (
          <Tooltip title={`${person.contacts.length} contato(s)`}>
            <Badge badgeContent={person.contacts.length} color="primary">
              <ContactsIcon fontSize="small" />
            </Badge>
          </Tooltip>
        ) : '-'}
      </TableCell>
      <TableCell>
        {person.birth_date ? format(new Date(person.birth_date), 'dd/MM/yyyy') : '-'}
      </TableCell>
      <TableCell>
        <Chip
          label={person.active ? 'Ativo' : 'Inativo'}
          color={person.active ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(person)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error" onClick={() => onDelete(person)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

const Persons = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [importCnpjOpen, setImportCnpjOpen] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [orderBy, setOrderBy] = useState('full_name');
  const [orderDirection, setOrderDirection] = useState('ASC');

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(type && { type }),
        ...(orderBy && { orderBy }),
        ...(orderDirection && { orderDirection })
      };

      const response = await personsService.listDetails(params);
      setPersons(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching persons:', error);
      setPersons([]);
      setTotalPages(1);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao carregar pessoas',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, [page, limit, search, type, orderBy, orderDirection]);

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setOrderBy(field);
      setOrderDirection('ASC');
    }
  };

  const handleEdit = (person) => {
    navigate(`/persons/${person.id}/edit`);
  };

  const handleDelete = async (person) => {
    if (window.confirm(`Deseja realmente excluir ${person.full_name}?`)) {
      try {
        await personsService.remove(person.id);
        enqueueSnackbar('Pessoa excluída com sucesso', { variant: 'success' });
        fetchPersons();
      } catch (error) {
        console.error('Error deleting person:', error);
        enqueueSnackbar('Erro ao excluir pessoa', { variant: 'error' });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Pessoas
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => setImportCnpjOpen(true)}
            sx={{
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
              },
              transition: 'transform 0.2s',
            }}
          >
            Importar CNPJ
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/persons/new')}
            sx={{
              fontWeight: 600,
              '&:hover': {
                transform: 'translateY(-2px)',
              },
              transition: 'transform 0.2s',
            }}
          >
            Nova Pessoa
          </Button>
        </Stack>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} key="search">
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} key="type">
            <TextField
              fullWidth
              size="small"
              select
              label="Tipo"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="PF">Pessoa Física</MenuItem>
              <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={40}>Tipo</TableCell>
              <TableCell width={80}>ID</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'full_name'}
                  direction={orderDirection.toLowerCase()}
                  onClick={() => handleSort('full_name')}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell>Nome Fantasia</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Contatos</TableCell>
              <TableCell>Data Nasc.</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {persons.map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Importação de CNPJ */}
      <ImportCnpjDialog
        open={importCnpjOpen}
        onClose={() => setImportCnpjOpen(false)}
        onSuccess={() => {
          setImportCnpjOpen(false);
          fetchPersons(); // Recarrega a lista
        }}
      />
    </Box>
  );
};

export default Persons;
