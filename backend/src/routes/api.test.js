import request from 'supertest';
import express from 'express';
import { createTables, dropTables } from '../db/schema.js';
import { seedCategories } from '../db/seed.js';
import locationsRouter from './locations.js';
import categoriesRouter from './categories.js';
import reportsRouter from './reports.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/locations', locationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/reports', reportsRouter);

describe('API Integration Tests', () => {
  beforeEach(() => {
    dropTables();
    createTables();
    seedCategories();
  });

  describe('GET /api/categories', () => {
    test('returns all categories', async () => {
      const response = await request(app).get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(6);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/locations', () => {
    test('creates a new location with valid data', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({
          name: 'Test Bank',
          categoryId: 1
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Bank');
    });

    test('returns 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({
          categoryId: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('returns 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({
          name: 'Test Bank',
          categoryId: 999
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_CATEGORY');
    });

    test('returns 409 for duplicate name in same category', async () => {
      await request(app)
        .post('/api/locations')
        .send({ name: 'Test Bank', categoryId: 1 });
      
      const response = await request(app)
        .post('/api/locations')
        .send({ name: 'Test Bank', categoryId: 1 });
      
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_LOCATION');
    });
  });

  describe('GET /api/locations', () => {
    beforeEach(async () => {
      await request(app).post('/api/locations').send({ name: 'Bank A', categoryId: 1 });
      await request(app).post('/api/locations').send({ name: 'Restaurant B', categoryId: 2 });
    });

    test('returns all active locations with aggregated data', async () => {
      const response = await request(app).get('/api/locations');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('category');
      expect(response.body[0]).toHaveProperty('averageWaitTime');
      expect(response.body[0]).toHaveProperty('reportCount');
      expect(response.body[0]).toHaveProperty('confidenceLevel');
    });

    test('filters by category', async () => {
      const response = await request(app).get('/api/locations?category=1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Bank A');
    });

    test('filters by search query', async () => {
      const response = await request(app).get('/api/locations?search=bank');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Bank A');
    });

    test('returns 400 for invalid category parameter', async () => {
      const response = await request(app).get('/api/locations?category=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_CATEGORY');
    });
  });

  describe('PUT /api/locations/:id', () => {
    let locationId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ name: 'Original Name', categoryId: 1 });
      locationId = response.body.id;
    });

    test('updates location name', async () => {
      const response = await request(app)
        .put(`/api/locations/${locationId}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    test('returns 404 for non-existent location', async () => {
      const response = await request(app)
        .put('/api/locations/999')
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('returns 400 for invalid location ID', async () => {
      const response = await request(app)
        .put('/api/locations/invalid')
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_ID');
    });
  });

  describe('POST /api/reports', () => {
    let locationId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ name: 'Test Location', categoryId: 1 });
      locationId = response.body.id;
    });

    test('creates a new report with valid data', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          locationId: locationId,
          waitTimeMinutes: 15
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.reportId).toBeDefined();
    });

    test('returns 400 for missing locationId', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          waitTimeMinutes: 15
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('returns 400 for negative wait time', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          locationId: locationId,
          waitTimeMinutes: -5
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('returns 404 for non-existent location', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({
          locationId: 999,
          waitTimeMinutes: 15
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });
  });
});
