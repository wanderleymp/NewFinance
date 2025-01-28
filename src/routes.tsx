import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContractsPage from './modules/contracts/pages/ContractsPage';
import ContractFormPage from './modules/contracts/pages/ContractFormPage';
import ContractBillingPage from './modules/contracts/pages/ContractBillingPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ContractsPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/contract/new" element={<ContractFormPage />} />
      <Route path="/contract/edit/:id" element={<ContractFormPage />} />
      <Route path="/contracts/billing" element={<ContractBillingPage />} />
    </Routes>
  );
};

export default AppRoutes;
