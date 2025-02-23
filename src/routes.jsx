import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Loading from './pages/Loading';
import Unauthorized from './pages/Unauthorized';
import { Payment as PaymentIcon } from '@mui/icons-material';
import CleanLayout from './layouts/CleanLayout';


// Definindo roles necessárias para NFSe
const NFSE_ROLES = [ROLES.ADMIN, ROLES.FINANCEIRO];

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
const ChatList = lazy(() => import('./pages/ChatList'));
const Movements = lazy(() => import('./pages/Movements'));
const newMovementExpress = lazy(() => import('./pages/NewMovementExpress'));
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
const ContractsPage = lazy(() => import('./modules/contracts/pages/ContractsPage'));
const ContractBillingPage = lazy(() => import('./modules/contracts/pages/ContractBillingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));


const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  console.log('PrivateRoute - Verificando autenticação:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    console.log('PrivateRoute - Redirecionando para login:', window.location.pathname);
    console.log('PrivateRoute - Token de acesso:', localStorage.getItem('accessToken'));
    console.log('PrivateRoute - Usuário autenticado:', JSON.parse(localStorage.getItem('user')));
    return <Navigate to="/login" replace />;
  }

  console.log('Acesso permitido, navegando para:', window.location.pathname);
  console.log('PrivateRoute - Navegando para:', window.location.pathname);
  console.log('PrivateRoute - Rotas disponíveis:', AppRoutes.map(route => route.path));
  console.log('PrivateRoute - Renderizando componente:', children);
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
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

  console.log('Navegando para:', window.location.pathname);

  return (
    <Suspense fallback={<Loading />}>
      {console.log('Navegando para:', window.location.pathname)}
      {children}
    </Suspense>
  );
};

const AppRoutes = ({ darkMode, setDarkMode }) => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route 
        path="/systems" 
        element={
          <CleanLayout>
            <Home />
          </CleanLayout>
        } 
      />
      <Route 
        path="/home" 
        element={
          <CleanLayout>
            <Home />
          </CleanLayout>
        } 
      />
      
      <Route path="/login" element={
        <PublicRoute>
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        </PublicRoute>
      } />

      {/* Rotas do Dashboard */}
      <Route 
        path="/finance"
        element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/finance/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<Loading />}><Movements /></Suspense>} />
        <Route path="movements" element={<Suspense fallback={<Loading />}><Movements /></Suspense>} />
        <Route path="movements/new-express" element={
          <PrivateRoute>
            <Suspense fallback={<Loading />}>
              {console.log('🚨 DEBUG: Renderizando rota de movimento express', window.location.pathname)}
              {console.log('🚨 DEBUG: Rotas disponíveis', AppRoutes.map(route => route.path))}
              <newMovementExpress />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="movements/new" element={<Suspense fallback={<Loading />}><newMovementExpress /></Suspense>} />
        <Route path="movements/:id" element={<Suspense fallback={<Loading />}><newMovementExpress /></Suspense>} />
        <Route path="movements/edit/:id" element={<Suspense fallback={<Loading />}><MovementEdit /></Suspense>} />
        <Route path="movements/new-detailed" element={<Suspense fallback={<Loading />}><NewMovementDetailed /></Suspense>} />
        <Route path="finance/nfse" element={
          <Suspense fallback={<Loading />}>
            <NewNfseList />
          </Suspense>
        } />
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
          <PrivateRoute>
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
          <PrivateRoute>
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
        <Route 
          path="chat" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ChatList />
              </Suspense>
            </PrivateRoute>
          } 
        />

        <Route path="home-page" element={<Suspense fallback={<Loading />}><HomePage /></Suspense>} />
        {/* Rotas de Contratos */}
        <Route 
          path="contracts" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractsPage />
              </Suspense>
            </PrivateRoute>
          } 
        >
          <Route 
            path="dashboard" 
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </PrivateRoute>
            } 
          />
          <Route 
            path="billing" 
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading />}>
                  <ContractBillingPage />
                </Suspense>
              </PrivateRoute>
            } 
          />
          <Route 
            path=":contractId/billing" 
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading />}>
                  <ContractBillingPage />
                </Suspense>
              </PrivateRoute>
            } 
          />
          <Route 
            path=":contractId/billing/:billingId" 
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading />}>
                  <ContractBillingPage />
                </Suspense>
              </PrivateRoute>
            } 
          />
        </Route>
        {/* Rotas de Contratos Recorrentes */}
        <Route 
          path="contracts-recurring" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractsPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/dashboard" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/billing" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractBillingPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/:contractId/billing" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractBillingPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/:contractId/billing/:billingId" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractBillingPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/:contractId/billing/:billingId/:paymentId" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractBillingPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="contracts-recurring/:contractId/billing/:billingId/:paymentId/:receiptId" 
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading />}>
                <ContractBillingPage />
              </Suspense>
            </PrivateRoute>
          } 
        />
      </Route>
      {/* Outras rotas */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default AppRoutes;
