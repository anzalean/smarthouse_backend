import { DeviceRepository } from '../repositories/index.js';
import { DeviceLogService } from '../services/index.js';

class DeviceEmulator {
  constructor(websocketManager) {
    this.websocketManager = websocketManager;
    this.activeDevices = new Map();
    this.jobIntervalId = null;
    this.updateInterval = 3600000; // Default: update every hour (in ms)
  }

  async configureDevice(config) {
    const { deviceId, enabled } = config;

    if (enabled) {
      // Already active
      if (this.activeDevices.has(deviceId)) {
        return true;
      }

      const device = await DeviceRepository.findById(deviceId);
      if (!device) {
        console.error(`Device not found: ${deviceId}`);
        return false;
      }

      // Store device configuration
      this.activeDevices.set(deviceId, {
        device,
        lastUpdate: new Date(),
      });

      console.log(
        `Started emulation for device ${deviceId} (${device.deviceType})`
      );

      // Notify UI that this device is now being emulated
      this.websocketManager.emit('device:status', {
        deviceId: device._id.toString(),
        deviceType: device.deviceType,
        isEmulated: true,
        isActive: device.isActive,
        currentLoad: device.currentLoad,
      });

      return true;
    } else {
      return this.stopDevice(deviceId);
    }
  }

  stopDevice(deviceId) {
    if (!this.activeDevices.has(deviceId)) {
      return false;
    }

    const deviceConfig = this.activeDevices.get(deviceId);

    // Remove from active devices
    this.activeDevices.delete(deviceId);

    console.log(`Stopped emulation for device ${deviceId}`);

    // Notify UI that this device is no longer being emulated
    this.websocketManager.emit('device:status', {
      deviceId: deviceConfig.device._id.toString(),
      deviceType: deviceConfig.device.deviceType,
      isEmulated: false,
    });

    return true;
  }

  /**
   * Start batch update job for all devices
   * @param {Number} interval - Update interval in milliseconds (default: 1 hour)
   */
  startBatchUpdates(interval = 3600000) {
    if (this.jobIntervalId) {
      clearInterval(this.jobIntervalId);
    }

    this.updateInterval = interval;
    this.jobIntervalId = setInterval(() => this.updateAllDevices(), interval);
    console.log(
      `Started batch device updates every ${interval / 1000} seconds`
    );

    // Run immediately for first update
    this.updateAllDevices();

    return true;
  }

  /**
   * Stop batch update job
   */
  stopBatchUpdates() {
    if (this.jobIntervalId) {
      clearInterval(this.jobIntervalId);
      this.jobIntervalId = null;
      console.log('Stopped batch device updates');
      return true;
    }
    return false;
  }

  /**
   * Update all devices in the database
   * This is primarily for updating smart plug load data
   */
  async updateAllDevices() {
    try {
      // First, let's check all devices regardless of type
      const allDevices = await DeviceRepository.find({});

      // Log device types distribution
      const deviceTypes = allDevices.reduce((acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      }, {});

      // Now check active devices
      const activeDevices = await DeviceRepository.find({ isActive: true });

      // Log active device types
      const activeDeviceTypes = activeDevices.reduce((acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      }, {});

      // Get all smart plugs
      const smartPlugs = await DeviceRepository.find({
        deviceType: 'smart_plug',
        isActive: true,
      });

      if (smartPlugs.length === 0) {
        return;
      }

      // Prepare batch of updates
      const updates = [];
      const logs = [];
      const websocketUpdates = [];
      const now = new Date();

      // Import Room model to get room types
      const { default: Room } = await import('../models/Room.js');

      // Process each smart plug
      for (const device of smartPlugs) {
        try {
          // Get the room type for this device
          let roomType = 'custom';
          if (device.roomId) {
            const room = await Room.findById(device.roomId);
            if (room) {
              roomType = room.type;
            }
          }

          // Check if the device is on or off
          const isOn = device.isActive;

          // Generate new load value
          const currentLoad = this.generateSmartPlugLoad(device, {
            roomType,
            isOn,
          });

          // Skip update if the load hasn't changed significantly
          const previousLoad = device.currentLoad || 0;
          const loadDiff = Math.abs(currentLoad - previousLoad);
          const significantChange =
            loadDiff > previousLoad * 0.1 || loadDiff > 10;

          if (!significantChange && device.lastUpdate) {
            continue;
          }

          // Create log entry
          logs.push({
            homeId: device.homeId,
            roomId: device.roomId,
            deviceType: device.deviceType,
            deviceId: device._id,
            type: 'power_change',
            timestamp: now,
            currentLoad: currentLoad,
            success: true,
            details: {
              unit: 'W',
              previousLoad: previousLoad,
              loadChange: currentLoad - previousLoad,
            },
          });

          // Prepare database update
          updates.push({
            updateOne: {
              filter: { _id: device._id },
              update: {
                $set: {
                  currentLoad,
                  lastUpdate: now,
                },
              },
            },
          });

          // Prepare websocket update
          websocketUpdates.push({
            deviceId: device._id.toString(),
            deviceType: device.deviceType,
            homeId: device.homeId.toString(),
            roomId: device.roomId ? device.roomId.toString() : null,
            isActive: device.isActive,
            currentLoad,
            timestamp: now,
          });
        } catch (err) {
          console.error(`Error processing device ${device._id}:`, err);
        }
      }

      // Execute batch updates if we have any
      if (updates.length > 0) {
        await DeviceRepository.bulkWrite(updates);
      }

      // Create logs in batch
      if (logs.length > 0) {
        for (const log of logs) {
          await DeviceLogService.createLog(log);
        }
      }

      // Send websocket updates
      if (websocketUpdates.length > 0) {
        this.websocketManager.emit('devices:batch-update', websocketUpdates);
      }
    } catch (error) {
      console.error('Error in batch device update:', error);
    }
  }

  async controlDevice(deviceId, action, parameters = {}) {
    // Get device, whether it's being emulated or not
    let deviceConfig = this.activeDevices.get(deviceId);
    let device;

    if (deviceConfig) {
      device = deviceConfig.device;
    } else {
      // If not in active devices, try to get from DB
      device = await DeviceRepository.findById(deviceId);
      if (!device) {
        console.error(`Device not found: ${deviceId}`);
        return false;
      }
    }

    // Store the previous state for logging
    const previousState = { ...device };

    try {
      // Apply the action to the device
      const newState = await this.applyAction(device, action, parameters);

      // Log the action
      await DeviceLogService.createLog({
        homeId: device.homeId,
        roomId: device.roomId,
        deviceType: device.deviceType,
        deviceId: device._id,
        type: 'state_change',
        action,
        previousState,
        newState,
        success: true,
        timestamp: new Date(),
        ...(device.deviceType === 'smart_plug' && {
          currentLoad: device.currentLoad,
        }),
        ...(device.deviceType === 'thermostat' && {
          currentTemperature: device.currentTemperature,
          currentMode: device.mode,
        }),
        ...(device.deviceType === 'smart_lock' && {
          currentDoorState: device.doorState,
        }),
        ...(device.deviceType === 'gate' && {
          currentPosition: device.position,
        }),
        ...(device.deviceType === 'irrigation_system' && {
          currentWaterFlow: device.waterFlow,
        }),
        ...(device.deviceType === 'ventilation' && {
          currentVentilationMode: device.mode,
          currentFanSpeed: device.fanSpeed,
          currentAirflow: device.airflow,
        }),
        ...(device.deviceType === 'air_purifier' && {
          currentPurifierMode: device.mode,
          currentPurifierFanSpeed: device.fanSpeed,
          currentPM25: device.pm25,
          currentPM10: device.pm10,
        }),
        ...(device.deviceType === 'camera' && {
          currentResolutionWidth: device.resolutionWidth,
          currentResolutionHeight: device.resolutionHeight,
        }),
        ...(device.deviceType === 'smart_light' && {
          currentBrightness: device.brightness,
          currentColor: device.color,
        }),
      });

      // Save updated device to database
      await DeviceRepository.update(deviceId, newState);

      // Update in memory if this is an active device
      if (deviceConfig) {
        deviceConfig.device = newState;
        deviceConfig.lastUpdate = new Date();
        this.activeDevices.set(deviceId, deviceConfig);
      }

      // Broadcast update via websocket
      this.websocketManager.emit('device:update', {
        deviceId: device._id.toString(),
        deviceType: device.deviceType,
        homeId: device.homeId.toString(),
        roomId: device.roomId ? device.roomId.toString() : null,
        isActive: device.isActive,
        currentLoad: device.currentLoad,
        action,
        parameters,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      console.error(`Error controlling device ${deviceId}:`, error);

      // Log the failed action
      await DeviceLogService.createLog({
        homeId: device.homeId,
        roomId: device.roomId,
        deviceType: device.deviceType,
        deviceId: device._id,
        type: 'error',
        action,
        previousState,
        success: false,
        error: error.message,
        timestamp: new Date(),
      });

      return false;
    }
  }

  async applyAction(device, action, parameters) {
    // Create a copy of the device to modify
    const updatedDevice = { ...device };

    // Handle actions differently based on device type
    switch (device.deviceType) {
      case 'smart_plug':
        return this.applySmartPlugAction(updatedDevice, action, parameters);
      case 'thermostat':
        return this.applyThermostatAction(updatedDevice, action, parameters);
      case 'heating_valve':
        return this.applyHeatingValveAction(updatedDevice, action, parameters);
      case 'smart_lock':
        return this.applySmartLockAction(updatedDevice, action, parameters);
      case 'gate':
        return this.applyGateAction(updatedDevice, action, parameters);
      case 'irrigation_system':
        return this.applyIrrigationSystemAction(
          updatedDevice,
          action,
          parameters
        );
      case 'ventilation':
        return this.applyVentilationAction(updatedDevice, action, parameters);
      case 'air_purifier':
        return this.applyAirPurifierAction(updatedDevice, action, parameters);
      case 'camera':
        return this.applyCameraAction(updatedDevice, action, parameters);
      default:
        // Generic action handling for any device
        return this.applyGenericAction(updatedDevice, action, parameters);
    }
  }

  // Implement device-specific action handlers
  async applySmartPlugAction(device, action, parameters) {
    let needsLoadUpdate = false;

    switch (action) {
      case 'toggle':
        // Toggle the isActive property instead of state.power
        device.isActive = !device.isActive;
        needsLoadUpdate = true;
        break;

      case 'setPower':
        // Set the isActive property based on parameters.power
        device.isActive = !!parameters.power;
        needsLoadUpdate = true;
        break;
      // Add more actions as needed
    }

    // Update currentLoad if power state changed
    if (needsLoadUpdate) {
      try {
        // Get the room type for this device
        let roomType = 'custom';
        if (device.roomId) {
          // Import Room model dynamically to avoid circular dependencies
          const { default: Room } = await import('../models/Room.js');
          const room = await Room.findById(device.roomId);
          if (room) {
            roomType = room.type;
          }
        }

        if (device.isActive) {
          // Generate a new load value when turned on
          device.currentLoad = this.generateSmartPlugLoad(device, {
            roomType,
            isOn: true,
          });
        } else {
          // Small standby power consumption when turned off (0.5-2W)
          device.currentLoad =
            Math.round((0.5 + Math.random() * 1.5) * 10) / 10;
        }
      } catch (error) {
        console.error('Error updating smart plug load:', error);
        // Default fallback if room lookup fails
        device.currentLoad = device.isActive ? 50 : 0.5;
      }
    }

    // Update status
    if (!device.status) device.status = {};
    device.status.lastActive = new Date();

    return device;
  }

  applyThermostatAction(device, action, parameters) {
    switch (action) {
      case 'setTemperature':
        device.targetTemperature = parameters.temperature;
        break;
      case 'setMode':
        device.mode = parameters.mode;
        break;
      case 'setPower':
        device.isActive = !!parameters.power;
        break;
      // Add more actions as needed
    }

    // Update status
    if (!device.status) device.status = {};
    device.status.lastActive = new Date();

    return device;
  }

  // Add implementations for other device types...

  applyGenericAction(device, action, parameters) {
    // Handle generic actions that apply to any device
    switch (action) {
      case 'setPower':
        device.isActive = !!parameters.power;
        break;
      // Add more generic actions as needed
    }

    // Update status
    if (!device.status) device.status = {};
    device.status.lastActive = new Date();

    return device;
  }

  /**
   * Generates a realistic power load for a smart plug based on room type and time of day
   * @param {Object} device - The device object
   * @param {Object} options - Generation options
   * @param {String} options.roomType - The type of room where the plug is located
   * @param {Boolean} options.isOn - Whether the device is powered on (default: true)
   * @returns {Number} - The generated power load in watts
   */
  generateSmartPlugLoad(device, options = {}) {
    const { roomType, isOn = true } = options;
    // This function should only be called when isOn is true
    // The OFF state power handling is now in applySmartPlugAction

    if (!isOn) return 0;

    const now = new Date();
    const hour = now.getHours();
    const isNighttime = hour >= 22 || hour < 6;
    const isMorning = hour >= 6 && hour < 10;
    const isEvening = hour >= 17 && hour < 22;

    // Base values for different room types in watts
    let baseLoad = 0;
    let variability = 5; // Default variability

    switch (roomType) {
      case 'livingRoom':
        // TV, media centers, lighting
        if (isNighttime) {
          baseLoad = Math.random() < 0.3 ? 80 : 5; // Likely off with standby power
        } else if (isEvening) {
          baseLoad = 120 + Math.random() * 80; // TV and lights usage in evening
        } else {
          baseLoad = Math.random() < 0.5 ? 10 : 80; // Occasional daytime use
        }
        variability = 20;
        break;

      case 'kitchen':
        // Appliances like coffee makers, toasters, blenders
        if (isMorning) {
          baseLoad = 800 + Math.random() * 400; // Coffee makers, toasters in morning
        } else if (hour >= 11 && hour < 14) {
          baseLoad = 400 + Math.random() * 600; // Lunch preparation
        } else if (hour >= 17 && hour < 20) {
          baseLoad = 1000 + Math.random() * 500; // Dinner preparation
        } else {
          baseLoad = 50 + Math.random() * 50; // Standby or fridge
        }
        variability = 200;
        break;

      case 'bedroom':
        // Chargers, lamps, small devices
        if (isNighttime) {
          baseLoad = 10 + Math.random() * 20; // Phone charging, maybe a night lamp
        } else if (hour >= 6 && hour < 8) {
          baseLoad = 30 + Math.random() * 70; // Morning routine, hairdryers
        } else {
          baseLoad = Math.random() < 0.3 ? 40 : 5; // Usually low when not in use
        }
        variability = 10;
        break;

      case 'bathroom':
        // Hairdryers, electric toothbrushes, heaters
        if (isMorning || (hour >= 20 && hour < 22)) {
          baseLoad = Math.random() < 0.3 ? 800 : 10; // Hair dryers or other devices
        } else {
          baseLoad = 5; // Very low when not in use
        }
        variability = 50;
        break;

      case 'office':
        // Computers, monitors, printers
        if (hour >= 9 && hour < 18 && now.getDay() >= 1 && now.getDay() <= 5) {
          baseLoad = 150 + Math.random() * 100; // Computer usage during workdays
        } else if (hour >= 19 && hour < 23) {
          baseLoad = Math.random() < 0.3 ? 150 : 10; // Occasional evening use
        } else {
          baseLoad = 10; // Standby power
        }
        variability = 30;
        break;

      case 'gym':
        // Treadmills, ellipticals
        if ((isMorning || isEvening) && Math.random() < 0.4) {
          baseLoad = 400 + Math.random() * 600; // Active workout equipment
        } else {
          baseLoad = 5; // Standby
        }
        variability = 100;
        break;

      case 'garage':
        // Tools, chargers
        if (
          hour >= 9 &&
          hour < 19 &&
          (now.getDay() === 0 || now.getDay() === 6)
        ) {
          baseLoad = Math.random() < 0.4 ? 800 : 10; // Weekend tool usage
        } else {
          baseLoad = 10 + Math.random() * 20; // Car or tool chargers
        }
        variability = 80;
        break;

      default:
        // Generic room with generic devices
        if (isNighttime) {
          baseLoad = 5 + Math.random() * 15; // Low nighttime usage
        } else {
          baseLoad = 20 + Math.random() * 80; // General daytime usage
        }
        variability = 20;
    }

    // Add some randomness based on variability
    const load = Math.max(0.5, baseLoad + (Math.random() - 0.5) * variability);

    // Round to nearest integer
    return Math.round(load);
  }

  getActiveDevices() {
    const result = {};
    this.activeDevices.forEach((config, deviceId) => {
      result[deviceId] = {
        type: config.device.deviceType,
        lastUpdate: config.lastUpdate,
        state: config.device.state || {},
      };
    });
    return result;
  }

  getEmulationStatus() {
    return {
      enabled: !!this.jobIntervalId,
      updateInterval: this.updateInterval,
      lastRun: this.lastUpdate,
    };
  }

  stopAll() {
    // Stop batch update job
    this.stopBatchUpdates();

    // Stop all individual devices
    this.activeDevices.forEach((_, deviceId) => {
      this.stopDevice(deviceId);
    });
  }
}

export default DeviceEmulator;
