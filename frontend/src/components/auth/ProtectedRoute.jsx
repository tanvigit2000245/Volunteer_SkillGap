import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to /auth but remember where user wanted to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

