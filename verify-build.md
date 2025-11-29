# Quick Queue - Build Verification

## Backend Tests
Run from the `backend` directory:
```bash
cd backend
npm test
```

Expected: 7 test suites, 102 tests passing

## Frontend Build
Run from the `frontend` directory:
```bash
cd frontend
npm run build
```

## Start Backend Server
```bash
cd backend
npm start
```
Server will run on http://localhost:3001

## Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Test the Application
1. Open http://localhost:3000 in your browser
2. You should see the Quick Queue interface
3. Try submitting a wait time report
4. Verify the dashboard updates with the new data
5. Test the search and filter functionality

## API Endpoints
- GET http://localhost:3001/api/locations
- GET http://localhost:3001/api/categories
- POST http://localhost:3001/api/reports
- POST http://localhost:3001/api/locations (admin)
- PUT http://localhost:3001/api/locations/:id (admin)
