import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import AssetRegistration from './components/AssetRegistration';
import AssetQuery from './components/AssetQuery';
import AssetTransfer from './components/AssetTransfer';
import ProductJourney from './components/ProductJourney';
import AssetStatusUpdate from './components/AssetStatusUpdate';
import AssetVerification from './components/AssetVerification';
import AssetCertification from './components/AssetCertification';

const PERMISSIONS = {
  superuser: ['register', 'query', 'transfer', 'journey', 'status', 'verify', 'certify'],
  manufacturer: ['register', 'query', 'transfer', 'journey', 'status'],
  distributor: ['query', 'transfer', 'journey', 'status', 'verify'],
  retailer: ['query', 'transfer', 'verify'],
  auditor: ['query', 'journey', 'verify', 'certify']
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('query');
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (token && userRole && username) {
      setIsLoggedIn(true);
      setUser({ username, role: userRole });
      // Set initial tab based on role permissions
      const defaultTab = PERMISSIONS[userRole]?.[0] || 'query';
      setActiveTab(defaultTab);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    const defaultTab = PERMISSIONS[userData.role]?.[0] || 'query';
    setActiveTab(defaultTab);
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
    setActiveTab('query');
  };

  const hasPermission = (action) => {
    return PERMISSIONS[user?.role]?.includes(action) || false;
  };

  const handleAssetRegistered = (assetId) => {
    setSelectedAssetId(assetId);
    if (hasPermission('journey')) {
      setActiveTab('journey');
    }
  };

  const handleAssetQueried = (assetId) => {
    setSelectedAssetId(assetId);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const canRegister = hasPermission('register');
  const canQuery = hasPermission('query');
  const canTransfer = hasPermission('transfer');
  const canViewJourney = hasPermission('journey');
  const canUpdateStatus = hasPermission('status');
  const canVerify = hasPermission('verify');
  const canCertify = hasPermission('certify');

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
            📝 Register Asset
          </button>
        )}
        {canQuery && (
          <button
            className={activeTab === 'query' ? 'active' : ''}
            onClick={() => setActiveTab('query')}
          >
            🔍 Query Asset
          </button>
        )}
        {canUpdateStatus && (
          <button
            className={activeTab === 'status' ? 'active' : ''}
            onClick={() => setActiveTab('status')}
          >
            📊 Update Status
          </button>
        )}
        {canTransfer && (
          <button
            className={activeTab === 'transfer' ? 'active' : ''}
            onClick={() => setActiveTab('transfer')}
          >
            🔄 Transfer Asset
          </button>
        )}
        {canViewJourney && (
          <button
            className={activeTab === 'journey' ? 'active' : ''}
            onClick={() => setActiveTab('journey')}
          >
            🗺️ Product Journey
          </button>
        )}
        {canVerify && (
          <button
            className={activeTab === 'verify' ? 'active' : ''}
            onClick={() => setActiveTab('verify')}
          >
            ✓ Verify Asset
          </button>
        )}
        {canCertify && (
          <button
            className={activeTab === 'certify' ? 'active' : ''}
            onClick={() => setActiveTab('certify')}
          >
            🏆 Certifications
          </button>
        )}
      </nav>

      <main className="App-main">
        {canRegister && activeTab === 'register' && (
          <AssetRegistration onAssetRegistered={handleAssetRegistered} />
        )}
        {canQuery && activeTab === 'query' && (
          <AssetQuery onAssetQueried={handleAssetQueried} />
        )}
        {canUpdateStatus && activeTab === 'status' && (
          <AssetStatusUpdate assetId={selectedAssetId} onStatusUpdated={(id, status) => setSelectedAssetId(id)} />
        )}
        {canTransfer && activeTab === 'transfer' && (
          <AssetTransfer assetId={selectedAssetId} onTransferComplete={(id, newOwner) => setSelectedAssetId(id)} />
        )}
        {canViewJourney && activeTab === 'journey' && (
          <ProductJourney assetId={selectedAssetId} />
        )}
        {canVerify && activeTab === 'verify' && (
          <AssetVerification assetId={selectedAssetId} onVerificationComplete={(id) => setSelectedAssetId(id)} />
        )}
        {canCertify && activeTab === 'certify' && (
          <AssetCertification assetId={selectedAssetId} userRole={user.role} onCertificationIssued={(id, certType) => setSelectedAssetId(id)} />
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