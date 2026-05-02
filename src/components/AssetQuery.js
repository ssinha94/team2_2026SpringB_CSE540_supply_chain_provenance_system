import React, { useState } from 'react';

function AssetQuery({ onAssetQueried }) {
  const [assetId, setAssetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId.trim()) return;

    setLoading(true);
    setError('');
    setAsset(null);

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
        </div>
      )}
    </div>
  );
}

export default AssetQuery;