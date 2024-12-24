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
  ListItemButton,
  Collapse,
  Tooltip,
  CssBaseline,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  LocalAtm as LocalAtmIcon,
  AccountBox as AccountBoxIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import Logo from './Logo';
import { useSnackbar } from 'notistack';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  
  const drawerWidth = 240;
  const collapsedDrawerWidth = 72;

  const [openDrawer, setOpenDrawer] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({});

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleSubMenuToggle = (menuId) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
    enqueueSnackbar('Logout realizado com sucesso!', { variant: 'success' });
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
      icon: <AccountBalanceWalletIcon />,
      subItems: [
        {
          title: 'Movimentações',
          path: '/movements',
          icon: <AttachMoneyIcon />,
        },
        {
          title: 'Recebíveis',
          path: '/receivables',
          icon: <LocalAtmIcon />,
        },
      ],
    },
    {
      id: 'register',
      title: 'Cadastros',
      icon: <AssignmentIcon />,
      subItems: [
        {
          title: 'Pessoas',
          path: '/persons',
          icon: <PeopleIcon />,
        },
        {
          title: 'Categorias',
          path: '/categories',
          icon: <CategoryIcon />,
        },
        {
          title: 'Contas',
          path: '/accounts',
          icon: <AccountBalanceIcon />,
        },
      ],
    },
    {
      id: 'system',
      title: 'Sistema',
      icon: <SettingsIcon />,
      subItems: [
        {
          title: 'Status',
          path: '/system/status',
          icon: <HealthAndSafetyIcon />,
        },
      ],
    },
  ];

  const renderMenuItem = (item) => {
    const isSelected = location.pathname === item.path;
    const hasSubItems = item.subItems?.length > 0;
    const isSubMenuOpen = openSubMenus[item.id];

    return (
      <Box key={item.id}>
        <ListItemButton
          onClick={() => {
            if (hasSubItems) {
              handleSubMenuToggle(item.id);
            } else {
              navigate(item.path);
            }
          }}
          selected={isSelected}
          sx={{
            minHeight: 48,
            justifyContent: openDrawer ? 'initial' : 'center',
            px: 2.5,
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            },
          }}
        >
          <Tooltip title={!openDrawer ? item.title : ''} placement="right">
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: openDrawer ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
          </Tooltip>
          {openDrawer && (
            <>
              <ListItemText 
                primary={item.title}
                sx={{
                  opacity: openDrawer ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: isSelected ? 600 : 400,
                  },
                }}
              />
              {hasSubItems && (isSubMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
            </>
          )}
        </ListItemButton>
        {hasSubItems && (
          <Collapse in={openDrawer && isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => (
                <ListItemButton
                  key={subItem.path}
                  onClick={() => navigate(subItem.path)}
                  selected={location.pathname === subItem.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: openDrawer ? 'initial' : 'center',
                    pl: openDrawer ? 4 : 2.5,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                  }}
                >
                  <Tooltip title={!openDrawer ? subItem.title : ''} placement="right">
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: openDrawer ? 2 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {subItem.icon}
                    </ListItemIcon>
                  </Tooltip>
                  {openDrawer && (
                    <ListItemText
                      primary={subItem.title}
                      sx={{
                        opacity: openDrawer ? 1 : 0,
                        '& .MuiTypography-root': {
                          fontWeight: location.pathname === subItem.path ? 600 : 400,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: openDrawer ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)`,
          marginLeft: openDrawer ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>W</Avatar>
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle2" color="text.primary">
                Wanderley Pinheiro
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bem-vindo de volta
              </Typography>
            </Box>
          </Box>

          <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          '& .MuiDrawer-paper': {
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: openDrawer ? drawerWidth : collapsedDrawerWidth,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            boxSizing: 'border-box',
            ...(!openDrawer && {
              overflowX: 'hidden',
              width: collapsedDrawerWidth,
            }),
          },
        }}
        open={openDrawer}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: openDrawer ? 'space-between' : 'center',
            px: [1],
          }}
        >
          {openDrawer ? (
            <>
              <Logo size="medium" />
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeftIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        <Divider />
        <List component="nav" sx={{ px: 1 }}>
          {menuItems.map(renderMenuItem)}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          minHeight: '100vh',
          marginLeft: openDrawer ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          width: openDrawer ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          pt: 8,
          px: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
