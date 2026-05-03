import React, { useState, useEffect } from 'react';

function AssetTransfer({ assetId, onTransferComplete }) {
  const [userAssets, setUserAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || '');
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentUsername = localStorage.getItem('username');

  // Fetch assets owned by current user on component mount
  useEffect(() => {
    fetchUserAssets();
  }, []);

  // Update selectedAssetId if assetId prop changes
  useEffect(() => {
    if (assetId && assetId !== selectedAssetId) {
      setSelectedAssetId(assetId);
    }
  }, [assetId]);

  const fetchUserAssets = async () => {
    setLoadingAssets(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/assets/owner', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUserAssets(data.assets || []);
        if (data.assets && data.assets.length === 0) {
          setError('You do not own any assets that can be transferred.');
        }
      } else {
        setError(data.error || 'Failed to fetch your assets');
      }
    } catch (error) {
      setError('Network error occurred while fetching assets');
      console.error(error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAssetId.trim()) {
      setMessage('❌ Please select an asset to transfer');
      return;
    }

    if (!newOwner.trim()) {
      setMessage('❌ Please enter the new owner username');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/transfer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assetId: selectedAssetId, newOwner })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Asset ${selectedAssetId} transferred to ${newOwner} successfully!`);
        setNewOwner('');
        setSelectedAssetId('');
        
        // Refresh asset list
        await fetchUserAssets();
        
        if (onTransferComplete) {
          onTransferComplete(selectedAssetId, newOwner);
        }
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asset-transfer-container" style={{ padding: '20px', border: '1px solid #4CAF50', borderRadius: '5px', background: '#f9fff9' }}>
      <h2>Transfer Asset</h2>
      <p>Select an asset you own and transfer it to another stakeholder.</p>

      {loadingAssets && (
        <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', color: '#1565c0' }}>
          Loading your assets...
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          {error}
        </div>
      )}

      {userAssets.length > 0 && (
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="assetSelect" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Select Asset to Transfer:
            </label>
            <select
              id="assetSelect"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">-- Choose an asset --</option>
              {userAssets.map(asset => (
                <option key={asset.ID} value={asset.ID}>
                  {asset.ID} (Status: {asset.Status})
                </option>
              ))}
            </select>
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              You own {userAssets.length} asset{userAssets.length !== 1 ? 's' : ''}
            </small>
          </div>

          {selectedAssetId && (
            <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <small style={{ color: '#666' }}>
                <strong>Selected Asset Details:</strong><br />
                ID: {selectedAssetId}<br />
                Status: {userAssets.find(a => a.ID === selectedAssetId)?.Status}
              </small>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label htmlFor="newOwner" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              New Owner Username:
            </label>
            <input
              type="text"
              id="newOwner"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="e.g., josh, zensparx, nicolette"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Enter the username of the stakeholder to receive the asset
            </small>
          </div>

          <button
            type="submit"
            disabled={loading || loadingAssets || userAssets.length === 0}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: (loading || loadingAssets || userAssets.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (loading || loadingAssets || userAssets.length === 0) ? 0.6 : 1
            }}
          >
            {loading ? 'Transferring...' : 'Transfer Asset'}
          </button>

          <button
            type="button"
            onClick={fetchUserAssets}
            disabled={loadingAssets}
            style={{
              marginLeft: '10px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loadingAssets ? 'not-allowed' : 'pointer',
              opacity: loadingAssets ? 0.6 : 1
            }}
          >
            Refresh List
          </button>
        </form>
      )}

      {message && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2e7d32' : '#c62828',
            borderRadius: '4px'
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default AssetTransfer;
