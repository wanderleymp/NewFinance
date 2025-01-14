import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Drawer, 
  CssBaseline, 
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  AppBar
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
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { healthService, authService } from '../services/api';
import Logo from './Logo';
import { AppVersion } from './AppVersion'; // Adicionar import
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';

const Dashboard = ({ darkMode, setDarkMode, children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const outletContext = useOutletContext() || {}; // Provide a default empty object

  console.log('Dashboard - Pathname atual:', location.pathname);
  console.log('Dashboard - Outlet context:', outletContext);

  const [openDrawer, setOpenDrawer] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [userData, setUserData] = useState({
    id: null,
    name: 'Usuário',
    username: 'usuario',
    email: ''
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  // Mapeamento de rotas para títulos
  const pageTitles = {
    '/': 'Dashboard',
    '/movements': 'Movimentações',
    '/installments': 'Contas a Receber',
    '/persons': 'Pessoas',
    '/contacts': 'Contatos',
    '/categories': 'Categorias',
    '/users': 'Usuários',
    '/system/status': 'Status do Sistema'
  };

  // Determinar título da página baseado na rota atual
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const menuItems = useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
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
  ], []);

  console.log('Dashboard - Pathname atual:', location.pathname);
  console.log('Dashboard - Outlet context:', outletContext);

  const renderMenuItem = (item) => {
    const hasSubitems = item.subItems && item.subItems.length > 0;
    const isSubMenuOpen = openSubMenus[item.id] || false;

    return (
      <React.Fragment key={item.id}>
        <ListItem
          disablePadding
          sx={{
            backgroundColor: location.pathname === item.path 
              ? (darkMode ? theme.palette.grey[700] : theme.palette.primary.light)
              : 'transparent'
          }}
          onClick={() => {
            if (hasSubitems) {
              setOpenSubMenus(prev => ({
                ...prev,
                [item.id]: !prev[item.id]
              }));
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <ListItemButton>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {hasSubitems && (
              isSubMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
            )}
          </ListItemButton>
        </ListItem>

        {hasSubitems && isSubMenuOpen && (
          <List component="div" disablePadding>
            {item.subItems.map((subitem) => (
              <ListItem
                key={subitem.id}
                disablePadding
                sx={{
                  backgroundColor: location.pathname === subitem.path 
                    ? (darkMode ? theme.palette.grey[700] : theme.palette.primary.light)
                    : 'transparent'
                }}
                onClick={() => navigate(subitem.path)}
              >
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>{subitem.icon}</ListItemIcon>
                  <ListItemText primary={subitem.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </React.Fragment>
    );
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log('Dashboard - Usuário recuperado:', user);
        
        if (user && user.id) {
          setUserData(user);
        } else {
          console.warn('Usuário inválido, redirecionando para login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Erro crítico na autenticação:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    // Verificar autenticação e navegação
    if (!authService.isAuthenticated()) {
      console.warn('Usuário não autenticado, redirecionando para login');
      navigate('/login');
      return;
    }
  }, [location, navigate]);

  useEffect(() => {
    console.error('🚨 DIAGNÓSTICO CRÍTICO: Dashboard - Verificando contexto de Outlet', {
      location: location,
      pathname: location.pathname,
      children: children,
      outletContext: outletContext,
    });

    // Log detalhado de children
    if (children) {
      console.error('🚨 DIAGNÓSTICO CRÍTICO: Detalhes de children', {
        type: children.type?.name,
        props: children.props
      });
    }
  }, [location, children, outletContext]);

  useEffect(() => {
    // Verificar usuário autenticado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserData(currentUser);
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

  useEffect(() => {
    // Sincronizar submenu com rota atual
    const currentPath = location.pathname;
    const updatedOpenSubMenus = {};

    menuItems.forEach(item => {
      if (item.subItems) {
        const matchingSubItem = item.subItems.find(subItem => 
          currentPath.startsWith(subItem.path)
        );
        
        if (matchingSubItem) {
          updatedOpenSubMenus[item.id] = true;
        }
      }
    });

    setOpenSubMenus(prev => ({
      ...prev,
      ...updatedOpenSubMenus
    }));
  }, [location.pathname, menuItems]);

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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${openDrawer ? 240 : 73}px)`,
          ml: `${openDrawer ? 240 : 73}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setOpenDrawer(!openDrawer)}
            sx={{ marginRight: 5 }}
          >
            {openDrawer ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          
          {/* Componentes de cabeçalho */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsMenu notifications={notifications} />
            <UserMenu 
              userData={userData} 
              setUserData={setUserData} 
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: openDrawer ? 240 : 73,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: openDrawer ? 240 : 73, 
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            position: 'relative'  
          },
        }}
      >
        <Toolbar>
          <IconButton onClick={() => setOpenDrawer(!openDrawer)}>
            {openDrawer ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map(renderMenuItem)}
        </List>
        <AppVersion />  
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: `calc(100% - ${openDrawer ? 240 : 73}px)`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {/* Renderização do Outlet */}
        <Outlet context={{ 
          userData, 
          setUserData, 
          notifications, 
          setNotifications,
          ...outletContext 
        }} />
      </Box>
    </Box>
  );
};

export default Dashboard;
