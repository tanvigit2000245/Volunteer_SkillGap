import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import AuthPage from './components/auth/AuthPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  );
}
