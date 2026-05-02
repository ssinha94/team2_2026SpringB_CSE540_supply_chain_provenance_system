import React, { useState } from 'react';

function AssetRegistration({ onAssetRegistered }) {
  const [formData, setFormData] = useState({
    assetId: '',
    owner: '',
    docHash: ''
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
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Asset ${formData.assetId} registered successfully!`);
        setFormData({ assetId: '', owner: '', docHash: '' });
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
          <label htmlFor="owner">Owner:</label>
          <input
            type="text"
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            placeholder="e.g., ManufacturerA"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="docHash">Document Hash:</label>
          <input
            type="text"
            id="docHash"
            name="docHash"
            value={formData.docHash}
            onChange={handleChange}
            placeholder="SHA-256 hash of the document"
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