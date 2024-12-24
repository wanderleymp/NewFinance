import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import personsService from '../services/personsService';

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Dados principais
  const [formData, setFormData] = useState(() => {
    // Se tiver dados importados, use-os
    if (location.state?.importedData) {
      const imported = location.state.importedData;
      return {
        full_name: imported.razao_social || '',
        fantasy_name: imported.nome_fantasia || '',
        birth_date: '',
        person_type: 'PJ',
        active: true
      };
    }
    // Caso contrário, use os valores padrão
    return {
      full_name: '',
      fantasy_name: '',
      birth_date: '',
      person_type: 'PF',
      active: true
    };
  });

  // Dados relacionados
  const [addresses, setAddresses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Formulários de endereço e contato
  const [newAddress, setNewAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const [newContact, setNewContact] = useState({
    type: 'phone',
    contact: '',
    description: '',
    is_main: false
  });

  useEffect(() => {
    if (id) {
      loadPerson();
    }
  }, [id]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const personData = await personsService.getDetailsById(id);
      setFormData({
        full_name: personData.full_name,
        fantasy_name: personData.fantasy_name || '',
        birth_date: personData.birth_date ? format(new Date(personData.birth_date), 'yyyy-MM-dd') : '',
        person_type: personData.person_type,
        active: personData.active
      });

      // Carregar dados relacionados
      const [addressesData, contactsData, documentsData] = await Promise.all([
        personsService.listAddresses(id),
        personsService.listContacts(id),
        personsService.listDocuments(id)
      ]);

      setAddresses(addressesData);
      setContacts(contactsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading person:', error);
      enqueueSnackbar('Erro ao carregar dados da pessoa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await personsService.update(id, formData);
        enqueueSnackbar('Pessoa atualizada com sucesso', { variant: 'success' });
      } else {
        await personsService.create(formData);
        enqueueSnackbar('Pessoa criada com sucesso', { variant: 'success' });
      }
      navigate('/persons');
    } catch (error) {
      console.error('Error saving person:', error);
      enqueueSnackbar('Erro ao salvar pessoa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      await personsService.addAddress(id, newAddress);
      enqueueSnackbar('Endereço adicionado com sucesso', { variant: 'success' });
      setNewAddress({
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: ''
      });
      loadPerson();
    } catch (error) {
      console.error('Error adding address:', error);
      enqueueSnackbar('Erro ao adicionar endereço', { variant: 'error' });
    }
  };

  const handleAddContact = async () => {
    try {
      await personsService.addContact(id, newContact);
      enqueueSnackbar('Contato adicionado com sucesso', { variant: 'success' });
      setNewContact({
        type: 'phone',
        contact: '',
        description: '',
        is_main: false
      });
      loadPerson();
    } catch (error) {
      console.error('Error adding contact:', error);
      enqueueSnackbar('Erro ao adicionar contato', { variant: 'error' });
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      await personsService.removeAddress(addressId);
      enqueueSnackbar('Endereço removido com sucesso', { variant: 'success' });
      loadPerson();
    } catch (error) {
      console.error('Error removing address:', error);
      enqueueSnackbar('Erro ao remover endereço', { variant: 'error' });
    }
  };

  const handleRemoveContact = async (contactId) => {
    try {
      await personsService.removeContact(contactId);
      enqueueSnackbar('Contato removido com sucesso', { variant: 'success' });
      loadPerson();
    } catch (error) {
      console.error('Error removing contact:', error);
      enqueueSnackbar('Erro ao remover contato', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/persons')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="600">
            {id ? 'Editar Pessoa' : 'Nova Pessoa'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          Salvar
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Dados Principais" />
          {id && <Tab label="Endereços" />}
          {id && <Tab label="Contatos" />}
          {id && <Tab label="Documentos" />}
        </Tabs>
      </Paper>

      {/* Conteúdo das Tabs */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome Fantasia"
                  value={formData.fantasy_name}
                  onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Nascimento"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Pessoa"
                  value={formData.person_type}
                  onChange={(e) => setFormData({ ...formData, person_type: e.target.value })}
                >
                  <MenuItem value="PF">Pessoa Física</MenuItem>
                  <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                  }
                  label="Ativo"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && id && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Novo Endereço
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rua"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={newAddress.number}
                    onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    value={newAddress.complement}
                    onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Bairro"
                    value={newAddress.neighborhood}
                    onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Estado"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="CEP"
                    value={newAddress.zip_code}
                    onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddAddress}
                  >
                    Adicionar Endereço
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Endereços Cadastrados
            </Typography>
            <List>
              {addresses.map((address) => (
                <ListItem key={address.id}>
                  <ListItemText
                    primary={`${address.street}, ${address.number}`}
                    secondary={`${address.neighborhood} - ${address.city}/${address.state}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveAddress(address.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && id && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Novo Contato
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo"
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Telefone</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    <MenuItem value="telegram">Telegram</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contato"
                    value={newContact.contact}
                    onChange={(e) => setNewContact({ ...newContact, contact: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={newContact.description}
                    onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newContact.is_main}
                        onChange={(e) => setNewContact({ ...newContact, is_main: e.target.checked })}
                      />
                    }
                    label="Principal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddContact}
                  >
                    Adicionar Contato
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Contatos Cadastrados
            </Typography>
            <List>
              {contacts.map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemText
                    primary={contact.contact}
                    secondary={`${contact.type} - ${contact.description}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemoveContact(contact.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && id && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Documentos
            </Typography>
            <List>
              {documents.map((document) => (
                <ListItem key={document.id}>
                  <ListItemText
                    primary={document.type}
                    secondary={document.number}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PersonForm;
