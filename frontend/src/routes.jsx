import { Navigate, useRoutes, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Home from './pages/Home';
import Movements from './pages/Movements';
import Receivables from './pages/Receivables';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = ({ darkMode, setDarkMode }) => {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Dashboard darkMode={darkMode} setDarkMode={setDarkMode} /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="movements" element={<Movements />} />
        <Route path="receivables" element={<Receivables />} />
      </Route>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    </Routes>
  );
};

export default AppRoutes;
