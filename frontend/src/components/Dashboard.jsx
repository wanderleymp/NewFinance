import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  MonetizationOn as MonetizationOnIcon,
  Cached as CachedIcon,
  ListAlt as ListAltIcon,
  Contacts as ContactsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { healthService } from '../services/api';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [openDrawer, setOpenDrawer] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleSubMenuToggle = (menuId) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleSystemMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleSystemMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleClearCache = async () => {
    try {
      await healthService.clearCache();
      enqueueSnackbar('Cache limpo com sucesso!', { variant: 'success' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      enqueueSnackbar('Erro ao limpar o cache', { variant: 'error' });
    }
    handleSystemMenuClose();
  };

  const menuItems = [
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
      path: '/movements',
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

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={(e) => {
            if (hasSubItems) {
              handleSubMenuToggle(item.id);
            } else if (item.onClick) {
              item.onClick(e);
            } else {
              navigate(item.path);
            }
          }}
          selected={!hasSubItems && location.pathname === item.path}
          sx={{
            minHeight: 48,
            justifyContent: openDrawer ? 'initial' : 'center',
            px: 2.5,
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
          {hasSubItems && openDrawer && (
            isSubMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
          )}
        </ListItemButton>
        {hasSubItems && (
          <Collapse in={isSubMenuOpen && openDrawer} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => (
                <ListItemButton
                  key={subItem.id}
                  onClick={(e) => {
                    if (subItem.onClick) {
                      subItem.onClick(e);
                    } else {
                      navigate(subItem.path);
                    }
                  }}
                  selected={location.pathname === subItem.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: openDrawer ? 'initial' : 'center',
                    px: 2.5,
                    pl: 4,
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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={openDrawer}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              ...(openDrawer && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            App Finance
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={openDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map(renderMenuItem)}
        </List>
      </Drawer>

      <Menu
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}
