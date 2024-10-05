import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PetDatabase from './components/PetDatabase';
import PetInfoForm from './components/PetInfoForm';
import React from 'react'
import LoginPage from './components/LoginPage';

function App() {
  return (
    <Router>
      <div className="relative w-full h-screen bg-alice-blue">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/database" element={<PetDatabase />} />
          <Route path="/form" element={<PetInfoForm />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;