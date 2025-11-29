import LocationRepository from './LocationRepository.js';
import { createTables, dropTables } from '../db/schema.js';
import { seedCategories } from '../db/seed.js';
import getDatabase from '../db/database.js';

describe('LocationRepository', () => {
  let categoryId1, categoryId2;

  beforeEach(() => {
    dropTables();
    createTables();
    seedCategories();

    const db = getDatabase();
    const categories = db.prepare('SELECT id FROM categories ORDER BY displayOrder LIMIT 2').all();
    categoryId1 = categories[0].id;
    categoryId2 = categories[1].id;
  });

  describe('create', () => {
    test('creates a new location with valid data', () => {
      const location = LocationRepository.create({
        name: 'Test Bank',
        categoryId: categoryId1
      });

      expect(location).toBeDefined();
      expect(location.id).toBeDefined();
      expect(location.name).toBe('Test Bank');
      expect(location.categoryId).toBe(categoryId1);
      expect(location.isActive).toBe(1);
    });

    test('throws error when name already exists in same category', () => {
      LocationRepository.create({
        name: 'Duplicate Bank',
        categoryId: categoryId1
      });

      expect(() => {
        LocationRepository.create({
          name: 'Duplicate Bank',
          categoryId: categoryId1
        });
      }).toThrow('Location name already exists in this category');
    });

    test('allows same name in different categories', () => {
      LocationRepository.create({
        name: 'Quick Stop',
        categoryId: categoryId1
      });

      expect(() => {
        LocationRepository.create({
          name: 'Quick Stop',
          categoryId: categoryId2
        });
      }).not.toThrow();
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      LocationRepository.create({ name: 'Bank A', categoryId: categoryId1 });
      LocationRepository.create({ name: 'Bank B', categoryId: categoryId1 });
      LocationRepository.create({ name: 'Restaurant A', categoryId: categoryId2 });
    });

    test('returns all locations when no filters applied', () => {
      const locations = LocationRepository.findAll();
      expect(locations).toHaveLength(3);
    });

    test('filters by category', () => {
      const locations = LocationRepository.findAll({ categoryId: categoryId1 });
      expect(locations).toHaveLength(2);
      expect(locations.every(loc => loc.categoryId === categoryId1)).toBe(true);
    });

    test('filters by search query (case-insensitive)', () => {
      const locations = LocationRepository.findAll({ search: 'bank' });
      expect(locations).toHaveLength(2);
      expect(locations.every(loc => loc.name.toLowerCase().includes('bank'))).toBe(true);
    });

    test('applies both category and search filters', () => {
      const locations = LocationRepository.findAll({
        categoryId: categoryId1,
        search: 'Bank A'
      });
      expect(locations).toHaveLength(1);
      expect(locations[0].name).toBe('Bank A');
    });
  });

  describe('findActive', () => {
    test('returns only active locations', () => {
      const loc1 = LocationRepository.create({ name: 'Active Bank', categoryId: categoryId1 });
      const loc2 = LocationRepository.create({ name: 'Inactive Bank', categoryId: categoryId1 });

      // Mark one as inactive
      LocationRepository.update(loc2.id, { isActive: false });

      const activeLocations = LocationRepository.findActive();
      expect(activeLocations).toHaveLength(1);
      expect(activeLocations[0].id).toBe(loc1.id);
    });
  });

  describe('findById', () => {
    test('returns location when it exists', () => {
      const created = LocationRepository.create({
        name: 'Test Location',
        categoryId: categoryId1
      });

      const found = LocationRepository.findById(created.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Test Location');
    });

    test('returns undefined when location does not exist', () => {
      const found = LocationRepository.findById(999);
      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    test('updates location name', () => {
      const location = LocationRepository.create({
        name: 'Old Name',
        categoryId: categoryId1
      });

      const updated = LocationRepository.update(location.id, {
        name: 'New Name'
      });

      expect(updated.name).toBe('New Name');
      expect(updated.categoryId).toBe(categoryId1);
    });

    test('updates location category', () => {
      const location = LocationRepository.create({
        name: 'Test Location',
        categoryId: categoryId1
      });

      const updated = LocationRepository.update(location.id, {
        categoryId: categoryId2
      });

      expect(updated.categoryId).toBe(categoryId2);
    });

    test('updates isActive status', () => {
      const location = LocationRepository.create({
        name: 'Test Location',
        categoryId: categoryId1
      });

      const updated = LocationRepository.update(location.id, {
        isActive: false
      });

      expect(updated.isActive).toBe(0);
    });

    test('preserves associated reports when updating', () => {
      const db = getDatabase();
      const location = LocationRepository.create({
        name: 'Test Location',
        categoryId: categoryId1
      });

      // Add a wait time report
      db.prepare('INSERT INTO wait_time_reports (locationId, waitTimeMinutes) VALUES (?, ?)').run(location.id, 15);

      // Update location
      LocationRepository.update(location.id, { name: 'Updated Name' });

      // Check report still exists
      const reports = db.prepare('SELECT * FROM wait_time_reports WHERE locationId = ?').all(location.id);
      expect(reports).toHaveLength(1);
      expect(reports[0].waitTimeMinutes).toBe(15);
    });

    test('throws error when location not found', () => {
      expect(() => {
        LocationRepository.update(999, { name: 'New Name' });
      }).toThrow('Location not found');
    });

    test('throws error on name conflict in same category', () => {
      LocationRepository.create({ name: 'Bank A', categoryId: categoryId1 });
      const loc2 = LocationRepository.create({ name: 'Bank B', categoryId: categoryId1 });

      expect(() => {
        LocationRepository.update(loc2.id, { name: 'Bank A' });
      }).toThrow('Location name already exists in this category');
    });
  });
});
