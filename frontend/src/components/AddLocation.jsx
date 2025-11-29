import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import './AddLocation.css';

function AddLocation({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setUseCurrentLocation(true);
        setGettingLocation(false);
        
        // Try to get address from coordinates using reverse geocoding
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setError('Unable to get your location: ' + error.message);
        setGettingLocation(false);
      }
    );
  }

  async function reverseGeocode(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!name || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const locationData = {
        name,
        categoryId: parseInt(categoryId, 10),
        address: address || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
      };

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to add location');
      }

      setSuccess(true);
      setName('');
      setCategoryId('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setUseCurrentLocation(false);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-location-container">
      <h2>Add New Location</h2>
      
      <form onSubmit={handleSubmit} className="add-location-form">
        <div className="form-group">
          <label htmlFor="name">Location Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Downtown Bank"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address (Optional)</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main St, City, State"
            disabled={loading}
          />
        </div>

        <div className="location-section">
          <h3>Location Coordinates (Optional)</h3>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading || gettingLocation}
            className="location-button"
          >
            {gettingLocation ? 'Getting Location...' : '📍 Use My Current Location'}
          </button>

          <div className="coordinates-inputs">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="40.7589"
                step="0.000001"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-73.9851"
                step="0.000001"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message success">
            Location added successfully!
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Adding Location...' : 'Add Location'}
        </button>
      </form>
    </div>
  );
}

export default AddLocation;
