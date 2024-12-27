import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Users } from './components/Users';
import { Licenses } from './components/Licenses';
import { Persons } from './components/Persons';
import { PersonForm } from './components/Persons/PersonForm';
import { PaymentMethods } from './components/PaymentMethods';
import { MovementTypes } from './components/MovementTypes';
import { MovementStatuses } from './components/MovementStatuses';
import { Sales } from './components/Sales';
import { SaleForm } from './components/Sales/SaleForm';
import { AccountsReceivable } from './components/AccountsReceivable';
import { Services } from './components/Services';
import { ChatAI } from './components/ChatAI';
import { LoginForm } from './components/Auth/LoginForm';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <Sidebar />
                  <main className="pl-[4.5rem] lg:pl-64 pt-16 transition-[padding] duration-300">
                    <div className="p-6">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/licenses" element={<Licenses />} />
                        <Route path="/persons" element={<Persons />} />
                        <Route path="/persons/new" element={<PersonForm />} />
                        <Route path="/persons/:id/edit" element={<PersonForm />} />
                        <Route path="/payment-methods" element={<PaymentMethods />} />
                        <Route path="/movement-types" element={<MovementTypes />} />
                        <Route path="/movement-statuses" element={<MovementStatuses />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/sales/new" element={<SaleForm />} />
                        <Route path="/sales/edit/:id" element={<SaleForm />} />
                        <Route path="/accounts-receivable" element={<AccountsReceivable />} />
                        <Route path="/services" element={<Services />} />
                      </Routes>
                    </div>
                  </main>
                  <ChatAI />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;