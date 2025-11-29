import getDatabase from './database.js';

export function createTables() {
  const db = getDatabase();

  // Create Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      displayOrder INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Create Locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      state TEXT,
      city TEXT,
      address TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      UNIQUE(name, categoryId, state)
    )
  `);

  // Create WaitTimeReports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wait_time_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      locationId INTEGER NOT NULL,
      waitTimeMinutes INTEGER NOT NULL,
      submittedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (locationId) REFERENCES locations(id)
    )
  `);

  // Create indexes for efficient querying
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_submitted_at 
    ON wait_time_reports(submittedAt)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_location_id 
    ON wait_time_reports(locationId)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reports_location_submitted 
    ON wait_time_reports(locationId, submittedAt)
  `);

  console.log('Database tables created successfully');
}

export function dropTables() {
  const db = getDatabase();
  
  db.exec('DROP TABLE IF EXISTS wait_time_reports');
  db.exec('DROP TABLE IF EXISTS locations');
  db.exec('DROP TABLE IF EXISTS categories');
  
  console.log('Database tables dropped');
}

export default createTables;
