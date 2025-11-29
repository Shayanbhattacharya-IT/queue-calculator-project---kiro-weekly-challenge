import { 
  calculateConfidenceLevel, 
  categorizeWaitTime, 
  getAggregatedLocationData,
  getLocationAggregatedData
} from './aggregationService.js';
import LocationRepository from '../repositories/LocationRepository.js';
import WaitTimeReportRepository from '../repositories/WaitTimeReportRepository.js';
import { createTables, dropTables } from '../db/schema.js';
import { seedCategories } from '../db/seed.js';
import getDatabase from '../db/database.js';

describe('Aggregation Service', () => {
  describe('calculateConfidenceLevel', () => {
    test('returns "none" for 0 reports', () => {
      expect(calculateConfidenceLevel(0)).toBe('none');
    });

    test('returns "low" for 1-2 reports', () => {
      expect(calculateConfidenceLevel(1)).toBe('low');
      expect(calculateConfidenceLevel(2)).toBe('low');
    });

    test('returns "medium" for 3-9 reports', () => {
      expect(calculateConfidenceLevel(3)).toBe('medium');
      expect(calculateConfidenceLevel(5)).toBe('medium');
      expect(calculateConfidenceLevel(9)).toBe('medium');
    });

    test('returns "high" for 10+ reports', () => {
      expect(calculateConfidenceLevel(10)).toBe('high');
      expect(calculateConfidenceLevel(50)).toBe('high');
    });
  });

  describe('categorizeWaitTime', () => {
    test('returns "unknown" for null or undefined', () => {
      expect(categorizeWaitTime(null)).toBe('unknown');
      expect(categorizeWaitTime(undefined)).toBe('unknown');
    });

    test('returns "short" for 0-10 minutes', () => {
      expect(categorizeWaitTime(0)).toBe('short');
      expect(categorizeWaitTime(5)).toBe('short');
      expect(categorizeWaitTime(10)).toBe('short');
    });

    test('returns "moderate" for 11-30 minutes', () => {
      expect(categorizeWaitTime(11)).toBe('moderate');
      expect(categorizeWaitTime(20)).toBe('moderate');
      expect(categorizeWaitTime(30)).toBe('moderate');
    });

    test('returns "long" for 31+ minutes', () => {
      expect(categorizeWaitTime(31)).toBe('long');
      expect(categorizeWaitTime(60)).toBe('long');
      expect(categorizeWaitTime(120)).toBe('long');
    });
  });

  describe('getAggregatedLocationData', () => {
    let categoryId1, categoryId2, location1, location2;

    beforeEach(() => {
      dropTables();
      createTables();
      seedCategories();

      const db = getDatabase();
      const categories = db.prepare('SELECT id FROM categories ORDER BY displayOrder LIMIT 2').all();
      categoryId1 = categories[0].id;
      categoryId2 = categories[1].id;

      location1 = LocationRepository.create({ name: 'Bank A', categoryId: categoryId1 });
      location2 = LocationRepository.create({ name: 'Restaurant B', categoryId: categoryId2 });
    });

    test('returns all active locations with aggregated data', async () => {
      const data = await getAggregatedLocationData();
      
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('category');
      expect(data[0]).toHaveProperty('averageWaitTime');
      expect(data[0]).toHaveProperty('reportCount');
      expect(data[0]).toHaveProperty('confidenceLevel');
      expect(data[0]).toHaveProperty('severity');
      expect(data[0]).toHaveProperty('lastReportTime');
    });

    test('includes correct wait time statistics', async () => {
      // Add reports to location1
      WaitTimeReportRepository.create({ locationId: location1.id, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId: location1.id, waitTimeMinutes: 20 });
      WaitTimeReportRepository.create({ locationId: location1.id, waitTimeMinutes: 30 });

      const data = await getAggregatedLocationData();
      const loc1Data = data.find(d => d.id === location1.id);
      
      expect(loc1Data.reportCount).toBe(3);
      expect(loc1Data.averageWaitTime).toBe(20);
      expect(loc1Data.confidenceLevel).toBe('medium');
      expect(loc1Data.severity).toBe('moderate');
    });

    test('filters by category', async () => {
      const data = await getAggregatedLocationData({ categoryId: categoryId1 });
      
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(location1.id);
    });

    test('filters by search query', async () => {
      const data = await getAggregatedLocationData({ search: 'bank' });
      
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Bank A');
    });

    test('applies both category and search filters', async () => {
      LocationRepository.create({ name: 'Bank C', categoryId: categoryId1 });
      
      const data = await getAggregatedLocationData({ 
        categoryId: categoryId1, 
        search: 'Bank A' 
      });
      
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Bank A');
    });

    test('excludes inactive locations by default', async () => {
      LocationRepository.update(location2.id, { isActive: false });
      
      const data = await getAggregatedLocationData();
      
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(location1.id);
    });

    test('includes inactive locations when activeOnly is false', async () => {
      LocationRepository.update(location2.id, { isActive: false });
      
      const data = await getAggregatedLocationData({ activeOnly: false });
      
      expect(data).toHaveLength(2);
    });

    test('returns empty array when no locations match filters', async () => {
      const data = await getAggregatedLocationData({ search: 'nonexistent' });
      expect(data).toHaveLength(0);
    });
  });

  describe('getLocationAggregatedData', () => {
    let categoryId, locationId;

    beforeEach(() => {
      dropTables();
      createTables();
      seedCategories();

      const db = getDatabase();
      const categories = db.prepare('SELECT id FROM categories LIMIT 1').all();
      categoryId = categories[0].id;

      const location = LocationRepository.create({ name: 'Test Location', categoryId });
      locationId = location.id;
    });

    test('returns aggregated data for a specific location', () => {
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 15 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 25 });

      const data = getLocationAggregatedData(locationId);
      
      expect(data).toBeDefined();
      expect(data.id).toBe(locationId);
      expect(data.name).toBe('Test Location');
      expect(data.reportCount).toBe(2);
      expect(data.averageWaitTime).toBe(20);
      expect(data.confidenceLevel).toBe('low');
      expect(data.severity).toBe('moderate');
    });

    test('returns null for non-existent location', () => {
      const data = getLocationAggregatedData(999);
      expect(data).toBeNull();
    });

    test('handles location with no reports', () => {
      const data = getLocationAggregatedData(locationId);
      
      expect(data).toBeDefined();
      expect(data.reportCount).toBe(0);
      expect(data.averageWaitTime).toBeNull();
      expect(data.confidenceLevel).toBe('none');
      expect(data.severity).toBe('unknown');
      expect(data.lastReportTime).toBeNull();
    });
  });
});
