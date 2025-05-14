import express from 'express';
import { EmulatorService } from '../emulator/index.js';
import { authenticate } from '../middlewares/auth.js';
import { SensorRepository, DeviceRepository } from '../repositories/index.js';

const router = express.Router();

// Get the current emulation status
router.get('/status', authenticate, async (req, res) => {
  try {
    const status = await EmulatorService.getEmulationStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configure device emulation
router.post('/device/:deviceId', authenticate, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { enabled } = req.body;

    const result = await EmulatorService.deviceEmulator.configureDevice({
      deviceId,
      enabled: enabled !== undefined ? enabled : true,
    });

    if (result) {
      res.json({
        success: true,
        message:
          enabled !== false
            ? 'Device emulation started'
            : 'Device emulation stopped',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Device not found or operation failed',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Control a device
router.post('/device/:deviceId/control', authenticate, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action, parameters } = req.body;

    if (!action) {
      return res
        .status(400)
        .json({ success: false, message: 'Action is required' });
    }

    const result = await EmulatorService.deviceEmulator.controlDevice(
      deviceId,
      action,
      parameters
    );

    if (result) {
      res.json({
        success: true,
        message: `Device ${deviceId} action "${action}" executed successfully`,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Device not found or operation failed',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start emulation for all sensors and devices in a home
router.post('/home/:homeId/start', authenticate, async (req, res) => {
  try {
    const { homeId } = req.params;
    const { updateInterval } = req.body;

    // Find all sensors and devices for this home
    const sensors = await SensorRepository.find({ homeId, isActive: true });
    const devices = await DeviceRepository.find({ homeId, isActive: true });

    if (sensors.length === 0 && devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active sensors or devices found for this home',
      });
    }

    // Track success of operations
    const results = {
      sensors: { total: sensors.length, success: 0, failed: 0 },
      devices: { total: devices.length, success: 0, failed: 0 },
    };

    // Start batch updates for all sensors
    try {
      await EmulatorService.configureBatchUpdates({
        enabled: true,
        updateInterval: updateInterval || 3600000, // Default 1 hour
      });

      // Consider all sensors as successfully started in batch mode
      results.sensors.success = sensors.length;
    } catch (err) {
      console.error('Error starting batch updates:', err);
      results.sensors.failed = sensors.length;
    }

    // Start emulation for each device
    for (const device of devices) {
      try {
        const success = await EmulatorService.deviceEmulator.configureDevice({
          deviceId: device._id,
          enabled: true,
        });

        if (success) {
          results.devices.success++;
        } else {
          results.devices.failed++;
        }
      } catch (err) {
        console.error(`Error configuring device ${device._id}:`, err);
        results.devices.failed++;
      }
    }

    res.json({
      success: true,
      message: 'Emulation started for devices and sensors in the home',
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start all emulation
router.post('/start-all', authenticate, async (req, res) => {
  try {
    const { updateInterval } = req.body;

    const result = await EmulatorService.startAll({
      updateInterval: updateInterval || 3600000, // Default to 1 hour
    });

    res.json({
      success: true,
      message: 'All emulation started',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop all emulation
router.post('/stop-all', authenticate, async (req, res) => {
  try {
    await EmulatorService.stopAll();
    res.json({ success: true, message: 'All emulation stopped' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configure batch updates
router.post('/batch-updates', authenticate, async (req, res) => {
  try {
    const { enabled, updateInterval } = req.body;

    const result = await EmulatorService.configureBatchUpdates({
      enabled: enabled !== false, // Default to true
      updateInterval: updateInterval || 3600000, // Default to 1 hour
    });

    res.json({
      success: true,
      message:
        enabled !== false
          ? `Batch updates enabled with interval of ${updateInterval || 3600000}ms`
          : 'Batch updates disabled',
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Trigger immediate update of all sensors
router.post('/update-now', authenticate, async (req, res) => {
  try {
    await EmulatorService.triggerImmediateUpdate();
    res.json({
      success: true,
      message: 'Immediate update of all sensors triggered',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
