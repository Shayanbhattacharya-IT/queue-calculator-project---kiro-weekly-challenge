import express from 'express';
import WaitTimeReportRepository from '../repositories/WaitTimeReportRepository.js';
import LocationRepository from '../repositories/LocationRepository.js';
import { validateReportSubmission } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/reports
 * Submit a new wait time report
 */
router.post('/', (req, res) => {
  try {
    const validation = validateReportSubmission(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report data',
          details: validation.errors
        }
      });
    }

    // Check if location exists
    const location = LocationRepository.findById(validation.validatedData.locationId);
    if (!location) {
      return res.status(404).json({
        error: {
          code: 'LOCATION_NOT_FOUND',
          message: 'Location does not exist'
        }
      });
    }

    const report = WaitTimeReportRepository.create(validation.validatedData);
    
    res.status(201).json({
      success: true,
      reportId: report.id,
      message: 'Wait time report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit report'
      }
    });
  }
});

export default router;
