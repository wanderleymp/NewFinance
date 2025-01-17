import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Loading from './pages/Loading';
import Unauthorized from './pages/Unauthorized';
import { Payment as PaymentIcon } from '@mui/icons-material';

// Definição de roles
const ROLES = {
  ADMIN: 'admin',
  FINANCEIRO: 'financeiro',
  CONSULTA: 'consulta'
};

// Lazy load all components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Movements = lazy(() => import('./pages/Movements'));
const NewMovementExpress = lazy(() => import('./pages/NewMovementExpress'));
const NewMovementDetailed = lazy(() => import('./pages/NewMovementDetailed'));
const MovementEdit = lazy(() => import('./pages/MovementEdit'));
const Receivables = lazy(() => import('./pages/Receivables'));
const Persons = lazy(() => import('./pages/Persons'));
const PersonForm = lazy(() => import('./pages/PersonForm'));
const ImportCNPJ = lazy(() => import('./pages/ImportCNPJ'));
const Users = lazy(() => import('./pages/Users'));
const Installments = lazy(() => import('./pages/Installments'));
const Contacts = lazy(() => import('./pages/Contacts'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const PaymentMethodForm = lazy(() => import('./pages/PaymentMethodForm'));
const TaskMonitoring = lazy(() => import('./pages/TaskMonitoring'));

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('Verificando acesso para rota:', {
    path: window.location.pathname,
    user: user.username,
    roles: user.roles,
    requiredRoles,
    timestamp: new Date().toISOString()
  });

  // Verificar se o usuário tem as roles necessárias
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => user.roles?.includes(role));

  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRoles) {
    console.warn('Acesso negado - roles insuficientes:', {
      required: requiredRoles,
      current: user.roles,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Acesso permitido para:', {
    username: user.username,
    roles: user.roles,
    path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  console.log('Verificando rota pública:', {
    path: window.location.pathname,
    isAuthenticated,
    timestamp: new Date().toISOString()
  });

  if (isAuthenticated) {
    console.log('Usuário autenticado tentando acessar rota pública, redirecionando para home', {
      username: JSON.parse(localStorage.getItem('user'))?.username,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
};

const AppRoutes = ({ darkMode, setDarkMode }) => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={
        <PublicRoute>
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        </PublicRoute>
      } />
      <Route path="/unauthorized" element={
        <Suspense fallback={<Loading />}>
          <Unauthorized />
        </Suspense>
      } />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
        <Route path="dashboard" element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
        <Route path="movements" element={<Suspense fallback={<Loading />}><Movements /></Suspense>} />
        <Route path="movements/new" element={<Suspense fallback={<Loading />}><NewMovementExpress /></Suspense>} />
        <Route path="movements/:id" element={<Suspense fallback={<Loading />}><NewMovementExpress /></Suspense>} />
        <Route path="movements/edit/:id" element={<Suspense fallback={<Loading />}><MovementEdit /></Suspense>} />
        <Route path="movements/new-express" element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              {console.log('🚨 DEBUG: Renderizando rota de movimento express', window.location.pathname)}
              <NewMovementExpress />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="movements/new-detailed" element={<Suspense fallback={<Loading />}><NewMovementDetailed /></Suspense>} />
        <Route path="persons" element={<Suspense fallback={<Loading />}><Persons /></Suspense>} />
        <Route path="persons/new" element={<Suspense fallback={<Loading />}><PersonForm /></Suspense>} />
        <Route path="persons/import-cnpj" element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              {console.log('🚨 ROUTES: Renderizando ImportCNPJ', window.location.pathname)}
              <ImportCNPJ />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="persons/:id/edit" element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              {console.log('🚨 DEBUG: Renderizando rota de edição de pessoa', window.location.pathname)}
              <PersonForm />
            </Suspense>
          </PrivateRoute>
        } />
        {/* Rotas administrativas */}
        <Route path="users" element={
          <PrivateRoute requiredRoles={[ROLES.ADMIN]}>
            <Suspense fallback={<Loading />}>
              <Users />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="installments" element={
          <Suspense fallback={<Loading />}>
            {console.log('🚨 ROUTES: Renderizando Installments')}
            {console.log('🚨 ROUTES: Contexto de renderização', {
              pathname: window.location.pathname,
              href: window.location.href,
              search: window.location.search
            })}
            <Installments />
          </Suspense>
        } />
        <Route path="receivables" element={<Suspense fallback={<Loading />}><Receivables /></Suspense>} />
        {/* Rotas de monitoramento */}
        <Route path="system/status" element={
          <PrivateRoute requiredRoles={[ROLES.ADMIN]}>
            <Suspense fallback={<Loading />}>
              <SystemStatus />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="contacts" element={<Suspense fallback={<Loading />}><Contacts /></Suspense>} />
        <Route path="payment-methods" element={<Suspense fallback={<Loading />}><PaymentMethods /></Suspense>} />
        <Route path="payment-methods/new" element={<Suspense fallback={<Loading />}><PaymentMethodForm /></Suspense>} />
        <Route path="payment-methods/:id/edit" element={<Suspense fallback={<Loading />}><PaymentMethodForm /></Suspense>} />
        <Route path="tasks" element={<Suspense fallback={<Loading />}><TaskMonitoring /></Suspense>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
