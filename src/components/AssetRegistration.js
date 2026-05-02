import React, { useState } from 'react';

function AssetRegistration({ onAssetRegistered }) {
  const [formData, setFormData] = useState({
    assetId: '',
    documentData: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');

      // 1. Store off-chain data in IPFS first
      const ipfsDataPayload = { metadata: { data: formData.documentData, timestamp: new Date().toISOString() } };
      const ipfsResponse = await fetch('/ipfs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ipfsDataPayload),
      });
      
      const ipfsResult = await ipfsResponse.json();
      if (!ipfsResponse.ok) {
        throw new Error(ipfsResult.error || 'Failed to upload to IPFS');
      }
      
      const docHash = ipfsResult.cid;

      // 2. Register asset with the hash on the blockchain mock
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetId: formData.assetId,
          docHash
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Asset ${formData.assetId} registered successfully!`);
        setFormData({ assetId: '', documentData: '' });
        if (onAssetRegistered) {
          onAssetRegistered(formData.assetId);
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
    <div>
      <h2>Register New Asset</h2>
      <p>Register a new asset in the supply chain with its document hash.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="assetId">Asset ID:</label>
          <input
            type="text"
            id="assetId"
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            placeholder="e.g., ASSET001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="documentData">Document Metadata (Off-Chain):</label>
          <textarea
            id="documentData"
            name="documentData"
            value={formData.documentData}
            onChange={handleChange}
            placeholder="e.g., Bill of Lading, product specifications, condition details..."
            rows="4"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Asset'}
        </button>
      </form>

      {message && (
        <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
    </div>
  );
}

export default AssetRegistration;