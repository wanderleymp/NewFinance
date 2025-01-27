import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Alert 
} from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

const ConnectionErrorPage = ({ onReconnect }) => {
  const handleReconnect = () => {
    if (onReconnect) {
      onReconnect();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 10, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <WifiOffIcon 
          sx={{ 
            fontSize: 100, 
            color: 'error.main', 
            mb: 2 
          }} 
        />
        
        <Typography 
          variant="h4" 
          color="text.primary" 
          gutterBottom
        >
          Erro de Conexão
        </Typography>
        
        <Alert 
          severity="error" 
          sx={{ width: '100%', mb: 2 }}
        >
          Não foi possível conectar ao servidor. 
          Verifique sua conexão de internet ou tente novamente mais tarde.
        </Alert>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          align="center"
        >
          O servidor pode estar temporariamente indisponível. 
          Clique no botão abaixo para tentar reconectar.
        </Typography>
        
        <Button
          variant="contained" 
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleReconnect}
          sx={{ mt: 2 }}
        >
          Tentar Reconectar
        </Button>
      </Paper>
    </Container>
  );
};

export default ConnectionErrorPage;
