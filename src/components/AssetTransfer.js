import React, { useState } from 'react';

function AssetTransfer({ assetId, onTransferComplete }) {
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOwner.trim()) return;

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
        body: JSON.stringify({ assetId, newOwner })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Asset transferred to ${newOwner} successfully!`);
        setNewOwner('');
        if (onTransferComplete) {
          onTransferComplete(assetId, newOwner);
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
    <div className="asset-transfer-container" style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '5px', background: '#f9fff9' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Transfer Ownership</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          placeholder="New Owner Username"
          required
          style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" disabled={loading} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Transferring...' : 'Transfer Asset'}
        </button>
      </form>
      {message && (
        <div style={{ marginTop: '10px', fontSize: '0.9em', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default AssetTransfer;
