# Quick Queue - Map & Geolocation Features

## 🗺️ New Features Added

### 1. Interactive Map View
- **OpenStreetMap Integration**: Free, open-source map using Leaflet
- **Location Markers**: Color-coded by wait time severity
  - 🟢 Green: Short wait (0-10 min)
  - 🟡 Yellow: Moderate wait (11-30 min)
  - 🔴 Red: Long wait (31+ min)
  - ⚪ Gray: No data
- **User Location**: Blue marker shows your current position
- **Interactive Popups**: Click markers to see location details

### 2. Add New Locations
- **Manual Entry**: Add locations with name, category, and address
- **Geolocation**: Use "📍 Use My Current Location" button to auto-fill coordinates
- **Reverse Geocoding**: Automatically gets address from coordinates
- **Map Integration**: New locations appear on the map immediately

### 3. Enhanced Location Data
Each location now includes:
- **Latitude & Longitude**: For precise positioning
- **Address**: Full street address
- **Map Visualization**: See all locations at a glance

## 🚀 How to Use

### View Map
1. Open http://localhost:3000
2. Click "🗺️ Map View" button
3. See all locations with wait times on the map
4. Click markers for details

### Add a Location
1. Click "➕ Add New Location" button
2. Fill in location name and category
3. Click "📍 Use My Current Location" to get your coordinates
4. Or manually enter latitude/longitude
5. Add address (optional)
6. Click "Add Location"

### Report Wait Time
1. Select a location from the dropdown
2. Enter current wait time in minutes
3. Submit report
4. See it update on both list and map views

## 🌍 Geolocation Features

### Browser Geolocation API
- Automatically detects your location (with permission)
- Shows your position on the map
- Used for adding nearby locations

### OpenStreetMap Nominatim
- Free reverse geocoding service
- Converts coordinates to addresses
- No API key required

### Map Controls
- **Zoom**: Use +/- buttons or scroll wheel
- **Pan**: Click and drag to move around
- **Markers**: Click to see location info
- **Toggle Views**: Switch between list and map

## 📊 Sample Data

The app comes with 6 sample locations in New York City:
- City Bank Downtown (Wall Street)
- Pizza Palace (Broadway)
- Concert Hall (Madison Ave)
- General Hospital (Park Ave)
- DMV Office (8th Ave)
- SuperMart (5th Ave)

All locations have coordinates and addresses for map display.

## 🔧 Technical Details

### Frontend
- **Leaflet**: Open-source JavaScript library for maps
- **React-Leaflet**: React components for Leaflet
- **OpenStreetMap**: Free map tiles
- **Nominatim**: Reverse geocoding API

### Backend
- **SQLite Schema**: Added latitude, longitude, address fields
- **Location API**: Updated to handle geographic data
- **Validation**: Coordinates are optional but validated

### Database Schema
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  categoryId INTEGER NOT NULL,
  latitude REAL,
  longitude REAL,
  address TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT
)
```

## 🎯 Use Cases

1. **Find Nearby Locations**: See wait times for places near you
2. **Add Missing Places**: Contribute new locations to the community
3. **Visual Overview**: Quickly scan an area for short wait times
4. **Mobile-Friendly**: Works on phones with GPS

## 🔐 Privacy

- Location access requires browser permission
- Your location is only used locally (not sent to server)
- You can manually enter coordinates if you prefer
- No tracking or location history stored

## 🌟 Benefits

- **No API Keys Needed**: Uses free OpenStreetMap services
- **Offline Capable**: Map tiles are cached by browser
- **Community-Driven**: Anyone can add locations
- **Real-Time Updates**: Map markers update with latest wait times
- **Mobile Responsive**: Works on all devices

Enjoy exploring Quick Queue with maps! 🗺️✨
