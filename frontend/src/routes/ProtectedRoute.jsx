import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute: Ensures the user is logged in before accessing a route.
 * Optionally checks if the user's role is allowed in allowedRoles.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Redirect to auth page with state so user can return after logging in
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If specific roles are required, ensure the user has one of them
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
