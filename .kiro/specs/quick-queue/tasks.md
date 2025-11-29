# Implementation Plan

## Core Features (Original Spec)

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js backend project with Express, SQLite drivers, and CORS
  - Initialize React frontend project with Vite
  - Install testing dependencies: Jest
  - Create directory structure: backend (routes, repositories, services, utils), frontend (components, services)
  - _Requirements: 7.1, 7.2_

- [x] 2. Implement database schema and migrations
  - Create Categories table with id, name, displayOrder columns
  - Create Locations table with id, name, categoryId, state, city, address, isActive, createdAt, updatedAt columns
  - Create WaitTimeReports table with id, locationId, waitTimeMinutes, submittedAt columns
  - Add indexes on submittedAt, locationId, and composite (locationId, submittedAt)
  - Create seed data for initial categories (Banks, Restaurants, Events, Healthcare, Government Services, Retail)
  - _Requirements: 6.1, 7.2, 7.3_

- [x] 3. Build data access layer (repositories)
  - [x] 3.1 CategoryRepository with findAll(), findById(), exists() methods
  - [x] 3.2 LocationRepository with findAll(), findById(), create(), update(), findActive() methods
  - [x] 3.3 WaitTimeReportRepository with create(), findRecentByLocation(), calculateAverage(), countReports() methods
  - _Requirements: 1.1, 1.3, 2.1, 2.4, 3.1, 3.2, 4.1, 4.2, 4.4, 6.1-6.5_

- [x] 4. Implement business logic and validation
  - [x] 4.1 Validation utilities for wait times, report submissions, and location data
  - [x] 4.2 Aggregation service with confidence levels and severity categorization
  - _Requirements: 1.2, 1.5, 2.3, 4.3, 5.3, 5.5, 6.1_

- [x] 5. Build REST API endpoints
  - [x] 5.1 GET /api/locations (with filtering)
  - [x] 5.2 POST /api/reports
  - [x] 5.3 GET /api/categories
  - [x] 5.4 POST /api/locations (admin)
  - [x] 5.5 PUT /api/locations/:id (admin)
  - _Requirements: 1.1-1.5, 2.1, 2.3, 3.1-3.3, 6.1-6.5_

- [x] 6. Build frontend components
  - [x] 6.1 Dashboard component with auto-refresh and visual indicators
  - [x] 6.2 ReportForm component with validation
  - [x] 6.3 SearchFilter component with debouncing
  - [x] 6.4 API service module
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 2.3, 3.1, 3.2, 3.5, 4.3, 4.4, 5.3, 5.5_

- [x] 7. Implement styling and responsive design
  - Clean, minimal UI with card-based layout
  - Color-coded wait time severity indicators
  - Mobile and desktop responsive breakpoints
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 8. Wire up frontend and backend integration
  - CORS configuration
  - End-to-end flow testing
  - Error handling and loading states
  - _Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.2_

## Extended Features (Beyond Original Spec)

- [x] 9. Map and geolocation features
  - [x] 9.1 Add latitude, longitude, address fields to locations schema
  - [x] 9.2 LocationMap component with OpenStreetMap integration
  - [x] 9.3 AddLocation component with geolocation support
  - [x] 9.4 Color-coded markers by wait time severity
  - [x] 9.5 Interactive popups with location details

- [x] 10. Queue management system
  - [x] 10.1 Create queue_entries table schema
  - [x] 10.2 QueueRepository for queue operations
  - [x] 10.3 Queue API endpoints
  - [x] 10.4 QueueManager frontend component

## Bug Fixes and Remaining Work

- [ ] 11. Fix duplicate location name validation
  - [ ] 11.1 Update database schema to enforce UNIQUE(name, categoryId, state) constraint properly
  - [ ] 11.2 Fix LocationRepository.create() to check for duplicates before insertion
  - [ ] 11.3 Fix POST /api/locations to return 409 for duplicate names in same category
  - [ ] 11.4 Verify all 3 failing tests pass (schema.test.js, LocationRepository.test.js, api.test.js)
  - _Note: Currently 3 tests failing related to duplicate name validation_

- [ ] 12. Documentation and spec alignment
  - [ ] 12.1 Create or restore requirements.md document
  - [ ] 12.2 Create or restore design.md document
  - [ ] 12.3 Document extended features (map, queue management)
  - [ ] 12.4 Update API documentation with all endpoints

## Test Status

**Current: 99/102 tests passing (3 failing)**

Failing tests:
1. `src/db/schema.test.js` - "enforces unique constraint on location name within category"
2. `src/repositories/LocationRepository.test.js` - "throws error when name already exists in same category"
3. `src/routes/api.test.js` - "returns 409 for duplicate name in same category"

All failures related to duplicate location name validation not being enforced.
