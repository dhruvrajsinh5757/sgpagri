import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import FarmerDashboard from './components/FarmerDashboard';
import AgroDashboard from './components/AgroDashboard';
import Marketplace from './components/Marketplace';
import MyOrders from './components/MyOrders';
import Settings from './components/Settings';
import './App.css';
import './theme.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="/agro-dashboard" element={<AgroDashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App; 