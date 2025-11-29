import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import SearchFilter from './components/SearchFilter';
import LocationMap from './components/LocationMap';
import AddLocation from './components/AddLocation';
import QueueManager from './components/QueueManager';
import { fetchLocations, joinQueue } from './services/api';
import './App.css';

function App() {
  const [filters, setFilters] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userId, setUserId] = useState(null);
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);

  // Initialize userId once on mount
  useEffect(() => {
    // Get or create a unique user ID
    let storedUserId = localStorage.getItem('quickQueueUserId');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('quickQueueUserId', storedUserId);
    }
    setUserId(storedUserId);
    getUserLocation();
  }, []);

  // Load locations when filters change
  useEffect(() => {
    loadLocations();
  }, [filters, refreshKey]);

  async function loadLocations() {
    try {
      const data = await fetchLocations(filters);
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  }

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation not available:', error.message);
        }
      );
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handleReportSuccess() {
    setRefreshKey(prev => prev + 1);
  }

  function handleLocationAdded() {
    setRefreshKey(prev => prev + 1);
    setShowAddLocation(false);
  }

  async function handleJoinQueue(locationId) {
    if (!userId) {
      alert('Please wait while we initialize your session...');
      return;
    }

    try {
      const result = await joinQueue({
        locationId: parseInt(locationId, 10),
        userId
      });
      
      alert(result.message || 'Successfully joined the queue!');
      setQueueRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Failed to join queue: ' + error.message);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quick Queue</h1>
        <p className="app-subtitle">Real-time wait time information</p>
      </header>

      <main className="app-main">
        <div className="action-buttons">
          <button 
            onClick={() => setShowAddLocation(!showAddLocation)}
            className="add-location-toggle"
          >
            {showAddLocation ? '✕ Close' : '➕ Add New Location'}
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="view-toggle"
          >
            {viewMode === 'list' ? '🗺️ Map View' : '📋 List View'}
          </button>
        </div>

        {showAddLocation && (
          <AddLocation onSuccess={handleLocationAdded} />
        )}

        {userId && <QueueManager userId={userId} key={queueRefreshKey} />}

        <ReportForm onSuccess={handleReportSuccess} onJoinQueue={handleJoinQueue} />
        <SearchFilter onFilterChange={handleFilterChange} />

        {viewMode === 'map' ? (
          <LocationMap 
            locations={locations} 
            userLocation={userLocation}
            onLocationSelect={(location) => console.log('Selected:', location)}
          />
        ) : null}

        <Dashboard filters={filters} key={refreshKey} />
      </main>

      <footer className="app-footer">
        <p>Community-powered wait time estimates • Map data © OpenStreetMap contributors</p>
      </footer>
    </div>
  );
}

export default App;
