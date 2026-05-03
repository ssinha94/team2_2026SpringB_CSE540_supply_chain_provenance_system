import React, { useState, useEffect } from 'react';

function AssetCertification({ assetId, userRole, onCertificationIssued }) {
  const [formData, setFormData] = useState({
    assetId: assetId || '',
    certificationType: 'QUALITY_ASSURANCE',
    expiryDate: '',
    metadata: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [certifications, setCertifications] = useState([]);
  const canIssueCert = userRole === 'auditor' || userRole === 'superuser';

  const certificationTypes = [
    'QUALITY_ASSURANCE',
    'REGULATORY_APPROVAL',
    'SAFETY_CERTIFICATION',
    'ORGANIC_CERTIFICATION',
    'ISO_CERTIFICATION',
    'CUSTOMS_APPROVAL',
    'ENVIRONMENTAL_COMPLIANCE',
    'AUTHENTICITY_VERIFICATION'
  ];

  useEffect(() => {
    if (assetId && assetId !== formData.assetId) {
      setFormData(prev => ({
        ...prev,
        assetId: assetId
      }));
      fetchCertifications(assetId);
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
    
    if (!canIssueCert) {
      setMessage('❌ You do not have permission to issue certifications');
      return;
    }

    if (!formData.assetId.trim()) {
      setMessage('❌ Asset ID is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      const payload = {
        certificationType: formData.certificationType,
        expiryDate: formData.expiryDate || null
      };

      if (formData.metadata.trim()) {
        try {
          payload.metadata = JSON.parse(formData.metadata);
        } catch (err) {
          setMessage('❌ Invalid metadata JSON format');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`/certifications/${formData.assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Certification ${formData.certificationType} issued successfully`);
        setFormData(prev => ({
          ...prev,
          certificationType: 'QUALITY_ASSURANCE',
          expiryDate: '',
          metadata: ''
        }));
        
        if (onCertificationIssued) {
          onCertificationIssued(formData.assetId, formData.certificationType);
        }

        // Fetch updated certifications
        await fetchCertifications(formData.assetId);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertifications = async (assetId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/certifications/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCertifications(data.certifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getActiveCertifications = () => {
    return certifications.filter(cert => !isExpired(cert.expiryDate));
  };

  return (
    <div className="asset-certification-container" style={{ padding: '20px', border: '1px solid #9C27B0', borderRadius: '5px', background: '#f8f0ff' }}>
      <h2>Asset Certifications</h2>
      <p>Issue and manage certifications and regulatory approvals for assets.</p>

      {!canIssueCert && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#fff3e0',
          border: '1px solid #FF9800',
          borderRadius: '4px',
          color: '#e65100'
        }}>
          ⓘ Only Auditors and Superusers can issue certifications
        </div>
      )}

      {canIssueCert && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label htmlFor="certAssetId">Asset ID:</label>
            <input
              type="text"
              id="certAssetId"
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              placeholder="Enter asset ID"
              required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="certificationType">Certification Type:</label>
            <select
              id="certificationType"
              name="certificationType"
              value={formData.certificationType}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            >
              {certificationTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date (Optional):</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <small style={{ color: '#666' }}>
              Leave blank for non-expiring certifications
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="metadata">Additional Metadata (JSON - Optional):</label>
            <textarea
              id="metadata"
              name="metadata"
              value={formData.metadata}
              onChange={handleChange}
              placeholder='{"standard": "ISO-9001", "auditor": "John Doe"}'
              rows="2"
              style={{ width: '100%', padding: '8px', marginBottom: '10px', fontFamily: 'monospace' }}
            />
            <small style={{ color: '#666' }}>
              Enter valid JSON for additional certification details
            </small>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#9C27B0', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Issuing...' : 'Issue Certification'}
          </button>
        </form>
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

      {certifications.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Certifications ({getActiveCertifications().length} active, {certifications.length} total)
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {certifications.map((cert, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '12px', 
                  marginBottom: '10px', 
                  backgroundColor: '#fff', 
                  border: `2px solid ${isExpired(cert.expiryDate) ? '#ccc' : '#9C27B0'}`,
                  borderRadius: '4px',
                  opacity: isExpired(cert.expiryDate) ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{cert.type.replace(/_/g, ' ')}</strong>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: isExpired(cert.expiryDate) ? '#ffebee' : '#e8f5e9',
                    color: isExpired(cert.expiryDate) ? '#c62828' : '#2e7d32',
                    borderRadius: '3px',
                    fontSize: '0.85em'
                  }}>
                    {isExpired(cert.expiryDate) ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Issued By:</strong> {cert.issuer}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Issued:</strong> {new Date(cert.issuedDate).toLocaleDateString()}
                </p>
                {cert.expiryDate && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Expires:</strong> {new Date(cert.expiryDate).toLocaleDateString()}
                  </p>
                )}
                <small style={{ color: '#999' }}>
                  ID: {cert.certificationId}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetCertification;
