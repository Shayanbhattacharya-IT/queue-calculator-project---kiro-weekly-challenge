import express from 'express';
import cors from 'cors';
import { createTables } from './db/schema.js';
import { seedCategories, seedSampleData } from './db/seed.js';
import { createQueueTables } from './db/queueSchema.js';
import locationsRouter from './routes/locations.js';
import categoriesRouter from './routes/categories.js';
import reportsRouter from './routes/reports.js';
import queueRouter from './routes/queue.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
createTables();
createQueueTables();
seedCategories();
seedSampleData();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/locations', locationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/queue', queueRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Quick Queue API running on port ${PORT}`);
});

export default app;
