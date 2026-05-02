import React, { useState, useEffect } from 'react';

function ProductJourney({ assetId }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAssetId, setCurrentAssetId] = useState(assetId);

  useEffect(() => {
    if (assetId) {
      setCurrentAssetId(assetId);
      fetchJourney(assetId);
    }
  }, [assetId]);

  const fetchJourney = async (id) => {
    if (!id) return;

    setLoading(true);
    setError('');
    setJourney(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/trace/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setJourney(data.history || [data.asset]);
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

    return journey.map((item, index) => ({
      title: index === 0 ? 'Asset Created' : 'Ownership Transferred',
      description: index === 0 ? `Asset ${item.ID} was registered in the system` : `Asset transferred to ${item.Owner}`,
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