import React from 'react';
import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <Typography variant="h3" gutterBottom>
        Acesso Negado
      </Typography>
      <Typography variant="body1" paragraph>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate(-1)}
      >
        Voltar
      </Button>
    </div>
  );
};

export default Unauthorized;
