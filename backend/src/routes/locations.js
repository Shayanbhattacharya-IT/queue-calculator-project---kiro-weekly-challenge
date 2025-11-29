import express from 'express';
import { getAggregatedLocationData } from '../services/aggregationService.js';
import LocationRepository from '../repositories/LocationRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';
import { validateLocationData } from '../utils/validation.js';

const router = express.Router();

/**
 * GET /api/locations
 * Get all locations with aggregated wait time data
 * Query params: category (number), search (string)
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const filters = {
      activeOnly: true
    };

    if (category) {
      filters.categoryId = parseInt(category, 10);
      if (isNaN(filters.categoryId)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category must be a valid number'
          }
        });
      }
    }

    if (search) {
      filters.search = search;
    }

    const locations = await getAggregatedLocationData(filters);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch locations'
      }
    });
  }
});

/**
 * POST /api/locations
 * Create a new location (admin)
 */
router.post('/', async (req, res) => {
  try {
    const validation = validateLocationData(req.body, false);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid location data',
          details: validation.errors
        }
      });
    }

    // Check if category exists
    const categoryExists = CategoryRepository.exists(validation.validatedData.categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Category does not exist'
        }
      });
    }

    const location = LocationRepository.create(validation.validatedData);
    res.status(201).json(location);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_LOCATION',
          message: error.message
        }
      });
    }

    console.error('Error creating location:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create location'
      }
    });
  }
});

/**
 * PUT /api/locations/:id
 * Update a location (admin)
 */
router.put('/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id, 10);
    
    if (isNaN(locationId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Location ID must be a valid number'
        }
      });
    }

    const validation = validateLocationData(req.body, true);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid location data',
          details: validation.errors
        }
      });
    }

    // Check if category exists (if being updated)
    if (validation.validatedData.categoryId) {
      const categoryExists = CategoryRepository.exists(validation.validatedData.categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CATEGORY',
            message: 'Category does not exist'
          }
        });
      }
    }

    const location = LocationRepository.update(locationId, validation.validatedData);
    res.json(location);
  } catch (error) {
    if (error.message === 'Location not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Location not found'
        }
      });
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_LOCATION',
          message: error.message
        }
      });
    }

    console.error('Error updating location:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update location'
      }
    });
  }
});

export default router;
