import React, { useState } from 'react';
import AssetTransfer from './AssetTransfer';

function AssetQuery({ onAssetQueried }) {
  const [assetId, setAssetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState(null);
  const [ipfsData, setIpfsData] = useState(null);
  const [error, setError] = useState('');
  
  const currentUsername = localStorage.getItem('username');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId.trim()) return;

    setLoading(true);
    setError('');
    setAsset(null);
    setIpfsData(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/asset/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setAsset(data.asset);
        
        // Fetch IPFS document if the hash looks like a CID
        if (data.asset.DocumentHash && (data.asset.DocumentHash.startsWith('bafy') || data.asset.DocumentHash.startsWith('Qm'))) {
           try {
              const ipfsResponse = await fetch(`/ipfs/${data.asset.DocumentHash}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
              });
              const ipfsResult = await ipfsResponse.json();
              if (ipfsResponse.ok) {
                 setIpfsData(ipfsResult.metadata);
              }
           } catch (err) {
              console.error('Failed fetching IPFS data', err);
           }
        }

        if (onAssetQueried) {
          onAssetQueried(assetId);
        }
      } else {
        setError(data.error || 'Asset not found');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Query Asset</h2>
      <p>Search for an asset by its ID to view its current details.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="queryAssetId">Asset ID:</label>
          <input
            type="text"
            id="queryAssetId"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Enter asset ID to query"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Query Asset'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {asset && (
        <div className="asset-details">
          <h3>Asset Details</h3>
          <dl>
            <dt>ID:</dt>
            <dd>{asset.ID}</dd>
            <dt>Owner:</dt>
            <dd>{asset.Owner}</dd>
            <dt>Document Hash:</dt>
            <dd>{asset.DocumentHash}</dd>
            <dt>Status:</dt>
            <dd>{asset.Status}</dd>
            <dt>Timestamp:</dt>
            <dd>{asset.Timestamp ? new Date(asset.Timestamp).toLocaleString() : 'N/A'}</dd>
          </dl>

          {ipfsData && (
            <div className="ipfs-details" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Off-Chain Document Details (IPFS)</h4>
              <p style={{ fontSize: '0.9em', color: '#666' }}><strong>CID:</strong> {asset.DocumentHash}</p>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#e0e0e0', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                {JSON.stringify(ipfsData.metadata ? ipfsData.metadata.data : ipfsData.data || ipfsData, null, 2)}
              </pre>
            </div>
          )}

          {asset.Owner === currentUsername && (
            <AssetTransfer 
              assetId={asset.ID}
              onTransferComplete={(id, newOwner) => {
                setAsset({ ...asset, Owner: newOwner });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AssetQuery;