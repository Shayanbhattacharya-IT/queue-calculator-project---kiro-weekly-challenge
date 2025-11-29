import express from 'express';
import CategoryRepository from '../repositories/CategoryRepository.js';

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', (req, res) => {
  try {
    const categories = CategoryRepository.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch categories'
      }
    });
  }
});

export default router;
