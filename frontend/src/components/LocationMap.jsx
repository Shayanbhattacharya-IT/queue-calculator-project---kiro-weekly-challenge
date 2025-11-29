import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker colors based on wait time severity
const getMarkerIcon = (severity) => {
  const colors = {
    short: '#28a745',
    moderate: '#ffc107',
    long: '#dc3545',
    unknown: '#6c757d'
  };
  
  const color = colors[severity] || colors.unknown;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

function LocationMap({ locations, onLocationSelect, userLocation }) {
  const [center, setCenter] = useState([40.7589, -73.9851]); // Default to NYC
  const [zoom] = useState(13);

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    } else if (locations && locations.length > 0) {
      // Center on first location with coordinates
      const firstWithCoords = locations.find(loc => loc.latitude && loc.longitude);
      if (firstWithCoords) {
        setCenter([firstWithCoords.latitude, firstWithCoords.longitude]);
      }
    }
  }, [userLocation, locations]);

  const locationsWithCoords = locations.filter(loc => loc.latitude && loc.longitude);

  return (
    <div className="location-map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-marker',
              html: '<div style="background-color: #007bff; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,123,255,0.5);"></div>',
              iconSize: [15, 15],
              iconAnchor: [7, 7],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Location markers */}
        {locationsWithCoords.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getMarkerIcon(location.severity)}
            eventHandlers={{
              click: () => onLocationSelect && onLocationSelect(location)
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>{location.name}</h4>
                <p className="popup-category">{location.category}</p>
                {location.address && <p className="popup-address">{location.address}</p>}
                {location.averageWaitTime !== null ? (
                  <p className="popup-wait-time">
                    <strong>{location.averageWaitTime} min</strong> wait time
                  </p>
                ) : (
                  <p className="popup-no-data">No recent data</p>
                )}
                <p className="popup-reports">
                  {location.reportCount} {location.reportCount === 1 ? 'report' : 'reports'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LocationMap;
