import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AssetRegistration from './components/AssetRegistration';
import AssetQuery from './components/AssetQuery';
import ProductJourney from './components/ProductJourney';

const PERMISSIONS = {
  superuser: ['register', 'query', 'journey'],
  manufacturer: ['register', 'query', 'journey'],
  distributor: ['query', 'journey'],
  retailer: ['query'],
  auditor: ['query', 'journey']
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('register');
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (token && userRole && username) {
      setIsLoggedIn(true);
      setUser({ username, role: userRole });
      setActiveTab(PERMISSIONS[userRole]?.[0] || 'register');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setActiveTab(PERMISSIONS[userData.role]?.[0] || 'register');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('register');
  };

  const hasPermission = (action) => {
    return PERMISSIONS[user?.role]?.includes(action) || false;
  };

  const handleAssetRegistered = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab('journey');
  };

  const handleAssetQueried = (assetId) => {
    setSelectedAssetId(assetId);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const canRegister = hasPermission('register');
  const canQuery = hasPermission('query');
  const canViewJourney = hasPermission('journey');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Supply Chain Provenance System</h1>
        <p>Track and verify product journey through the supply chain</p>
      </header>

      <nav className="App-nav">
        {canRegister && (
          <button
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => setActiveTab('register')}
          >
            Register Asset
          </button>
        )}
        {canQuery && (
          <button
            className={activeTab === 'query' ? 'active' : ''}
            onClick={() => setActiveTab('query')}
          >
            Query Asset
          </button>
        )}
        {canViewJourney && (
          <button
            className={activeTab === 'journey' ? 'active' : ''}
            onClick={() => setActiveTab('journey')}
          >
            Product Journey
          </button>
        )}
      </nav>

      <main className="App-main">
        {canRegister && activeTab === 'register' && (
          <AssetRegistration onAssetRegistered={handleAssetRegistered} />
        )}
        {canQuery && (activeTab === 'query') && (
          <AssetQuery onAssetQueried={handleAssetQueried} />
        )}
        {canViewJourney && (activeTab === 'journey') && (
          <ProductJourney assetId={selectedAssetId} />
        )}
      </main>

      <footer className="App-footer">
        <div className="user-info">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
          <span className="username">{user.username}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </footer>
    </div>
  );
}

export default App;