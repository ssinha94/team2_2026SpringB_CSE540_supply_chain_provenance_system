import React, { useState, useEffect } from 'react';

function AssetVerification({ assetId, onVerificationComplete }) {
  const [formData, setFormData] = useState({
    assetId: assetId || '',
    verificationNotes: '',
    qualityCheck: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (assetId && assetId !== formData.assetId) {
      setFormData(prev => ({
        ...prev,
        assetId: assetId
      }));
      fetchVerificationHistory(assetId);
    }
  }, [assetId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assetId.trim()) {
      setMessage('❌ Asset ID is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/verify/${formData.assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verificationNotes: formData.verificationNotes,
          qualityCheck: formData.qualityCheck
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Asset verified successfully');
        setFormData(prev => ({
          ...prev,
          verificationNotes: '',
          qualityCheck: false
        }));
        setIsVerified(true);
        
        if (onVerificationComplete) {
          onVerificationComplete(formData.assetId);
        }

        // Fetch updated verification history
        await fetchVerificationHistory(formData.assetId);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationHistory = async (assetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/verify/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationHistory(data.verifications || []);
        setIsVerified(data.isVerified || false);
      }
    } catch (error) {
      console.error('Failed to fetch verification history:', error);
    }
  };

  return (
    <div className="asset-verification-container" style={{ padding: '20px', border: '1px solid #FF9800', borderRadius: '5px', background: '#fff8f0' }}>
      <h2>Verify Asset Authenticity</h2>
      <p>Confirm authenticity, quality checks, or regulatory approvals for the product.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label htmlFor="verifyAssetId">Asset ID:</label>
          <input
            type="text"
            id="verifyAssetId"
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            placeholder="Enter asset ID"
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="verificationNotes">Verification Notes:</label>
          <textarea
            id="verificationNotes"
            name="verificationNotes"
            value={formData.verificationNotes}
            onChange={handleChange}
            placeholder="e.g., Document authenticity confirmed, serial number verified, no damage detected"
            rows="3"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="qualityCheck"
              checked={formData.qualityCheck}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
            />
            <span>Quality Check Passed</span>
          </label>
          <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>
            Check this box if the asset passes quality inspection standards
          </small>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#FF9800', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Verifying...' : 'Verify Asset'}
        </button>
      </form>

      {message && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
          color: message.includes('✅') ? '#2e7d32' : '#c62828',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        padding: '10px', 
        marginBottom: '15px', 
        backgroundColor: isVerified ? '#e8f5e9' : '#f5f5f5',
        border: `2px solid ${isVerified ? '#4CAF50' : '#ddd'}`,
        borderRadius: '4px'
      }}>
        <strong style={{ color: isVerified ? '#2e7d32' : '#666' }}>
          {isVerified ? '✓ Asset Verified' : '○ Not Yet Verified'}
        </strong>
      </div>

      {verificationHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Verification History</h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {verificationHistory.map((verification, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '12px', 
                  marginBottom: '10px', 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Verification #{index + 1}</strong>
                  <small style={{ color: '#999' }}>ID: {verification.verificationId}</small>
                </div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Verifier:</strong> {verification.verifier}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Quality Check:</strong> {verification.qualityCheck ? '✓ Passed' : '✗ Not Passed'}
                </p>
                {verification.notes && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Notes:</strong> {verification.notes}
                  </p>
                )}
                <small style={{ color: '#999' }}>
                  {new Date(verification.verifiedAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetVerification;
