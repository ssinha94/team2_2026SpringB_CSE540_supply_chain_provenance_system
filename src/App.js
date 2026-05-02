import React, { useState } from 'react';
import './App.css';
import AssetRegistration from './components/AssetRegistration';
import AssetQuery from './components/AssetQuery';
import ProductJourney from './components/ProductJourney';

function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const handleAssetRegistered = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab('journey');
  };

  const handleAssetQueried = (assetId) => {
    setSelectedAssetId(assetId);
    setActiveTab('journey');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Supply Chain Provenance System</h1>
        <p>Track and verify product journey through the supply chain</p>
      </header>

      <nav className="App-nav">
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Register Asset
        </button>
        <button
          className={activeTab === 'query' ? 'active' : ''}
          onClick={() => setActiveTab('query')}
        >
          Query Asset
        </button>
        <button
          className={activeTab === 'journey' ? 'active' : ''}
          onClick={() => setActiveTab('journey')}
        >
          Product Journey
        </button>
      </nav>

      <main className="App-main">
        {activeTab === 'register' && (
          <AssetRegistration onAssetRegistered={handleAssetRegistered} />
        )}
        {activeTab === 'query' && (
          <AssetQuery onAssetQueried={handleAssetQueried} />
        )}
        {activeTab === 'journey' && (
          <ProductJourney assetId={selectedAssetId} />
        )}
      </main>
    </div>
  );
}

export default App;