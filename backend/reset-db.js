import { dropTables, createTables } from './src/db/schema.js';
import { seedCategories, seedSampleData } from './src/db/seed.js';
import { createQueueTables } from './src/db/queueSchema.js';
import { closeDatabase } from './src/db/database.js';

console.log('Resetting database...');

// Drop all tables
dropTables();

// Recreate tables
createTables();
createQueueTables();

// Seed data
seedCategories();
seedSampleData();

console.log('Database reset complete!');

// Close database connection
closeDatabase();
