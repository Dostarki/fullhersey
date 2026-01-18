import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage'; // Import DocsPage
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} /> {/* Add Docs Route */}
      </Routes>
    </Router>
  );
}

export default App;
