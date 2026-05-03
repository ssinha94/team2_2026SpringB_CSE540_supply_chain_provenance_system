import React, { useState, useEffect } from 'react';

function AssetStatusUpdate({ assetId, onStatusUpdated }) {
  const [formData, setFormData] = useState({
    assetId: assetId || '',
    status: 'ORIGINATED',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);

  const validStatuses = [
    'ORIGINATED',
    'SHIPPED',
    'RECEIVED',
    'DELIVERED',
    'VERIFIED',
    'DAMAGED',
    'LOST'
  ];

  useEffect(() => {
    if (assetId && assetId !== formData.assetId) {
      setFormData(prev => ({
        ...prev,
        assetId: assetId
      }));
    }
  }, [assetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const response = await fetch(`/status/${formData.assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: formData.status,
          details: formData.details
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Asset status updated to ${formData.status}`);
        setFormData(prev => ({
          ...prev,
          details: ''
        }));
        
        if (onStatusUpdated) {
          onStatusUpdated(formData.assetId, formData.status);
        }

        // Fetch status history
        await fetchStatusHistory(formData.assetId);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async (assetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/trace/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const history = data.history || [];
        
        // Filter status update events
        const statusEvents = history.filter(event => 
          event.EventType === 'STATUS_UPDATE' || event.Status
        );
        
        setStatusHistory(statusEvents);
      }
    } catch (error) {
      console.error('Failed to fetch status history:', error);
    }
  };

  return (
    <div className="asset-status-container" style={{ padding: '20px', border: '1px solid #2196F3', borderRadius: '5px', background: '#f3f7ff' }}>
      <h2>Update Asset Status</h2>
      <p>Track the product journey through different supply chain stages.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label htmlFor="statusAssetId">Asset ID:</label>
          <input
            type="text"
            id="statusAssetId"
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            placeholder="Enter asset ID"
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          >
            {validStatuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            Typical journey: ORIGINATED → SHIPPED → RECEIVED → DELIVERED
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="statusDetails">Details (Optional):</label>
          <textarea
            id="statusDetails"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="e.g., Shipped via FedEx, stored in cold storage at -5°C"
            rows="3"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#2196F3', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Updating...' : 'Update Status'}
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

      {statusHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Status History</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {statusHistory.map((event, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '10px', 
                  marginBottom: '8px', 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px'
                }}
              >
                <strong>{event.Status || event.EventType}</strong>
                {event.Details && <p style={{ margin: '5px 0', color: '#666' }}>{event.Details}</p>}
                <small style={{ color: '#999' }}>
                  {new Date(event.Timestamp).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetStatusUpdate;
