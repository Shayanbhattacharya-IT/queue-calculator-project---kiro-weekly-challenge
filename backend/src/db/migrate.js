import { createTables } from './schema.js';
import { seedCategories, seedSampleData } from './seed.js';
import { closeDatabase } from './database.js';

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Create tables
    createTables();
    
    // Seed initial data
    seedCategories();
    
    // Optionally seed sample data for development
    if (process.env.NODE_ENV !== 'production') {
      seedSampleData();
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export default migrate;
