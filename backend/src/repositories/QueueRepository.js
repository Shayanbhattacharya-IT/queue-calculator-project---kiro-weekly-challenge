import getDatabase from '../db/database.js';

class QueueRepository {
  /**
   * Join a queue at a location
   * @param {Object} queueData
   * @param {number} queueData.locationId
   * @param {string} queueData.userId
   * @param {number} queueData.estimatedWaitTime
   * @returns {Object} Queue entry with position
   */
  joinQueue(queueData) {
    const db = getDatabase();
    
    // Get current queue position (count of waiting entries + 1)
    const positionResult = db.prepare(`
      SELECT COUNT(*) + 1 as position
      FROM queue_entries
      WHERE locationId = ? AND status = 'waiting'
    `).get(queueData.locationId);
    
    const queuePosition = positionResult.position;
    
    const stmt = db.prepare(`
      INSERT INTO queue_entries (locationId, userId, queuePosition, estimatedWaitTime)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      queueData.locationId,
      queueData.userId,
      queuePosition,
      queueData.estimatedWaitTime
    );
    
    return {
      id: result.lastInsertRowid,
      queuePosition,
      estimatedWaitTime: queueData.estimatedWaitTime,
      joinedAt: new Date().toISOString()
    };
  }

  /**
   * Get user's queue status
   * @param {string} userId
   * @returns {Array} Active queue entries for user
   */
  getUserQueues(userId) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT qe.*, l.name as locationName, l.state, l.city
      FROM queue_entries qe
      JOIN locations l ON qe.locationId = l.id
      WHERE qe.userId = ? AND qe.status = 'waiting'
      ORDER BY qe.joinedAt DESC
    `);
    
    return stmt.all(userId);
  }

  /**
   * Get queue entries that need notification
   * @param {number} minutesBefore - Minutes before estimated time to notify
   * @returns {Array} Entries needing notification
   */
  getEntriesNeedingNotification(minutesBefore = 5) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT qe.*, l.name as locationName
      FROM queue_entries qe
      JOIN locations l ON qe.locationId = l.id
      WHERE qe.status = 'waiting'
        AND qe.notifiedAt IS NULL
        AND datetime(qe.joinedAt, '+' || (qe.estimatedWaitTime - ?) || ' minutes') <= datetime('now')
    `);
    
    return stmt.all(minutesBefore);
  }

  /**
   * Mark entry as notified
   * @param {number} entryId
   */
  markAsNotified(entryId) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE queue_entries
      SET notifiedAt = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(entryId);
  }

  /**
   * Complete a queue entry
   * @param {number} entryId
   */
  completeEntry(entryId) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE queue_entries
      SET status = 'completed', completedAt = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(entryId);
  }

  /**
   * Get current queue position for a location
   * @param {number} locationId
   * @returns {number} Number of people waiting
   */
  getQueueLength(locationId) {
    const db = getDatabase();
    
    const result = db.prepare(`
      SELECT COUNT(*) as count
      FROM queue_entries
      WHERE locationId = ? AND status = 'waiting'
    `).get(locationId);
    
    return result.count;
  }

  /**
   * Update queue positions when someone leaves
   * @param {number} locationId
   */
  updateQueuePositions(locationId) {
    const db = getDatabase();
    
    // Get all waiting entries for this location
    const entries = db.prepare(`
      SELECT id FROM queue_entries
      WHERE locationId = ? AND status = 'waiting'
      ORDER BY joinedAt ASC
    `).all(locationId);
    
    // Update positions
    const updateStmt = db.prepare(`
      UPDATE queue_entries SET queuePosition = ? WHERE id = ?
    `);
    
    const updateMany = db.transaction((entries) => {
      entries.forEach((entry, index) => {
        updateStmt.run(index + 1, entry.id);
      });
    });
    
    updateMany(entries);
  }
}

export default new QueueRepository();
