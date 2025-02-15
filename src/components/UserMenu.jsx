import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';

import { authService } from '../services/authService';

const UserMenu = ({ 
  userData = {}, 
  setUserData, 
  darkMode, 
  setDarkMode 
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      // Chama o método de logout do serviço de autenticação
      authService.logout();
      
      // Limpa o estado do usuário
      setUserData(null);
      
      // Redireciona para a página de login
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Opcional: mostrar mensagem de erro ao usuário
    } finally {
      handleClose();
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      <IconButton
        size="large"
        aria-label="user menu"
        color="inherit"
        onClick={handleClick}
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {userData?.name || 'Usuário'}
          </Typography>
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleDarkModeToggle}
                color="primary"
              />
            }
            label="Modo Escuro"
          />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
