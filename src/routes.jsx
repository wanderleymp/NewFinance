import { Navigate, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Home from './pages/Home';
import Movements from './pages/Movements';
import NewMovement from './pages/NewMovement';
import MovementEdit from './pages/MovementEdit';
import Receivables from './pages/Receivables';
import Persons from './pages/Persons';
import PersonForm from './pages/PersonForm';
import SystemStatus from './pages/SystemStatus';
import ImportCNPJ from './pages/ImportCNPJ';
import Contacts from './pages/Contacts';
import Users from './pages/Users';
import Installments from './pages/Installments';
import ReceiptIcon from '@mui/icons-material/Receipt';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function AppRoutes({ darkMode, setDarkMode }) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="movements" element={<Movements />} />
        <Route path="movements/new" element={<NewMovement />} />
        <Route path="movements/:id" element={<NewMovement />} />
        <Route path="movements/edit/:id" element={<MovementEdit />} />
        <Route path="persons" element={<Persons />} />
        <Route path="persons/new" element={<PersonForm />} />
        <Route path="persons/import-cnpj" element={<ImportCNPJ />} />
        <Route path="persons/:id/edit" element={<PersonForm />} />
        <Route path="receivables" element={<Receivables />} />
        <Route path="system/status" element={<SystemStatus />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="users" element={<Users />} />
        <Route path="installments" element={<Installments />} />
      </Route>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
    </Routes>
  );
}
