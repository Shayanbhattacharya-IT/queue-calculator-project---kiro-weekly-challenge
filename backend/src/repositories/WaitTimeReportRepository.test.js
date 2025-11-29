import WaitTimeReportRepository from './WaitTimeReportRepository.js';
import LocationRepository from './LocationRepository.js';
import { createTables, dropTables } from '../db/schema.js';
import { seedCategories } from '../db/seed.js';
import getDatabase from '../db/database.js';

describe('WaitTimeReportRepository', () => {
  let locationId;

  beforeEach(() => {
    dropTables();
    createTables();
    seedCategories();

    // Create a test location
    const db = getDatabase();
    const categories = db.prepare('SELECT id FROM categories LIMIT 1').all();
    const location = LocationRepository.create({
      name: 'Test Location',
      categoryId: categories[0].id
    });
    locationId = location.id;
  });

  describe('create', () => {
    test('creates a new report with all required fields', () => {
      const report = WaitTimeReportRepository.create({
        locationId: locationId,
        waitTimeMinutes: 15
      });

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.locationId).toBe(locationId);
      expect(report.waitTimeMinutes).toBe(15);
      expect(report.submittedAt).toBeDefined();
    });

    test('stores timestamp automatically', () => {
      const report = WaitTimeReportRepository.create({
        locationId: locationId,
        waitTimeMinutes: 20
      });

      // Verify timestamp exists and is a valid ISO date string
      expect(report.submittedAt).toBeDefined();
      expect(report.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      
      // Verify it can be parsed as a valid date
      const reportTime = new Date(report.submittedAt);
      expect(reportTime.toString()).not.toBe('Invalid Date');
    });
  });

  describe('findRecentByLocation', () => {
    test('returns reports within the time window', () => {
      // Create recent reports
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 15 });

      const reports = WaitTimeReportRepository.findRecentByLocation(locationId, 2);
      expect(reports).toHaveLength(2);
    });

    test('excludes old reports outside time window', () => {
      const db = getDatabase();
      
      // Create a recent report
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      
      // Create an old report (3 hours ago)
      db.prepare(`
        INSERT INTO wait_time_reports (locationId, waitTimeMinutes, submittedAt)
        VALUES (?, ?, datetime('now', '-3 hours'))
      `).run(locationId, 20);

      const reports = WaitTimeReportRepository.findRecentByLocation(locationId, 2);
      expect(reports).toHaveLength(1);
      expect(reports[0].waitTimeMinutes).toBe(10);
    });

    test('returns empty array when no reports exist', () => {
      const reports = WaitTimeReportRepository.findRecentByLocation(locationId, 2);
      expect(reports).toHaveLength(0);
    });

    test('orders reports by most recent first', () => {
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 20 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 30 });

      const reports = WaitTimeReportRepository.findRecentByLocation(locationId, 2);
      expect(reports[0].waitTimeMinutes).toBe(30);
      expect(reports[2].waitTimeMinutes).toBe(10);
    });
  });

  describe('calculateAverage', () => {
    test('calculates average of recent reports', () => {
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 20 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 30 });

      const average = WaitTimeReportRepository.calculateAverage(locationId, 2);
      expect(average).toBe(20); // (10 + 20 + 30) / 3 = 20
    });

    test('excludes old reports from average calculation', () => {
      const db = getDatabase();
      
      // Recent reports
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 20 });
      
      // Old report (3 hours ago)
      db.prepare(`
        INSERT INTO wait_time_reports (locationId, waitTimeMinutes, submittedAt)
        VALUES (?, ?, datetime('now', '-3 hours'))
      `).run(locationId, 100);

      const average = WaitTimeReportRepository.calculateAverage(locationId, 2);
      expect(average).toBe(15); // (10 + 20) / 2 = 15, not including 100
    });

    test('returns null when no reports exist', () => {
      const average = WaitTimeReportRepository.calculateAverage(locationId, 2);
      expect(average).toBeNull();
    });

    test('rounds average to nearest integer', () => {
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 11 });

      const average = WaitTimeReportRepository.calculateAverage(locationId, 2);
      expect(average).toBe(11); // 10.5 rounded to 11
    });
  });

  describe('countReports', () => {
    test('counts reports within time window', () => {
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 20 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 30 });

      const count = WaitTimeReportRepository.countReports(locationId, 2);
      expect(count).toBe(3);
    });

    test('excludes old reports from count', () => {
      const db = getDatabase();
      
      // Recent reports
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 10 });
      WaitTimeReportRepository.create({ locationId, waitTimeMinutes: 20 });
      
      // Old report (3 hours ago)
      db.prepare(`
        INSERT INTO wait_time_reports (locationId, waitTimeMinutes, submittedAt)
        VALUES (?, ?, datetime('now', '-3 hours'))
      `).run(locationId, 100);

      const count = WaitTimeReportRepository.countReports(locationId, 2);
      expect(count).toBe(2);
    });

    test('returns 0 when no reports exist', () => {
      const count = WaitTimeReportRepository.countReports(locationId, 2);
      expect(count).toBe(0);
    });
  });
});
