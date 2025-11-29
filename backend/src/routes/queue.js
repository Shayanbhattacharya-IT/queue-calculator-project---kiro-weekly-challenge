import express from 'express';
import QueueRepository from '../repositories/QueueRepository.js';
import WaitTimeReportRepository from '../repositories/WaitTimeReportRepository.js';

const router = express.Router();

/**
 * POST /api/queue/join
 * Join a queue at a location
 */
router.post('/join', (req, res) => {
  try {
    const { locationId, userId } = req.body;
    
    if (!locationId || !userId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Location ID and User ID are required'
        }
      });
    }
    
    // Get estimated wait time from recent reports
    const estimatedWaitTime = WaitTimeReportRepository.calculateAverage(locationId, 2) || 15;
    
    const queueEntry = QueueRepository.joinQueue({
      locationId: parseInt(locationId, 10),
      userId,
      estimatedWaitTime
    });
    
    res.status(201).json({
      success: true,
      queueEntry,
      message: `You are #${queueEntry.queuePosition} in queue. Estimated wait: ${queueEntry.estimatedWaitTime} minutes`
    });
  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to join queue'
      }
    });
  }
});

/**
 * GET /api/queue/status/:userId
 * Get user's queue status
 */
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const queues = QueueRepository.getUserQueues(userId);
    
    // Calculate time remaining for each queue
    const queuesWithTimeRemaining = queues.map(queue => {
      const joinedTime = new Date(queue.joinedAt);
      const now = new Date();
      const elapsedMinutes = Math.floor((now - joinedTime) / 1000 / 60);
      const remainingMinutes = Math.max(0, queue.estimatedWaitTime - elapsedMinutes);
      
      return {
        ...queue,
        elapsedMinutes,
        remainingMinutes,
        shouldNotify: remainingMinutes <= 5 && !queue.notifiedAt
      };
    });
    
    res.json(queuesWithTimeRemaining);
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get queue status'
      }
    });
  }
});

/**
 * POST /api/queue/complete/:entryId
 * Mark queue entry as complete
 */
router.post('/complete/:entryId', (req, res) => {
  try {
    const { entryId } = req.params;
    
    QueueRepository.completeEntry(parseInt(entryId, 10));
    
    res.json({
      success: true,
      message: 'Queue entry completed'
    });
  } catch (error) {
    console.error('Error completing queue entry:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to complete queue entry'
      }
    });
  }
});

/**
 * GET /api/queue/length/:locationId
 * Get current queue length at a location
 */
router.get('/length/:locationId', (req, res) => {
  try {
    const { locationId } = req.params;
    
    const length = QueueRepository.getQueueLength(parseInt(locationId, 10));
    
    res.json({
      locationId: parseInt(locationId, 10),
      queueLength: length
    });
  } catch (error) {
    console.error('Error getting queue length:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get queue length'
      }
    });
  }
});

export default router;
