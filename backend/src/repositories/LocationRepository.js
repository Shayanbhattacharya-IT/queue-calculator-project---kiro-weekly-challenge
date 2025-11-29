import getDatabase from '../db/database.js';

class LocationRepository {
  /**
   * Retrieve all locations with optional filtering
   * @param {Object} filters - Optional filters
   * @param {number} filters.categoryId - Filter by category ID
   * @param {string} filters.search - Search by location name (case-insensitive)
   * @returns {Array<Location>} Array of location objects
   */
  findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];

    if (filters.categoryId) {
      query += ' AND categoryId = ?';
      params.push(filters.categoryId);
    }

    if (filters.search) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY name';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get only active (non-deleted) locations
   * @returns {Array<Location>} Array of active location objects
   */
  findActive() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM locations WHERE isActive = 1 ORDER BY name');
    return stmt.all();
  }

  /**
   * Get a specific location by ID
   * @param {number} id - Location ID
   * @returns {Location|undefined} Location object or undefined if not found
   */
  findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM locations WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Create a new location
   * @param {Object} locationData - Location data
   * @param {string} locationData.name - Location name
   * @param {number} locationData.categoryId - Category ID
   * @returns {Location} Created location with ID
   * @throws {Error} If name already exists in category or category doesn't exist
   */
  create(locationData) {
    const db = getDatabase();

    // Check for duplicate name in same category and state
    const existing = db.prepare(
      'SELECT id FROM locations WHERE name = ? AND categoryId = ? AND state = ?'
    ).get(locationData.name, locationData.categoryId, locationData.state || null);

    if (existing) {
      throw new Error('Location name already exists in this category and state');
    }

    const stmt = db.prepare(`
      INSERT INTO locations (name, categoryId, state, city, address)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      locationData.name, 
      locationData.categoryId,
      locationData.state || null,
      locationData.city || null,
      locationData.address || null
    );
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Update a location
   * @param {number} id - Location ID
   * @param {Object} locationData - Updated location data
   * @param {string} locationData.name - Location name
   * @param {number} locationData.categoryId - Category ID
   * @param {boolean} locationData.isActive - Active status
   * @returns {Location} Updated location
   * @throws {Error} If location not found or name conflict
   */
  update(id, locationData) {
    const db = getDatabase();

    // Check if location exists
    const existing = this.findById(id);
    if (!existing) {
      throw new Error('Location not found');
    }

    // Check for name conflict if name or category is changing
    if (locationData.name || locationData.categoryId) {
      const newName = locationData.name || existing.name;
      const newCategoryId = locationData.categoryId || existing.categoryId;

      const conflict = db.prepare(
        'SELECT id FROM locations WHERE name = ? AND categoryId = ? AND id != ?'
      ).get(newName, newCategoryId, id);

      if (conflict) {
        throw new Error('Location name already exists in this category');
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (locationData.name !== undefined) {
      updates.push('name = ?');
      params.push(locationData.name);
    }

    if (locationData.categoryId !== undefined) {
      updates.push('categoryId = ?');
      params.push(locationData.categoryId);
    }

    if (locationData.isActive !== undefined) {
      updates.push('isActive = ?');
      params.push(locationData.isActive ? 1 : 0);
    }

    updates.push("updatedAt = datetime('now')");
    params.push(id);

    const stmt = db.prepare(`
      UPDATE locations
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);
    return this.findById(id);
  }
}

export default new LocationRepository();
