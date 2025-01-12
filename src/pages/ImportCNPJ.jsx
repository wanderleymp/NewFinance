import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import personsService from '../services/personsService';

const ImportCNPJ = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCNPJChange = (event) => {
    // Remove tudo que não é número
    const value = event.target.value.replace(/\D/g, '');
    setCnpj(value);
  };

  const formatCNPJ = (value) => {
    if (!value) return '';
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    // Formata como CNPJ: 00.000.000/0000-00
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleSearch = async () => {
    if (cnpj.length !== 14) {
      enqueueSnackbar('CNPJ inválido', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      // Faz a importação do CNPJ diretamente
      await personsService.importCNPJ(cnpj);
      enqueueSnackbar('CNPJ importado com sucesso!', { variant: 'success' });
      navigate('/persons');
    } catch (error) {
      console.error('Erro ao importar CNPJ:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Erro ao importar CNPJ',
        { variant: 'error' }
      );
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
            Importar CNPJ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Digite o CNPJ da empresa para importar automaticamente
          </Typography>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{
          maxWidth: 600,
          mx: 'auto',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="CNPJ"
              value={formatCNPJ(cnpj)}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading || cnpj.length !== 14}
                    startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  >
                    Importar
                  </Button>
                ),
              }}
            />

            <Typography variant="body2" color="text.secondary">
              Digite apenas os números do CNPJ da empresa que deseja importar.
              Os dados serão importados automaticamente da Receita Federal.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImportCNPJ;
