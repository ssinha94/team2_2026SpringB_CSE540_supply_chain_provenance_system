import React, { useState, useEffect } from 'react';

function ProductJourney({ assetId, refreshKey }) {
  const [journey, setJourney] = useState(null);
  const [auditInfo, setAuditInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAssetId, setCurrentAssetId] = useState(assetId);

  useEffect(() => {
    if (assetId) {
      setCurrentAssetId(assetId);
      fetchJourney(assetId);
    }
  }, [assetId, refreshKey]);

  const fetchJourney = async (id) => {
    if (!id) return;

    setLoading(true);
    setError('');
    setJourney(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/audit/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setJourney(data.history || []);
        setAuditInfo(data.audit || null);
      } else {
        setError(data.error || 'Failed to fetch journey');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchJourney(currentAssetId);
  };

  const getJourneySteps = () => {
    if (!journey || journey.length === 0) return [];

    const events = Array.isArray(journey) ? journey : journey.entries || [];

    return events.map((item, index) => ({
      title: item.EventType || (index === 0 ? 'Asset Created' : 'Lifecycle Event'),
      description: item.Details || `Owner ${item.Owner || 'unknown'} updated the asset`,
      owner: item.Owner,
      status: item.Status || 'UNKNOWN',
      timestamp: item.Timestamp,
      completed: true
    }));
  };

  const journeySteps = getJourneySteps();

  return (
    <div className="journey-container">
      <h2>Product Journey</h2>
      <p>Track the complete journey of an asset through the supply chain.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label htmlFor="journeyAssetId">Asset ID:</label>
          <input
            type="text"
            id="journeyAssetId"
            value={currentAssetId}
            onChange={(e) => setCurrentAssetId(e.target.value)}
            placeholder="Enter asset ID to trace"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Trace Journey'}
        </button>
      </form>

      {loading && <div className="loading">Loading product journey...</div>}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {auditInfo && (
        <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: auditInfo.validationStatus === 'PASSED' ? '#e8f5e9' : '#ffebee', border: `1px solid ${auditInfo.validationStatus === 'PASSED' ? '#4CAF50' : '#f44336'}`, borderRadius: '5px' }}>
          <h3>Audit Validation</h3>
          <p><strong>Validation Status:</strong> {auditInfo.validationStatus}</p>
          {auditInfo.conflicts?.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
              <strong>Double-Spending Alert:</strong> The audit detected multiple transfers recorded at the same timestamp.
              <ul style={{ marginTop: '8px' }}>
                {auditInfo.conflicts.map((conflict, idx) => (
                  <li key={idx}>{conflict.reason}</li>
                ))}
              </ul>
            </div>
          )}
          {auditInfo.discrepancies?.length > 0 && (
            <div>
              <strong>Discrepancies:</strong>
              <ul>
                {auditInfo.discrepancies.map((issue, idx) => (
                  <li key={idx}>{issue.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {journey && journeySteps.length > 0 && (
        <div className="journey-timeline">
          {journeySteps.map((step, index) => (
            <div key={index} className={`journey-step ${step.completed ? 'completed' : ''}`}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <p><strong>Owner:</strong> {step.owner}</p>
              <p><strong>Status:</strong> {step.status}</p>
              {step.timestamp && (
                <p className="timestamp">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {journey && journeySteps.length === 0 && (
        <div className="no-data">
          No journey data available for this asset.
        </div>
      )}
    </div>
  );
}

export default ProductJourney;