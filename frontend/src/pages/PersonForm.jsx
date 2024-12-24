import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Tabs,
  Tab,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Autocomplete,
  Input,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import personsService from '../services/personsService';

const PersonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 0);

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
        active: true,
      };
    }
    // Se tiver tipo definido no state, use-o
    if (location.state?.personType) {
      return {
        full_name: '',
        fantasy_name: '',
        birth_date: '',
        person_type: location.state.personType,
        active: true,
      };
    }
    // Caso contrário, use os valores padrão
    return {
      full_name: '',
      fantasy_name: '',
      birth_date: '',
      person_type: 'PF',
      active: true,
    };
  });

  // Dados relacionados
  const [addresses, setAddresses] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchContacts, setSearchContacts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showContactList, setShowContactList] = useState(false);

  // Formulários de endereço e contato
  const [newAddress, setNewAddress] = useState({
    postal_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [editingAddress, setEditingAddress] = useState(null);

  // Estado inicial do contato
  const [newContact, setNewContact] = useState({
    type: 'email',
    contact: '',
    description: '',
    is_main: false,
    contact_id: null
  });

  const [editingContact, setEditingContact] = useState(null);

  const resetAddressForm = () => {
    setNewAddress({
      postal_code: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    });
    setEditingAddress(null);
  };

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setLoading(true);
          const [personData, contactsData, addressesData] = await Promise.all([
            personsService.get(id),
            personsService.listContacts({ person_id: id }),
            personsService.listAddresses(id)
          ]);

          // Formatar a data para o formato esperado pelo input
          const formattedDate = personData.birth_date ? 
            new Date(personData.birth_date).toISOString().split('T')[0] : 
            '';

          setFormData({
            full_name: personData.full_name || '',
            fantasy_name: personData.fantasy_name || '',
            birth_date: formattedDate,
            person_type: personData.person_type || 'PF',
            active: personData.active || false
          });

          setContacts(contactsData.items || []);
          setAddresses(addressesData.items || []);
        } catch (error) {
          console.error('Error loading person data:', error);
          enqueueSnackbar('Erro ao carregar dados da pessoa', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      if (id) {
        await personsService.update(id, formData);
        enqueueSnackbar('Pessoa atualizada com sucesso!', { variant: 'success' });
      } else {
        await personsService.create(formData);
        enqueueSnackbar('Pessoa criada com sucesso!', { variant: 'success' });
      }
      navigate('/persons');
    } catch (error) {
      console.error('Error saving person:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao salvar pessoa',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      if (!newContact.contact) {
        enqueueSnackbar('Por favor, preencha o contato', { variant: 'warning' });
        return;
      }

      const contactData = {
        type: newContact.type,
        value: newContact.contact,
        name: newContact.description || null
      };

      // Se tiver contact_id, é um contato existente
      if (newContact.contact_id) {
        contactData.contact_id = newContact.contact_id;
      }

      if (editingContact) {
        await personsService.updateContact(id, editingContact.id, contactData);
        enqueueSnackbar('Contato atualizado com sucesso!', { variant: 'success' });
      } else {
        await personsService.createContact(id, contactData);
        enqueueSnackbar('Contato adicionado com sucesso!', { variant: 'success' });
      }

      // Recarrega a lista de contatos
      const contactsData = await personsService.listContacts(id);
      setContacts(contactsData.items || []);

      // Limpa o formulário
      setNewContact({
        type: 'email',
        contact: '',
        description: '',
        is_main: false,
        contact_id: null
      });
      setSearchText('');
      setEditingContact(null);
    } catch (error) {
      console.error('Error adding/updating contact:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao adicionar/atualizar contato',
        { variant: 'error' }
      );
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await personsService.deleteContact(id, contactId);
      const contactsData = await personsService.listContactsByPerson(id);
      setContacts(contactsData.items || []);
      enqueueSnackbar('Contato excluído com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao excluir contato',
        { variant: 'error' }
      );
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContact({
      type: contact.type.toLowerCase(),
      contact: contact.value,
      description: contact.name || '',
      is_main: contact.is_main || false,
      contact_id: contact.id
    });
    setSearchText(contact.value);
  };

  const handleAddAddress = async () => {
    try {
      if (editingAddress) {
        await personsService.updateAddress(id, editingAddress.id, newAddress);
        enqueueSnackbar('Endereço atualizado com sucesso!', { variant: 'success' });
      } else {
        await personsService.addAddress(id, newAddress);
        enqueueSnackbar('Endereço adicionado com sucesso!', { variant: 'success' });
      }

      const addressesData = await personsService.listAddresses(id);
      setAddresses(addressesData.items || []);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      enqueueSnackbar(
        error.response?.data?.message || `Erro ao ${editingAddress ? 'atualizar' : 'adicionar'} endereço`,
        { variant: 'error' }
      );
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress({
      postal_code: address.postal_code || '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
    });
  };

  const handleCancelEdit = () => {
    resetAddressForm();
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setNewAddress({ ...newAddress, postal_code: cep });

    if (cep.length === 8) {
      // TODO: Implementar consulta de CEP
      // const address = await consultaCep(cep);
      // if (address) {
      //   setNewAddress(prev => ({
      //     ...prev,
      //     street: address.logradouro,
      //     neighborhood: address.bairro,
      //     city: address.localidade,
      //     state: address.uf,
      //   }));
      // }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await personsService.deleteAddress(id, addressId);
      const addressesData = await personsService.listAddresses(id);
      setAddresses(addressesData.items || []);
      enqueueSnackbar('Endereço excluído com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting address:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao excluir endereço',
        { variant: 'error' }
      );
    }
  };

  const handleSearchContacts = async (search) => {
    try {
      setSearchText(search);
      setSearchLoading(true);
      if (!search) {
        setSearchContacts([]);
        setShowContactList(false);
        return;
      }

      const response = await personsService.searchContacts({ search });
      setSearchContacts(response.items || []);
      setShowContactList(true);
    } catch (error) {
      console.error('Error searching contacts:', error);
      setSearchContacts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleContactSelect = (selectedContact) => {
    if (selectedContact) {
      setNewContact({
        type: selectedContact.type.toLowerCase(),
        contact: selectedContact.value,
        description: selectedContact.name || '',
        is_main: false,
        contact_id: selectedContact.id
      });
      setSearchText(selectedContact.value);
    }
    setShowContactList(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [personData, contactsData, addressesData] = await Promise.all([
        personsService.get(id),
        personsService.listContacts({ person_id: id }),
        personsService.listAddresses(id)
      ]);

      // Formatar a data para o formato esperado pelo input
      const formattedDate = personData.birth_date ? 
        new Date(personData.birth_date).toISOString().split('T')[0] : 
        '';

      setFormData({
        full_name: personData.full_name || '',
        fantasy_name: personData.fantasy_name || '',
        birth_date: formattedDate,
        person_type: personData.person_type || 'PF',
        active: personData.active || false
      });

      setContacts(contactsData.items || []);
      setAddresses(addressesData.items || []);
    } catch (error) {
      console.error('Error loading person data:', error);
      enqueueSnackbar('Erro ao carregar dados da pessoa', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/persons')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            {id ? 'Editar Pessoa' : 'Nova Pessoa'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {id ? 'Atualize os dados da pessoa' : 'Preencha os dados para criar uma nova pessoa'}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Dados Principais" />
          <Tab label="Contatos" />
          <Tab label="Endereços" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome Completo / Razão Social"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nome Fantasia"
                    value={formData.fantasy_name}
                    onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data de Nascimento / Fundação"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Tipo de Pessoa"
                    value={formData.person_type}
                    onChange={(e) => setFormData({ ...formData, person_type: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="PF">Pessoa Física</MenuItem>
                    <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.active || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      />
                    }
                    label="Ativo"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button type="button" onClick={() => navigate('/persons')}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      Salvar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Adicionar Contato
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={newContact.type}
                      onChange={(e) =>
                        setNewContact({ ...newContact, type: e.target.value })
                      }
                      label="Tipo"
                    >
                      <MenuItem value="email">E-mail</MenuItem>
                      <MenuItem value="phone">Telefone</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <TextField
                      fullWidth
                      label="Contato"
                      value={searchText}
                      onChange={(e) => handleSearchContacts(e.target.value)}
                      InputProps={{
                        endAdornment: searchText && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSearchText('');
                                setSearchContacts([]);
                                setShowContactList(false);
                                setNewContact({
                                  ...newContact,
                                  contact: '',
                                  description: '',
                                  contact_id: null,
                                });
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {showContactList && searchContacts.length > 0 && (
                      <Paper
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          mt: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        <List>
                          {searchContacts.map((contact) => (
                            <ListItem
                              key={contact.id}
                              button
                              onClick={() => handleContactSelect(contact)}
                            >
                              <ListItemText
                                primary={contact.value}
                                secondary={contact.name}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Nome do Contato"
                    value={newContact.description}
                    onChange={(e) =>
                      setNewContact({ ...newContact, description: e.target.value })
                    }
                    sx={{ mt: 2 }}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddContact}
                      disabled={!searchText}
                    >
                      {editingContact ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    {editingContact && (
                      <Button
                        onClick={() => {
                          setEditingContact(null);
                          setNewContact({
                            type: 'email',
                            contact: '',
                            description: '',
                            is_main: false,
                            contact_id: null,
                          });
                          setSearchText('');
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contatos
                </Typography>
                {contacts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Typography variant="body1">
                                {contact.value}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {contact.name || 'Sem nome'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {contact.type.toUpperCase()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() => handleEditContact(contact)}
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteContact(contact.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Nenhum contato cadastrado
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {editingAddress ? 'Editar Endereço' : 'Adicionar Endereço'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="CEP"
                      value={newAddress.postal_code}
                      onChange={handleCepChange}
                      fullWidth
                      inputProps={{ maxLength: 8 }}
                      placeholder="Somente números"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rua"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Número"
                      value={newAddress.number}
                      onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Complemento"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Bairro"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Cidade"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Estado"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Button
                      variant="contained"
                      onClick={handleAddAddress}
                      disabled={!newAddress.street || !newAddress.number}
                      sx={{ height: '100%', mr: 1 }}
                      fullWidth
                    >
                      {editingAddress ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </Grid>
                  {editingAddress && (
                    <Grid item xs={12} sm={5}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        sx={{ height: '100%' }}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Endereços
                </Typography>
                {addresses.length > 0 ? (
                  <List>
                    {addresses.map((address, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <>
                            <IconButton edge="end" onClick={() => handleEditAddress(address)} sx={{ mr: 1 }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteAddress(address.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        }
                      >
                        <ListItemText
                          primary={`${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}`}
                          secondary={`${address.neighborhood} - ${address.city}/${address.state} - CEP: ${address.postal_code || 'Não informado'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Nenhum endereço cadastrado
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PersonForm;
