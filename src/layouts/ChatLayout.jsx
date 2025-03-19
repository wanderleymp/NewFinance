import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  ArrowBack,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const drawerWidth = 70; // Menu lateral mais compacto

const ChatLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Contatos', icon: <PeopleIcon />, path: '/chat/contacts' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/chat/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ minHeight: '48px !important' }}>
        <IconButton 
          size="small" 
          sx={{ color: 'primary.main' }}
          onClick={() => navigate('/')}
          title="Voltar para Sistemas"
        >
          <HomeIcon />
        </IconButton>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            component="div"
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              py: 0.5,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Tooltip title={item.text} placement="right">
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>{item.icon}</ListItemIcon>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 1 }}>
        <ListItem
          component="div"
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Tooltip title="Sair" placement="right">
            <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
          </Tooltip>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'background.paper',
          boxShadow: 1,
          minHeight: '56px',
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton
            color="primary"
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
            title="Voltar para Sistemas"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
            Chat
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: drawerWidth, flexShrink: 0 }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: `calc(100% - ${drawerWidth}px)`,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default ChatLayout;
