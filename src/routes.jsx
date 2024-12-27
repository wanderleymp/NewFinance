import { Navigate, useRoutes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Home from './pages/Home';
import Movements from './pages/Movements';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

export default function Router({ darkMode, setDarkMode }) {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/login" />,
    },
    {
      path: '/login',
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: '/',
      element: (
        <PrivateRoute>
          <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
        </PrivateRoute>
      ),
      children: [
        { path: 'dashboard', element: <Home /> },
        { path: 'movements', element: <Movements /> },
      ],
    },
  ]);
}
