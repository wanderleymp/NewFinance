import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '../pages/Loading';
import Dashboard from '../components/Dashboard';
import PrivateRoute from '../components/PrivateRoute';

// Lazy load components
const HomePage = lazy(() => import('../pages/HomePage'));
const Movements = lazy(() => import('../pages/Movements'));
const NewMovementExpress = lazy(() => import('../pages/NewMovementExpress'));
const NewMovementDetailed = lazy(() => import('../pages/NewMovementDetailed'));
const MovementEdit = lazy(() => import('../pages/MovementEdit'));
const Receivables = lazy(() => import('../pages/Receivables'));
const Persons = lazy(() => import('../pages/Persons'));
const PersonForm = lazy(() => import('../pages/PersonForm'));
const Users = lazy(() => import('../pages/Users'));
const Installments = lazy(() => import('../pages/Installments'));
const SystemStatus = lazy(() => import('../pages/SystemStatus'));

const FinanceRoutes = () => {
  return (
    <PrivateRoute>
      <Dashboard>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="movements" element={<Movements />} />
            <Route path="movements/new/express" element={<NewMovementExpress />} />
            <Route path="movements/new/detailed" element={<NewMovementDetailed />} />
            <Route path="movements/edit/:id" element={<MovementEdit />} />
            <Route path="receivables" element={<Receivables />} />
            <Route path="persons" element={<Persons />} />
            <Route path="persons/new" element={<PersonForm />} />
            <Route path="persons/edit/:id" element={<PersonForm />} />
            <Route path="users" element={<Users />} />
            <Route path="installments" element={<Installments />} />
            <Route path="system" element={<SystemStatus />} />
            <Route path="*" element={<Navigate to="/finance" replace />} />
          </Routes>
        </Suspense>
      </Dashboard>
    </PrivateRoute>
  );
};

export default FinanceRoutes;
