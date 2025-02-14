import React, { useState, useEffect } from 'react';
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
import api from './services/api';
import { QueryProvider } from './providers/QueryProvider';

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
import Receivables from './pages/Receivables';

// Importações adicionais
import NewMovementExpress from './pages/NewMovementExpress';
import NewMovementDetailed from './pages/NewMovementDetailed';

// Importações de contratos
import Contracts from './modules/contracts/pages/ContractsPage';
import ContractBillingPage from './modules/contracts/pages/ContractBillingPage';
import ContractsPage from './modules/contracts/pages/ContractsPage';
import ContractFormPage from './modules/contracts/pages/ContractFormPage';

// Componentes
import AIChat from './components/AIChat';
import { AIAssistant } from './components/AIAssistant';
import { AppVersion } from './components/AppVersion';
import ConnectionErrorPage from './components/ConnectionErrorPage';

// Importação do componente PaymentMethods
import PaymentMethods from './pages/PaymentMethods';
import PaymentMethodForm from './pages/PaymentMethodForm';

// Importação do componente TaskMonitoring
import TaskMonitoring from './pages/TaskMonitoring';
import ChatList from './pages/ChatList';

// Rotas Protegidas
const PrivateRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('PrivateRoute - Autenticado:', isAuthenticated);
  
  return isAuthenticated 
    ? <Outlet /> 
    : <Navigate to="/login" replace />;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [connectionError, setConnectionError] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.message === 'Network Error' || error.code === 'ERR_CONNECTION_REFUSED') {
          setConnectionError(true);
        }
        return Promise.reject(error);
      }
    );

    // Limpar interceptor ao desmontar
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleReconnect = () => {
    setConnectionError(false);
    window.location.reload();
  };

  if (connectionError) {
    return <ConnectionErrorPage onReconnect={handleReconnect} />;
  }

  console.log('Renderizando App - Autenticado:', authService.isAuthenticated());

  return (
    <QueryProvider>
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
              {/* Rota pública - Login */}
              <Route path="/login" element={<Login />} />

              {/* Página inicial - Totalmente independente */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />

              {/* Chat - Sistema Independente */}
              <Route element={<PrivateRoute />}>
                <Route path="/chat" element={<ChatList />} />
              </Route>

              {/* Sistema Financeiro - Com Dashboard */}
              <Route element={<PrivateRoute />}>
                <Route element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />}>
                  <Route path="/finance" element={<Movements />} />
                  <Route path="/finance/movements" element={<Movements />} />
                  <Route path="/finance/movements/new-express" element={<NewMovementExpress />} />
                  <Route path="/finance/movements/new/express" element={<NewMovementExpress />} />
                  <Route path="/finance/receivables" element={<Receivables />} />
                  <Route path="/finance/contacts" element={<Contacts />} />
                  
                  {/* Rotas de Pessoas */}
                  <Route path="/finance/persons" element={<Persons />} />
                  <Route path="/finance/persons/new" element={<PersonForm />} />
                  <Route path="/finance/persons/:id/edit" element={<PersonForm />} />
                  <Route path="/finance/persons/import-cnpj" element={<ImportCNPJ />} />
                  
                  <Route path="/finance/payment-methods" element={<PaymentMethods />} />
                  <Route path="/finance/payment-methods/new" element={<PaymentMethodForm />} />
                  <Route path="/finance/payment-methods/:id/edit" element={<PaymentMethodForm />} />
                  <Route path="/finance/tasks" element={<TaskMonitoring />} />
                  <Route path="/finance/installments" element={<Installments />} />
                  <Route path="/finance/chat" element={<ChatList />} />
                  
                  {/* Rotas de Contratos */}
                  <Route path="/finance/contracts" element={<ContractsPage />} />
                  <Route path="/finance/contracts/form/:id" element={<ContractFormPage />} />
                  <Route path="/finance/contracts/form" element={<ContractFormPage />} />
                  <Route path="/finance/contracts/billing" element={<ContractBillingPage />} />
                  <Route path="/finance/contracts/:contractId/billing" element={<ContractBillingPage />} />
                  <Route path="/finance/contracts/:contractId/billing/:billingId" element={<ContractBillingPage />} />
                  
                  {/* Rotas de Contratos Recorrentes */}
                  <Route path="/finance/contracts-recurring" element={<ContractsPage />} />
                  <Route path="/finance/contracts-recurring/billing" element={<ContractBillingPage />} />
                  <Route path="/finance/contracts-recurring/:contractId/billing" element={<ContractBillingPage />} />
                  <Route path="/finance/contracts-recurring/:contractId/billing/:billingId" element={<ContractBillingPage />} />
                  <Route path="/finance/contracts-recurring/:contractId/billing/:billingId/:paymentId" element={<ContractBillingPage />} />
                </Route>
              </Route>

              {/* Rota padrão - Redireciona para a página inicial */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
    </QueryProvider>
  );
}

export default App;
