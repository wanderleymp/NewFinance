import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '../pages/Loading';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const FinanceApp = lazy(() => import('./financeRoutes'));

const MainRoutes = () => {
  return (
    <Routes>
      {/* Página Inicial - Totalmente independente */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<Loading />}>
            <Home />
          </Suspense>
        } 
      />
      
      {/* Login */}
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        } 
      />

      {/* Sistema Financeiro */}
      <Route path="/finance/*" element={<FinanceApp />} />

      {/* Futuros sistemas serão adicionados aqui */}
      {/* <Route path="/crm/*" element={<CRMApp />} /> */}
      {/* <Route path="/chat/*" element={<ChatApp />} /> */}
      
      {/* Redireciona qualquer rota desconhecida para a página inicial */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainRoutes;
