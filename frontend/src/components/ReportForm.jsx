import React, { useState, useEffect } from 'react';
import { submitReport, fetchLocations, fetchCategories, getQueueLength } from '../services/api';
import './ReportForm.css';

function ReportForm({ onSuccess, onJoinQueue }) {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationId, setLocationId] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadLocationsByCategory(selectedCategory);
    } else {
      loadAllLocations();
    }
  }, [selectedCategory]);

  async function loadInitialData() {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        fetchCategories(),
        fetchLocations()
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Failed to load form data:', err);
      setError('Failed to load form data. Please check if the backend server is running on port 3001.');
    }
  }

  async function loadAllLocations() {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
      setError('Failed to load locations. Please check your connection.');
    }
  }

  async function loadLocationsByCategory(categoryId) {
    try {
      const data = await fetchLocations({ category: categoryId });
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations by category:', err);
      setError('Failed to load locations. Please check your connection.');
    }
  }

  async function handleLocationChange(locId) {
    setLocationId(locId);
    setQueueInfo(null);
    
    if (locId) {
      // Find the selected location details
      const location = locations.find(loc => loc.id === parseInt(locId, 10));
      setSelectedLocation(location);
      
      // Load queue information
      try {
        const queueData = await getQueueLength(parseInt(locId, 10));
        setQueueInfo({
          queueLength: queueData.queueLength,
          estimatedWaitTime: location?.averageWaitTime || 15
        });
      } catch (err) {
        console.error('Failed to load queue info:', err);
      }
    } else {
      setSelectedLocation(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Client-side validation
    if (!locationId) {
      setError('Please select a location');
      return;
    }
    
    const waitTimeNum = parseInt(waitTime, 10);
    if (isNaN(waitTimeNum) || waitTimeNum < 0) {
      setError('Please enter a valid wait time (0 or greater)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await submitReport({
        locationId: parseInt(locationId, 10),
        waitTimeMinutes: waitTimeNum
      });
      
      setSuccess(true);
      setWaitTime('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reload queue info after submitting
      if (locationId) {
        const queueData = await getQueueLength(parseInt(locationId, 10));
        setQueueInfo({
          queueLength: queueData.queueLength,
          estimatedWaitTime: waitTimeNum
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit report. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-form-container">
      <h2>Report Wait Time</h2>
      
      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="category">Filter by Category (Optional)</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <select
            id="location"
            value={locationId}
            onChange={(e) => handleLocationChange(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.category})
              </option>
            ))}
          </select>
        </div>
        
        {selectedLocation && queueInfo && (
          <div className="location-details">
            <h4>📍 {selectedLocation.name}</h4>
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{selectedLocation.category}</span>
            </div>
            {selectedLocation.city && (
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{selectedLocation.city}, {selectedLocation.state}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Current Queue:</span>
              <span className="detail-value queue-highlight">
                {queueInfo.queueLength} {queueInfo.queueLength === 1 ? 'person' : 'people'} waiting
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estimated Wait:</span>
              <span className="detail-value time-highlight">
                ~{queueInfo.estimatedWaitTime} minutes
              </span>
            </div>
            {queueInfo.queueLength > 0 && (
              <div className="queue-tip">
                💡 If you join now, you'll be #{queueInfo.queueLength + 1} in line
              </div>
            )}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="waitTime">Wait Time (minutes) *</label>
          <input
            type="number"
            id="waitTime"
            value={waitTime}
            onChange={(e) => setWaitTime(e.target.value)}
            min="0"
            placeholder="e.g., 15"
            required
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="form-message success">
            Wait time reported successfully!
          </div>
        )}
        
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
        
        {locationId && (
          <button 
            type="button"
            onClick={() => onJoinQueue && onJoinQueue(locationId)}
            disabled={loading}
            className="join-queue-button"
          >
            🎫 Join Queue at This Location
          </button>
        )}
      </form>
    </div>
  );
}

export default ReportForm;
