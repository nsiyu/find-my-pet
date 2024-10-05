import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PetDatabase from './components/PetDatabase';
import PetInfoForm from './components/PetInfoForm';
import React from 'react'
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="relative w-full h-screen bg-alice-blue">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          } />
          <Route path="/database" element={
            <ProtectedRoute>
              <PetDatabase />
            </ProtectedRoute>
          } />
          <Route path="/form" element={
            <ProtectedRoute>
              <PetInfoForm />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;