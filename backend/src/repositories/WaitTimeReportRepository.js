import getDatabase from '../db/database.js';

class WaitTimeReportRepository {
  /**
   * Create a new wait time report
   * @param {Object} reportData - Report data
   * @param {number} reportData.locationId - Location ID
   * @param {number} reportData.waitTimeMinutes - Wait time in minutes
   * @returns {WaitTimeReport} Created report with ID and timestamp
   */
  create(reportData) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO wait_time_reports (locationId, waitTimeMinutes)
      VALUES (?, ?)
    `);

    const result = stmt.run(reportData.locationId, reportData.waitTimeMinutes);
    
    // Return the created report
    return db.prepare('SELECT * FROM wait_time_reports WHERE id = ?').get(result.lastInsertRowid);
  }

  /**
   * Find recent reports for a location within a time window
   * @param {number} locationId - Location ID
   * @param {number} hoursBack - Number of hours to look back (default: 2)
   * @returns {Array<WaitTimeReport>} Array of recent reports
   */
  findRecentByLocation(locationId, hoursBack = 2) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM wait_time_reports
      WHERE locationId = ?
        AND submittedAt >= datetime('now', '-' || ? || ' hours')
      ORDER BY submittedAt DESC
    `);

    return stmt.all(locationId, hoursBack);
  }

  /**
   * Calculate average wait time for a location within a time window
   * @param {number} locationId - Location ID
   * @param {number} hoursBack - Number of hours to look back (default: 2)
   * @returns {number|null} Average wait time in minutes, or null if no reports
   */
  calculateAverage(locationId, hoursBack = 2) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT AVG(waitTimeMinutes) as average
      FROM wait_time_reports
      WHERE locationId = ?
        AND submittedAt >= datetime('now', '-' || ? || ' hours')
    `);

    const result = stmt.get(locationId, hoursBack);
    return result.average !== null ? Math.round(result.average) : null;
  }

  /**
   * Count reports for a location within a time window
   * @param {number} locationId - Location ID
   * @param {number} hoursBack - Number of hours to look back (default: 2)
   * @returns {number} Number of reports
   */
  countReports(locationId, hoursBack = 2) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM wait_time_reports
      WHERE locationId = ?
        AND submittedAt >= datetime('now', '-' || ? || ' hours')
    `);

    const result = stmt.get(locationId, hoursBack);
    return result.count;
  }
}

export default new WaitTimeReportRepository();
