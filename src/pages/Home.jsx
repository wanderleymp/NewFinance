import React, { useEffect } from 'react';
import { 
  Box, 
  Typography,
  Card,
  CardContent,
  IconButton,
  Container,
  Alert
} from '@mui/material';
import { 
  AccountBalance as FinanceIcon,
  Chat as ChatIcon,
  Person as CRMIcon,
  Assignment as ServiceOrderIcon,
  ListAlt as TaskIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService'; 

const SystemCard = ({ title, description, icon: Icon, route, isDisabled, color }) => {
  const navigate = useNavigate();

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        bgcolor: isDisabled ? '#f5f5f5' : color,
        color: 'white',
        cursor: isDisabled ? 'default' : 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: 3
      }}
      onClick={() => !isDisabled && navigate(route)}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          height: '100%'
        }}>
          <Icon sx={{ fontSize: 48, mb: 2, color: isDisabled ? '#999' : 'white' }} />
          <Typography variant="h6" sx={{ mb: 1, color: isDisabled ? '#666' : 'white' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: isDisabled ? '#888' : 'rgba(255,255,255,0.8)' }}>
            {description}
          </Typography>
        </Box>
        {!isDisabled && (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        )}
        {isDisabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: '#ff9800',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem'
            }}
          >
            Em breve
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const currentUser = authService.getTokenInfo();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  if (!authService.isAuthenticated()) {
    return null; // Previne renderização antes do redirecionamento
  }

  const systems = [
    {
      title: 'Finanças',
      description: 'Gestão financeira completa',
      icon: FinanceIcon,
      route: '/finance',
      color: '#2e7d32'
    },
    {
      title: 'Chat',
      description: 'Comunicação com clientes',
      icon: ChatIcon,
      route: '/chat',
      isDisabled: false,
      color: '#1976d2'
    },
    {
      title: 'CRM',
      description: 'Relacionamento com clientes',
      icon: CRMIcon,
      route: '/crm',
      isDisabled: true,
      color: '#757575'
    },
    {
      title: 'Ordem de Serviço',
      description: 'Controle de serviços',
      icon: ServiceOrderIcon,
      route: '/service-order',
      isDisabled: true,
      color: '#757575'
    },
    {
      title: 'Tarefas',
      description: 'Gerenciamento de tarefas',
      icon: TaskIcon,
      route: '/tasks',
      isDisabled: true,
      color: '#757575'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Seja bem-vindo(a), {currentUser?.username || 'Usuário'}!
          </Typography>
        </Alert>
      </Box>

      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4
        }}
      >
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'primary.main', 
              fontWeight: 'bold', 
              mb: 4 
            }}
          >
            Sistemas
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3
        }}>
          {systems.map((system, index) => (
            <SystemCard
              key={index}
              title={system.title}
              description={system.description}
              icon={system.icon}
              route={system.route}
              isDisabled={system.isDisabled}
              color={system.color}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
