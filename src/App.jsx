import React, { useState } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { lightTheme, darkTheme } from './theme/theme';
import { authService } from './services/api';

// Páginas
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import Movements from './pages/Movements';
import Persons from './pages/Persons';
import Contacts from './pages/Contacts';
import Users from './pages/Users';
import SystemStatus from './pages/SystemStatus';
import Installments from './pages/Installments';
import PersonForm from './pages/PersonForm';
import ImportCNPJ from './pages/ImportCNPJ';

// Componentes
import AIChat from './components/AIChat';
import { AIAssistant } from './components/AIAssistant';
import { AppVersion } from './components/AppVersion';

// Rotas Protegidas
const PrivateRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('PrivateRoute - Autenticado:', isAuthenticated);
  
  return isAuthenticated 
    ? <Outlet /> 
    : <Navigate to="/login" replace />;
};

function AppRoutes({ darkMode, setDarkMode }) {
  return <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const theme = darkMode ? darkTheme : lightTheme;

  console.log('Renderizando App - Autenticado:', authService.isAuthenticated());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<AppRoutes darkMode={darkMode} setDarkMode={setDarkMode} />}>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                <Route index path="home" element={<Home />} />
                <Route path="movements" element={<Movements />} />
                <Route path="persons" element={<Persons />} />
                <Route path="persons/new" element={<PersonForm />} />
                <Route path="persons/:id/edit" element={<PersonForm />} />
                <Route path="persons/import-cnpj" element={<ImportCNPJ />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="users" element={<Users />} />
                <Route path="system-status" element={<SystemStatus />} />
                <Route path="installments" element={<Installments />} />
              </Route>
            </Route>
          </Routes>
          <AIAssistant />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AppVersion />
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
