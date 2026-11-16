import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './components/home/HomePage';
import AuthPage from './components/auth/AuthPage';
import AuthenticatedView from './components/dashboard/AuthenticatedView';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedView />
            </ProtectedRoute>
          }
        />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
</Routes>
    </AuthProvider>
  );
}
