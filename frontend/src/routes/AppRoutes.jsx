import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/home/HomePage';
import AuthPage from '../components/auth/AuthPage';
import AuthenticatedView from '../components/dashboard/AuthenticatedView';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Home Landing Page */}
      <Route path="/" element={<HomePage />} />

      {/* Auth Entry (Login / Register) */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />

      {/* Protected Dashboard (Role-based: Admin, Coordinator, Volunteer) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthenticatedView />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
