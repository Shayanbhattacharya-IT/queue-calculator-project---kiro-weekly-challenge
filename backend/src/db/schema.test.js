import { createTables, dropTables } from './schema.js';
import { seedCategories } from './seed.js';
import getDatabase from './database.js';

describe('Database Schema', () => {
  beforeEach(() => {
    dropTables();
    createTables();
  });

  test('creates all required tables', () => {
    const db = getDatabase();
    
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    const tableNames = tables.map(t => t.name);
    
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('locations');
    expect(tableNames).toContain('wait_time_reports');
  });

  test('creates required indexes', () => {
    const db = getDatabase();
    
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name LIKE 'idx_%'
    `).all();
    
    const indexNames = indexes.map(i => i.name);
    
    expect(indexNames).toContain('idx_reports_submitted_at');
    expect(indexNames).toContain('idx_reports_location_id');
    expect(indexNames).toContain('idx_reports_location_submitted');
  });

  test('seeds categories successfully', () => {
    const db = getDatabase();
    seedCategories();
    
    const categories = db.prepare('SELECT * FROM categories ORDER BY displayOrder').all();
    
    expect(categories.length).toBe(6);
    expect(categories[0].name).toBe('Banks');
    expect(categories[1].name).toBe('Restaurants');
    expect(categories[2].name).toBe('Events');
    expect(categories[3].name).toBe('Healthcare');
    expect(categories[4].name).toBe('Government Services');
    expect(categories[5].name).toBe('Retail');
  });

  test('enforces foreign key constraints', () => {
    const db = getDatabase();
    
    // Try to insert location with non-existent category
    expect(() => {
      db.prepare('INSERT INTO locations (name, categoryId) VALUES (?, ?)').run('Test Location', 999);
    }).toThrow();
  });

  test('enforces unique constraint on location name within category', () => {
    const db = getDatabase();
    seedCategories();
    
    // Insert first location
    db.prepare('INSERT INTO locations (name, categoryId) VALUES (?, ?)').run('Test Bank', 1);
    
    // Try to insert duplicate in same category
    expect(() => {
      db.prepare('INSERT INTO locations (name, categoryId) VALUES (?, ?)').run('Test Bank', 1);
    }).toThrow();
  });

  test('allows same location name in different categories', () => {
    const db = getDatabase();
    seedCategories();
    
    // Insert location in category 1
    db.prepare('INSERT INTO locations (name, categoryId) VALUES (?, ?)').run('Quick Stop', 1);
    
    // Insert same name in category 2 - should succeed
    expect(() => {
      db.prepare('INSERT INTO locations (name, categoryId) VALUES (?, ?)').run('Quick Stop', 2);
    }).not.toThrow();
  });
});
