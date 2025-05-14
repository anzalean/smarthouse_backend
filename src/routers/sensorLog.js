import { Router } from 'express';
import SensorLogService from '../services/SensorLogService.js';

const router = Router();

/**
 * @route GET /api/logs/sensor
 * @desc Get sensor logs with time period filter
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const {
      sensorId,
      homeId,
      period = 'day', // Default period is day (24 hours)
      sensorType,
      limit = 100,
      skip = 0,
    } = req.query;

    if (!homeId && !sensorId) {
      return res.status(400).json({
        success: false,
        message: 'Either homeId or sensorId is required',
      });
    }

    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        // Get the first day of the current month
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }

    const options = {
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      startDate,
      endDate,
      sensorType,
    };

    let logs;
    if (sensorId) {
      logs = await SensorLogService.getLogsBySensorId(sensorId, options);
    } else {
      logs = await SensorLogService.getLogsByHomeId(homeId, options);
    }

    return res.status(200).json({
      success: true,
      data: logs,
      count: logs.length,
      pagination: {
        limit: options.limit,
        skip: options.skip,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route GET /api/logs/sensor/:id
 * @desc Get a sensor log by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = await SensorLogService.getLogById(id);

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
