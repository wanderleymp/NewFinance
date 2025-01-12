import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Switch,
  MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import paymentMethodService from '../services/paymentMethodService';
import accountEntryService from '../services/accountEntryService';
import paymentDocumentTypeService from '../services/paymentDocumentTypeService';
import credentialService from '../services/credentialService';
import bankAccountService from '../services/bankAccountService';

const PaymentMethodForm = () => {
  const [formData, setFormData] = useState({
    method_name: '',
    description: '',
    has_entry: false,
    installment_count: 1,
    days_between_installments: 0,
    first_due_date_days: 1,
    account_entry_id: '',
    payment_document_type_id: '',
    credential_id: '',
    bank_account_id: '',
    active: true
  });

  const [accountEntries, setAccountEntries] = useState([]);
  const [paymentDocumentTypes, setPaymentDocumentTypes] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [
          accountEntriesResponse,
          paymentDocumentTypesResponse,
          credentialsResponse,
          bankAccountsResponse
        ] = await Promise.all([
          accountEntryService.getAll(),
          paymentDocumentTypeService.getAll(),
          credentialService.getAll(),
          bankAccountService.getAll()
        ]);

        setAccountEntries(accountEntriesResponse.data);
        setPaymentDocumentTypes(paymentDocumentTypesResponse.data);
        setCredentials(credentialsResponse.data);
        setBankAccounts(bankAccountsResponse.data);
      } catch (error) {
        toast.error('Erro ao carregar dados relacionados');
      }
    };

    fetchRelatedData();

    if (isEditing) {
      const fetchPaymentMethod = async () => {
        try {
          const response = await paymentMethodService.getById(id);
          setFormData(response);
        } catch (error) {
          toast.error('Erro ao carregar forma de pagamento');
          navigate('/payment-methods');
        }
      };

      fetchPaymentMethod();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await paymentMethodService.update(id, formData);
        toast.success('Forma de pagamento atualizada com sucesso');
      } else {
        await paymentMethodService.create(formData);
        toast.success('Forma de pagamento criada com sucesso');
      }
      navigate('/payment-methods');
    } catch (error) {
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} forma de pagamento`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Editar' : 'Nova'} Forma de Pagamento
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Método"
              name="method_name"
              value={formData.method_name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Descrição"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Entrada de Conta"
              name="account_entry_id"
              value={formData.account_entry_id}
              onChange={handleChange}
              required
            >
              {accountEntries.map((entry) => (
                <MenuItem key={entry.account_entry_id} value={entry.account_entry_id}>
                  {entry.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Tipo de Documento"
              name="payment_document_type_id"
              value={formData.payment_document_type_id}
              onChange={handleChange}
              required
            >
              {paymentDocumentTypes.map((type) => (
                <MenuItem key={type.payment_document_type_id} value={type.payment_document_type_id}>
                  {type.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Número de Parcelas"
              name="installment_count"
              value={formData.installment_count}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Dias entre Parcelas"
              name="days_between_installments"
              value={formData.days_between_installments}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Primeiro Vencimento (Dias)"
              name="first_due_date_days"
              value={formData.first_due_date_days}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Credencial"
              name="credential_id"
              value={formData.credential_id}
              onChange={handleChange}
              required
            >
              {credentials.map((credential) => (
                <MenuItem key={credential.credential_id} value={credential.credential_id}>
                  {credential.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Conta Bancária"
              name="bank_account_id"
              value={formData.bank_account_id}
              onChange={handleChange}
              required
            >
              {bankAccounts.map((account) => (
                <MenuItem key={account.bank_account_id} value={account.bank_account_id}>
                  {account.bank_name} - {account.account_number}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_entry}
                  onChange={handleChange}
                  name="has_entry"
                />
              }
              label="Possui Entrada"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate('/payment-methods')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                Salvar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PaymentMethodForm;
