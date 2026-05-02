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

    // For now, we'll simulate the journey steps based on the asset data
    // In a real implementation, this would come from the blockchain history
    const steps = [
      {
        title: 'Asset Created',
        description: `Asset ${journey[0].ID} was registered in the system`,
        owner: journey[0].Owner,
        status: 'REGISTERED',
        timestamp: journey[0].Timestamp,
        completed: true
      }
    ];

    // Add transfer steps if there are multiple entries
    if (journey.length > 1) {
      for (let i = 1; i < journey.length; i++) {
        steps.push({
          title: 'Ownership Transferred',
          description: `Asset transferred to ${journey[i].Owner}`,
          owner: journey[i].Owner,
          status: journey[i].Status || 'IN_TRANSIT',
          timestamp: journey[i].Timestamp,
          completed: true
        });
      }
    }

    // Add future steps (not completed yet)
    const futureSteps = [
      {
        title: 'In Storage',
        description: 'Asset is being stored at warehouse',
        owner: journey[journey.length - 1].Owner,
        status: 'IN_STORAGE',
        completed: false
      },
      {
        title: 'Delivered',
        description: 'Asset delivered to final destination',
        owner: 'Consumer',
        status: 'DELIVERED',
        completed: false
      }
    ];

    return [...steps, ...futureSteps];
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