import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  useTheme,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
  alpha,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock, TrendingUp } from '@mui/icons-material';
import { authService } from '../services/api';
import Logo from '../components/Logo';
import AnimatedBackground from '../components/AnimatedBackground';
import FinanceIcons from '../components/FinanceIcons';
import FinanceIllustration from '../components/FinanceIllustration';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'transparent',
      }}
    >
      <AnimatedBackground />
      
      {/* Background Illustration Esquerda */}
      <Box
        sx={{
          position: 'absolute',
          left: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          display: { xs: 'none', lg: 'block' },
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <FinanceIllustration />
      </Box>

      {/* Background Illustration Direita */}
      <Box
        sx={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          display: { xs: 'none', lg: 'block' },
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <FinanceIllustration />
      </Box>

      <FinanceIcons />

      {/* Login Form */}
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: { xs: '90%', sm: 400 },
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          mx: 2,
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo e ícone */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '16px',
                background: 'linear-gradient(45deg, #2C74B3, #144272)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
                boxShadow: '0 8px 32px rgba(44, 116, 179, 0.3)',
              }}
            >
              <TrendingUp sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight="700"
              sx={{ 
                background: 'linear-gradient(45deg, #2C74B3, #144272)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Agile Finance
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Gerencie suas finanças com inteligência
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome de usuário"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Senha"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #2C74B3, #144272)',
                boxShadow: '0 8px 32px rgba(44, 116, 179, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #205295, #0A2647)',
                },
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
