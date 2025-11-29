import React, { useState, useEffect } from 'react';
import { fetchLocations, getQueueLength } from '../services/api';
import './Dashboard.css';

function Dashboard({ filters }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueLengths, setQueueLengths] = useState({});

  useEffect(() => {
    loadLocations();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadLocations, 5000);
    
    return () => clearInterval(interval);
  }, [filters]);

  async function loadLocations() {
    try {
      setError(null);
      const data = await fetchLocations(filters);
      setLocations(data);
      setLoading(false);
      
      // Load queue lengths for each location
      loadQueueLengths(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function loadQueueLengths(locationsList) {
    const lengths = {};
    for (const location of locationsList) {
      try {
        const result = await getQueueLength(location.id);
        lengths[location.id] = result.queueLength;
      } catch (err) {
        lengths[location.id] = 0;
      }
    }
    setQueueLengths(lengths);
  }

  function getSeverityClass(severity) {
    switch (severity) {
      case 'short':
        return 'severity-short';
      case 'moderate':
        return 'severity-moderate';
      case 'long':
        return 'severity-long';
      default:
        return 'severity-unknown';
    }
  }

  function getConfidenceLabel(level) {
    switch (level) {
      case 'high':
        return 'High confidence';
      case 'medium':
        return 'Medium confidence';
      case 'low':
        return 'Low confidence';
      default:
        return 'No data';
    }
  }

  if (loading && locations.length === 0) {
    return <div className="dashboard-loading">Loading locations...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error: {error}</p>
        <button onClick={loadLocations}>Retry</button>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="dashboard-empty">
        <p>No locations found</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-header">
              <h3>{location.name}</h3>
              <span className="location-category">{location.category}</span>
            </div>
            
            <div className={`wait-time ${getSeverityClass(location.severity)}`}>
              {location.averageWaitTime !== null ? (
                <>
                  <span className="time-value">{location.averageWaitTime}</span>
                  <span className="time-unit">min</span>
                </>
              ) : (
                <span className="no-data">No recent data</span>
              )}
            </div>
            
            <div className="location-meta">
              <span className="report-count">
                {location.reportCount} {location.reportCount === 1 ? 'report' : 'reports'}
              </span>
              <span className={`confidence confidence-${location.confidenceLevel}`}>
                {getConfidenceLabel(location.confidenceLevel)}
              </span>
            </div>
            
            {queueLengths[location.id] > 0 && (
              <div className="queue-info">
                🎫 {queueLengths[location.id]} {queueLengths[location.id] === 1 ? 'person' : 'people'} in queue
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
