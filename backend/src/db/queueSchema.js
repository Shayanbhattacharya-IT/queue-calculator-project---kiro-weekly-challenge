import getDatabase from './database.js';

export function createQueueTables() {
  const db = getDatabase();

  // Create Queue Entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS queue_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      locationId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      queuePosition INTEGER NOT NULL,
      estimatedWaitTime INTEGER NOT NULL,
      joinedAt TEXT NOT NULL DEFAULT (datetime('now')),
      notifiedAt TEXT,
      completedAt TEXT,
      status TEXT NOT NULL DEFAULT 'waiting',
      FOREIGN KEY (locationId) REFERENCES locations(id)
    )
  `);

  // Create index for efficient queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_queue_location_status 
    ON queue_entries(locationId, status)
  `);

  console.log('Queue tables created successfully');
}

export function dropQueueTables() {
  const db = getDatabase();
  db.exec('DROP TABLE IF EXISTS queue_entries');
  console.log('Queue tables dropped');
}
