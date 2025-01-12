import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Drawer as MuiDrawer, 
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  SvgIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  TaskAlt as TaskIcon,
  Brightness7 as Brightness7Icon,
  Brightness4 as Brightness4Icon,
  Notifications as NotificationsIcon,
  ExitToApp as ExitToAppIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  MonetizationOn as MonetizationOnIcon,
  ListAlt as ListAltIcon,
  Contacts as ContactsIcon,
  Category as CategoryIcon,
  Cached as CachedIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation, useOutlet, Outlet } from 'react-router-dom';
import { healthService, authService } from '../services/api';
import Logo from './Logo';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

export default function Dashboard({ darkMode, setDarkMode, children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const outlet = useOutlet();

  console.log('🚨 DIAGNÓSTICO CRÍTICO: VERIFICANDO RENDERIZAÇÃO DO DASHBOARD');
  console.log(`🚨 PATHNAME ATUAL: ${location.pathname}`);
  console.log(`🚨 ROTA ATUAL: ${window.location.href}`);

  const [openDrawer, setOpenDrawer] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({
    name: '',
    username: '',
  });

  const menuItemStyles = {
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.grey[700] 
        : theme.palette.primary.light,
      color: theme.palette.mode === 'dark' 
        ? theme.palette.common.white 
        : theme.palette.primary.contrastText,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.grey[700] 
        : theme.palette.primary.light,
      color: theme.palette.mode === 'dark' 
        ? theme.palette.common.white 
        : theme.palette.primary.contrastText,
    },
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1),
    transition: 'all 0.3s ease',
  };

  const [openSubMenus, setOpenSubMenus] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  console.log('Dashboard - Usuário:', user);
  console.log('Dashboard - Filhos recebidos:', children);

  useEffect(() => {
    console.log('Dashboard - Efeito inicial');
    console.log('Dashboard - Localização atual:', location);
    console.log('Dashboard - Usuário atual:', user);
    
    // Verificar autenticação e navegação
    if (!authService.isAuthenticated()) {
      console.warn('Usuário não autenticado, redirecionando para login');
      navigate('/login');
      return;
    }

    // Log de navegação
    console.log('Dashboard - Rota atual:', location.pathname);
  }, [location, navigate, user]);

  useEffect(() => {
    // Verificar usuário autenticado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Redirecionar para login se não estiver autenticado
      navigate('/login');
    }

    // Carregar notificações
    const fetchNotifications = async () => {
      try {
        // Implementar lógica de busca de notificações
        const fetchedNotifications = []; // Substituir por chamada real à API
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        enqueueSnackbar('Não foi possível carregar notificações', { variant: 'error' });
      }
    };

    fetchNotifications();

    // Verificar status do sistema
    const checkSystemHealth = async () => {
      try {
        await healthService.check();
      } catch (error) {
        console.error('Erro de saúde do sistema:', error);
        enqueueSnackbar('Problemas com o sistema detectados', { variant: 'warning' });
      }
    };

    checkSystemHealth();
  }, [navigate, enqueueSnackbar]);

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      enqueueSnackbar('Erro ao fazer logout', { variant: 'error' });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleClearCache = async () => {
    try {
      await healthService.clearCache();
      enqueueSnackbar('Cache limpo com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      enqueueSnackbar('Erro ao limpar o cache', { variant: 'error' });
    }
    handleSystemMenuClose();
  };

  const handleSubMenuToggle = (itemId) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSystemMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleSystemMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'financial',
      title: 'Financeiro',
      icon: <MonetizationOnIcon />,
      subItems: [
        {
          id: 'movements',
          title: 'Movimentações',
          path: '/movements',
          icon: <PaymentIcon />,
        },
        {
          id: 'installments',
          title: 'Contas a Receber',
          path: '/installments',
          icon: <ReceiptIcon />,
        },
        {
          id: 'payment-methods',
          title: 'Métodos de Pagamento',
          path: '/payment-methods',
          icon: <CreditCardIcon />,
        },
      ],
    },
    {
      id: 'register',
      title: 'Cadastros',
      icon: <ListAltIcon />,
      subItems: [
        {
          id: 'persons',
          title: 'Pessoas',
          path: '/persons',
          icon: <PeopleIcon />,
        },
        {
          id: 'contacts',
          title: 'Contatos',
          path: '/contacts',
          icon: <ContactsIcon />,
        },
        {
          id: 'categories',
          title: 'Categorias',
          path: '/categories',
          icon: <CategoryIcon />,
        },
      ],
    },
    {
      id: 'system',
      title: 'Sistema',
      icon: <SettingsIcon />,
      subItems: [
        {
          id: 'users',
          title: 'Usuários',
          path: '/users',
          icon: <PeopleIcon />,
        },
        {
          id: 'status',
          title: 'Status',
          path: '/system/status',
          icon: <SettingsIcon />,
        },
        {
          id: 'clear-cache',
          title: 'Limpar Cache',
          icon: <CachedIcon />,
          onClick: (e) => handleSystemMenuOpen(e),
        },
      ],
    },
  ];

  const renderMenuItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isSubMenuOpen = openSubMenus[item.id];

    const baseItemStyles = {
      minHeight: 48,
      justifyContent: openDrawer ? 'initial' : 'center',
      px: openDrawer ? 2.5 : 'auto',
      ...menuItemStyles,
    };

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          sx={baseItemStyles}
          selected={!hasSubItems && location.pathname === item.path}
          onClick={(e) => {
            if (hasSubItems) {
              handleSubMenuToggle(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: openDrawer ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.title} 
            sx={{ opacity: openDrawer ? 1 : 0 }} 
          />
          {hasSubItems && (
            openDrawer ? 
              (isSubMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />) : 
              null
          )}
        </ListItemButton>

        {hasSubItems && openDrawer && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => (
                <ListItemButton
                  key={subItem.id}
                  sx={{
                    ...baseItemStyles,
                    pl: 4,
                  }}
                  selected={location.pathname === subItem.path}
                  onClick={(e) => {
                    if (subItem.onClick) {
                      subItem.onClick(e);
                    } else if (subItem.path) {
                      navigate(subItem.path);
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: openDrawer ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={subItem.title} 
                    sx={{ opacity: openDrawer ? 1 : 0 }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  const renderOutlet = () => {
    console.log('🚨 DASHBOARD: Renderizando Outlet');
    console.log('Outlet:', outlet);
    console.log('Children:', children);
    
    // Prioridade: children específicos > outlet > Outlet padrão
    if (children) {
      return children;
    }
    
    if (outlet) {
      return outlet;
    }
    
    return <Outlet />;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        open={openDrawer}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: 1,
          px: 2,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Modo Escuro">
              <IconButton 
                onClick={toggleDarkMode} 
                color="primary"
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            <IconButton
              aria-label="show new notifications"
              color="primary"
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="primary"
            >
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <MuiDrawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          },
        }}
        variant="persistent"
        anchor="left"
        open={openDrawer}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Logo size="medium" />
        </Box>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </MuiDrawer>
      
      <Main open={openDrawer}>
        <DrawerHeader />
        {renderOutlet()}
      </Main>

      <Menu
        id="system-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleSystemMenuClose}
      >
        <MenuItem onClick={handleClearCache}>
          <ListItemIcon>
            <CachedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Limpar Cache</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user.name || user.username || 'Usuário'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </Box>
  );
}
