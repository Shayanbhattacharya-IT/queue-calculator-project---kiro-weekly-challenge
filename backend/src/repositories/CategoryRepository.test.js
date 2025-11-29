import CategoryRepository from './CategoryRepository.js';
import { createTables, dropTables } from '../db/schema.js';
import { seedCategories } from '../db/seed.js';
import getDatabase from '../db/database.js';

describe('CategoryRepository', () => {
  beforeEach(() => {
    dropTables();
    createTables();
    seedCategories();
  });

  describe('findAll', () => {
    test('returns all categories ordered by displayOrder', () => {
      const categories = CategoryRepository.findAll();
      
      expect(categories).toHaveLength(6);
      expect(categories[0].name).toBe('Banks');
      expect(categories[0].displayOrder).toBe(1);
      expect(categories[5].name).toBe('Retail');
      expect(categories[5].displayOrder).toBe(6);
    });

    test('returns empty array when no categories exist', () => {
      dropTables();
      createTables();
      
      const categories = CategoryRepository.findAll();
      expect(categories).toHaveLength(0);
    });
  });

  describe('findById', () => {
    test('returns category when it exists', () => {
      const categories = CategoryRepository.findAll();
      const firstId = categories[0].id;
      
      const category = CategoryRepository.findById(firstId);
      
      expect(category).toBeDefined();
      expect(category.name).toBe('Banks');
      expect(category.id).toBe(firstId);
    });

    test('returns undefined when category does not exist', () => {
      const category = CategoryRepository.findById(999);
      expect(category).toBeUndefined();
    });
  });

  describe('exists', () => {
    test('returns true when category exists', () => {
      const categories = CategoryRepository.findAll();
      const firstId = categories[0].id;
      
      const exists = CategoryRepository.exists(firstId);
      expect(exists).toBe(true);
    });

    test('returns false when category does not exist', () => {
      const exists = CategoryRepository.exists(999);
      expect(exists).toBe(false);
    });

    test('returns false for null or undefined', () => {
      expect(CategoryRepository.exists(null)).toBe(false);
      expect(CategoryRepository.exists(undefined)).toBe(false);
    });
  });
});
