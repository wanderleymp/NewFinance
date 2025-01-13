import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Loading from './pages/Loading';
import { Payment as PaymentIcon } from '@mui/icons-material';

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

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  ) : (
    <Navigate to="/login" replace />
  );
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return !isAuthenticated ? (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  ) : (
    <Navigate to="/" replace />
  );
};

const AppRoutes = ({ darkMode, setDarkMode }) => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        </PublicRoute>
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
        <Route path="movements/new-express" element={<Suspense fallback={<Loading />}><NewMovementExpress /></Suspense>} />
        <Route path="movements/new-detailed" element={<Suspense fallback={<Loading />}><NewMovementDetailed /></Suspense>} />
        <Route path="persons" element={<Suspense fallback={<Loading />}><Persons /></Suspense>} />
        <Route path="persons/new" element={<Suspense fallback={<Loading />}><PersonForm /></Suspense>} />
        <Route path="persons/import-cnpj" element={<Suspense fallback={<Loading />}><ImportCNPJ /></Suspense>} />
        <Route path="persons/:id/edit" element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              {console.log('🚨 DEBUG: Renderizando rota de edição de pessoa', window.location.pathname)}
              <PersonForm />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="users" element={<Suspense fallback={<Loading />}><Users /></Suspense>} />
        <Route path="installments" element={
          <Suspense fallback={<Loading />}>
            {console.log('🚨 ROUTES: Renderizando Installments')}
            <Installments />
          </Suspense>
        } />
        <Route path="receivables" element={<Suspense fallback={<Loading />}><Receivables /></Suspense>} />
        <Route path="system/status" element={<Suspense fallback={<Loading />}><SystemStatus /></Suspense>} />
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
