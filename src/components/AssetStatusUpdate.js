import React, { useState, useEffect } from 'react';

function AssetStatusUpdate({ assetId, onStatusUpdated, userRole }) {
  const [formData, setFormData] = useState({
    assetId: assetId || '',
    status: 'ORIGINATED',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [validationInfo, setValidationInfo] = useState(null);
  const [auditActionMessage, setAuditActionMessage] = useState('');
  const [assetDetails, setAssetDetails] = useState(null);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(false);

  const validStatuses = [
    'ORIGINATED',
    'SHIPPED',
    'RECEIVED',
    'DELIVERED',
    'VERIFIED',
    'DAMAGED',
    'LOST'
  ];

  const auditorOnlyStatuses = ['AUDITED', 'CERTIFIED', 'FROZEN'];
  const statusOptions = userRole === 'auditor' ? [...validStatuses, ...auditorOnlyStatuses] : validStatuses;

  useEffect(() => {
    if (!assetId) return;

    setFormData(prev => ({
      ...prev,
      assetId: assetId
    }));
    fetchAuditDetails(assetId);
    fetchStatusHistory(assetId);
    fetchAssetDetails(assetId);
  }, [assetId, userRole]);

  const fetchAuditDetails = async (assetId) => {
    if (!assetId || userRole !== 'auditor') return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/audit/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setValidationInfo(data.audit || null);
      } else {
        setValidationInfo(null);
      }
    } catch (error) {
      console.error('Failed to fetch audit details:', error);
      setValidationInfo(null);
    }
  };

  const fetchAssetDetails = async (assetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/asset/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssetDetails(data.asset || null);
        const blocked = ['IN_TRANSIT', 'SOLD'].includes(data.asset?.Status);
        setIsUpdateDisabled(blocked);
      } else {
        setAssetDetails(null);
        setIsUpdateDisabled(false);
      }
    } catch (error) {
      console.error('Failed to fetch asset details:', error);
      setAssetDetails(null);
      setIsUpdateDisabled(false);
    }
  };

  const handleSpecialAuditStatus = async (statusType) => {
    if (!formData.assetId.trim()) {
      setAuditActionMessage('❌ Asset ID is required for audit actions');
      return;
    }

    setLoading(true);
    setAuditActionMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/status/${formData.assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusType,
          details: `Auditor action applied by ${localStorage.getItem('username') || 'auditor'}`
        })
      });

      const data = await response.json();
      if (response.status === 403) {
        setAuditActionMessage(`❌ Unauthorized: ${data.details || data.error || 'You are not allowed to apply this status.'}`);
      } else if (response.ok) {
        setAuditActionMessage(`✅ ${statusType} status applied successfully`);
        await fetchStatusHistory(formData.assetId);
        await fetchAuditDetails(formData.assetId);
        await fetchAssetDetails(formData.assetId);
      } else {
        setAuditActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setAuditActionMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertification = async () => {
    if (!formData.assetId.trim()) {
      setAuditActionMessage('❌ Asset ID is required to issue certification');
      return;
    }

    setLoading(true);
    setAuditActionMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/certifications/${formData.assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          certificationType: 'AUTHENTICITY_VERIFICATION',
          expiryDate: null,
          metadata: {
            auditor: localStorage.getItem('username') || 'auditor',
            issuedBy: 'Audit Status Update'
          }
        })
      });

      const data = await response.json();
      if (response.status === 403) {
        setAuditActionMessage(`❌ Unauthorized: ${data.details || data.error || 'You are not allowed to issue a certification.'}`);
      } else if (response.ok) {
        setAuditActionMessage('✅ Audit certification issued successfully');
        await fetchStatusHistory(formData.assetId);
        await fetchAuditDetails(formData.assetId);
        await fetchAssetDetails(formData.assetId);
      } else {
        setAuditActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setAuditActionMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagForReview = async () => {
    if (!formData.assetId.trim()) {
      setAuditActionMessage('❌ Asset ID is required to flag for review');
      return;
    }

    setLoading(true);
    setAuditActionMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/status/${formData.assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'FROZEN',
          details: `Flagged for review by ${localStorage.getItem('username') || 'auditor'}`
        })
      });

      const data = await response.json();
      if (response.status === 403) {
        setAuditActionMessage(`❌ Unauthorized: ${data.details || data.error || 'You are not allowed to flag this asset for review.'}`);
      } else if (response.ok) {
        setAuditActionMessage('✅ Asset flagged for review and locked');
        await fetchStatusHistory(formData.assetId);
        await fetchAuditDetails(formData.assetId);
        await fetchAssetDetails(formData.assetId);
      } else {
        setAuditActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setAuditActionMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

    if (isUpdateDisabled) {
      setMessage('❌ Cannot update status while asset is IN_TRANSIT or SOLD.');
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

      if (response.status === 403) {
        setMessage(`❌ Unauthorized: ${data.details || data.error || 'You are not allowed to update this status.'}`);
      } else if (response.ok) {
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
            {statusOptions.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            Typical journey: ORIGINATED → SHIPPED → RECEIVED → DELIVERED
            {userRole === 'auditor' && ' • Auditors may apply AUDITED, CERTIFIED, or FROZEN flags.'}
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
          disabled={loading || isUpdateDisabled}
          style={{ 
            background: '#2196F3', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading || isUpdateDisabled ? 'not-allowed' : 'pointer',
            opacity: isUpdateDisabled ? 0.6 : 1
          }}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </form>

      {isUpdateDisabled && (
        <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '4px', color: '#bf360c' }}>
          <strong>Update Disabled:</strong> This asset is currently marked as {assetDetails?.Status}. Status updates are blocked while assets are in transit or sold.
        </div>
      )}

      {userRole === 'auditor' && (
        <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#fff8e1', border: '1px solid #ffd54f', borderRadius: '4px' }}>
          <h3>Auditor Oversight</h3>
          <p style={{ marginBottom: '12px' }}>
            Auditors can review the asset lifecycle, flag conflicts, and certify inspection events.
          </p>
          <button
            type="button"
            onClick={() => handleSpecialAuditStatus('AUDITED')}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Mark as Audited
          </button>
          <button
            type="button"
            onClick={handleIssueCertification}
            style={{
              background: '#9C27B0',
              color: 'white',
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Issue Audit Certification
          </button>
          <button
            type="button"
            onClick={handleFlagForReview}
            style={{
              background: '#F44336',
              color: 'white',
              padding: '10px 18px',
              border: 'none',
              borderRadius: '4px',
              marginLeft: '10px',
              cursor: 'pointer'
            }}
          >
            Flag for Review
          </button>
          {auditActionMessage && (
            <div style={{ marginTop: '12px', color: '#444' }}>
              {auditActionMessage}
            </div>
          )}
        </div>
      )}

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

      {validationInfo && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: validationInfo.validationStatus === 'PASSED' ? '#e8f5e9' : '#ffebee', border: `1px solid ${validationInfo.validationStatus === 'PASSED' ? '#4CAF50' : '#f44336'}`, borderRadius: '4px' }}>
          <h3>Validation Status</h3>
          <p><strong>Validation:</strong> {validationInfo.validationStatus}</p>
          {validationInfo.conflicts?.length > 0 && (
            <div>
              <strong>Conflicts:</strong>
              <ul>
                {validationInfo.conflicts.map((conflict, idx) => (
                  <li key={idx}>{conflict.reason}</li>
                ))}
              </ul>
            </div>
          )}
          {validationInfo.discrepancies?.length > 0 && (
            <div>
              <strong>Discrepancies:</strong>
              <ul>
                {validationInfo.discrepancies.map((issue, idx) => (
                  <li key={idx}>{issue.reason}</li>
                ))}
              </ul>
            </div>
          )}
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
                  {event.Timestamp ? new Date(event.Timestamp).toLocaleString() : 'No timestamp'}
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
