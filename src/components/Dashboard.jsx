import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import Logo from './Logo';

const drawerWidth = 280;

const Dashboard = ({ darkMode, setDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Movimentos', icon: <ReceiptIcon />, path: '/movements' },
    { text: 'Contas', icon: <AccountBalanceIcon />, path: '/accounts' },
    { text: 'Cartões', icon: <CreditCardIcon />, path: '/cards' },
    { text: 'Investimentos', icon: <TrendingUpIcon />, path: '/investments' },
    { text: 'Relatórios', icon: <PieChartIcon />, path: '/reports' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Logo size="medium" />
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            component="div"
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: location.pathname === item.path ? 
                alpha(theme.palette.primary.main, 0.08) : 
                'transparent',
              color: location.pathname === item.path ?
                theme.palette.primary.main :
                theme.palette.text.primary,
              '&:hover': {
                bgcolor: location.pathname === item.path ?
                  alpha(theme.palette.primary.main, 0.12) :
                  alpha(theme.palette.primary.main, 0.04),
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
            }}
            key={item.text}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: location.pathname === item.path ?
                  theme.palette.primary.main :
                  'inherit',
                transition: 'color 0.2s ease-in-out',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            width: '100%',
            py: 1,
            mb: 2,
            fontWeight: 600,
          }}
        >
          Nova Transação
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                {JSON.parse(localStorage.getItem('user'))?.username || 'Usuário'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bem-vindo de volta
              </Typography>
            </Box>

            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              color="inherit"
              sx={{ ml: 1 }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {JSON.parse(localStorage.getItem('user'))?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
