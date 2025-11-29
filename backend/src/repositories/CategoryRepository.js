import getDatabase from '../db/database.js';

class CategoryRepository {
  /**
   * Retrieve all categories ordered by displayOrder
   * @returns {Array<Category>} Array of category objects
   */
  findAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM categories ORDER BY displayOrder');
    return stmt.all();
  }

  /**
   * Get a specific category by ID
   * @param {number} id - Category ID
   * @returns {Category|undefined} Category object or undefined if not found
   */
  findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Check if a category exists
   * @param {number} id - Category ID
   * @returns {boolean} True if category exists, false otherwise
   */
  exists(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE id = ?');
    const result = stmt.get(id);
    return result.count > 0;
  }
}

export default new CategoryRepository();
