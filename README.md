# Quick Queue

A crowd-sourced line wait time estimator that helps people avoid wasting time in long queues at banks, restaurants, and events.

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:3000

## ✨ Features

- 🕒 **Report Wait Time**: Users can submit current wait times
- 📊 **Live Dashboard**: Shows locations with average reported wait times (auto-refresh every 5s)
- 📍 **Location Search**: Search by place name or filter by category
- 👍 **Community-Powered**: Multiple reports are averaged for accuracy
- 🎨 **Minimal UI**: Clean, distraction-free design
- 📱 **Responsive**: Works on mobile and desktop

## 🏗️ Project Structure

```
quick-queue/
├── backend/          # Node.js/Express API + SQLite
│   ├── src/
│   │   ├── db/           # Database schema & migrations
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── utils/        # Validation
│   │   └── index.js
│   └── package.json
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/   # Dashboard, ReportForm, SearchFilter
│   │   ├── services/     # API service
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── .kiro/specs/quick-queue/  # Specification documents
```

## 🧪 Testing

### Backend Tests (102 tests)
```bash
cd backend
npm test
```

Includes:
- Database schema tests
- Repository tests (CategoryRepository, LocationRepository, WaitTimeReportRepository)
- Validation tests
- Aggregation service tests
- API integration tests

## 📡 API Endpoints

- `GET /api/locations` - Get all locations with wait time data
- `GET /api/categories` - Get all categories
- `POST /api/reports` - Submit a wait time report
- `POST /api/locations` - Create new location (admin)
- `PUT /api/locations/:id` - Update location (admin)

## 🎯 Key Features

### Wait Time Aggregation
- Averages reports from the past 2 hours
- Confidence levels based on report count
- Visual severity indicators (green/yellow/red)

### Search & Filter
- Real-time search with 300ms debounce
- Category filtering
- Combined filters support

### Data Validation
- Client and server-side validation
- Non-negative wait times only
- Required field checking

## 📚 Documentation

- `PROJECT-SUMMARY.md` - Complete implementation summary
- `verify-build.md` - Build verification steps
- `.kiro/specs/quick-queue/` - Full specifications

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- Jest + Supertest

**Frontend:**
- React 18
- Vite
- CSS Modules

## 📝 License

MIT
