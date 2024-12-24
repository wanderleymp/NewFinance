import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import personsService from '../services/personsService';

const ImportCnpjDialog = ({ open, onClose, onSuccess }) => {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleCnpjChange = (e) => {
    // Remove tudo que não é número
    const value = e.target.value.replace(/\D/g, '');
    
    // Formata o CNPJ (XX.XXX.XXX/XXXX-XX)
    let formatted = value;
    if (value.length > 2) formatted = value.replace(/^(\d{2})/, '$1.');
    if (value.length > 5) formatted = formatted.replace(/^(\d{2})\.(\d{3})/, '$1.$2.');
    if (value.length > 8) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})/, '$1.$2.$3/');
    if (value.length > 12) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})/, '$1.$2.$3/$4-');
    
    setCnpj(formatted);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      // Remove formatação antes de enviar
      const cleanCnpj = cnpj.replace(/\D/g, '');
      
      // Busca dados do CNPJ
      const response = await personsService.fetchByCnpj(cleanCnpj);
      
      // Prepara os dados para salvar
      const personData = {
        full_name: response.data.razao_social,
        fantasy_name: response.data.nome_fantasia,
        person_type: 'PJ',
        active: true,
        document: cleanCnpj
      };

      // Salva a pessoa
      await personsService.create(personData);
      
      enqueueSnackbar('Pessoa importada com sucesso!', { variant: 'success' });
      onSuccess(); // Não precisa mais passar os dados
      onClose();
    } catch (error) {
      console.error('Error importing CNPJ:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao importar dados do CNPJ',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon color="primary" />
          <Typography>Importar Dados do CNPJ</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img
              src="https://www.gov.br/receitafederal/pt-br/canais_atendimento/chat/logo-receita.png"
              alt="Receita Federal"
              style={{ maxWidth: 200, height: 'auto' }}
            />
          </Box>
          <TextField
            fullWidth
            label="CNPJ"
            value={cnpj}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0000-00"
            inputProps={{ maxLength: 18 }}
            disabled={loading}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Digite o CNPJ da empresa para importar os dados automaticamente da Receita Federal
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={cnpj.replace(/\D/g, '').length !== 14 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Importando...' : 'Importar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportCnpjDialog;
