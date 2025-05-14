import { SensorRepository, DeviceRepository } from '../repositories/index.js';
import SensorEmulator from './SensorEmulator.js';
import DeviceEmulator from './DeviceEmulator.js';
import AutomationEmulator from './AutomationEmulator.js';
import WebSocketManager from './WebSocketManager.js';

class EmulatorService {
  constructor() {
    this.websocketManager = new WebSocketManager();
    this.sensorEmulator = new SensorEmulator(this.websocketManager);
    this.deviceEmulator = new DeviceEmulator(this.websocketManager);
    this.automationEmulator = new AutomationEmulator(
      this.websocketManager,
      this.deviceEmulator
    );
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    this.setupEventListeners();
    console.log('Emulator service initialized');
    this.initialized = true;
  }

  setupEventListeners() {
    this.websocketManager.onEvent('device:control', async (socket, data) => {
      await this.deviceEmulator.controlDevice(
        data.deviceId,
        data.action,
        data.parameters
      );
    });

    // Add listeners for automation-related events
    this.websocketManager.onEvent('automation:update', async (socket, data) => {
      if (data && data.automationId) {
        await this.automationEmulator.updateAutomationSchedule(
          data.automationId
        );
      }
    });
  }

  /**
   * Generates initial values for a new sensor's current* properties
   * based on Ukrainian conditions, time of year, and time of day
   * @param {Object} sensorData - The sensor data to enrich with current values
   * @returns {Object} - The enriched sensor data
   */
  generateInitialSensorValues(sensorData) {
    // Delegate to the SensorEmulator's value generation with current environmental factors
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    const isWinter = month === 11 || month === 0 || month === 1;
    const isSpring = month >= 2 && month <= 4;
    const isSummer = month >= 5 && month <= 7;
    const isFall = month >= 8 && month <= 10;
    const isDaytime = hour >= 8 && hour < 20;

    // Generate default dangerous values if not provided
    // This helps ensure that the emulator generates reasonable values
    const enrichedSensorData = { ...sensorData };

    switch (sensorData.sensorType) {
      case 'temperature_sensor':
        // Set default dangerous values if not present
        if (!enrichedSensorData.dangerousTemperaturePlus) {
          enrichedSensorData.dangerousTemperaturePlus = 35;
        }
        if (!enrichedSensorData.dangerousTemperatureMinus) {
          enrichedSensorData.dangerousTemperatureMinus = -10;
        }
        break;

      case 'humidity_sensor':
        if (!enrichedSensorData.dangerousHumidity) {
          enrichedSensorData.dangerousHumidity = 90;
        }
        break;

      case 'motion_sensor':
        if (!enrichedSensorData.dangerousMotionIntensity) {
          enrichedSensorData.dangerousMotionIntensity = 80;
        }
        break;

      case 'smoke_sensor':
        if (!enrichedSensorData.dangerousSmokeLevel) {
          enrichedSensorData.dangerousSmokeLevel = 50;
        }
        break;

      case 'water_leak_sensor':
        if (!enrichedSensorData.dangerousWaterDetectionIndex) {
          enrichedSensorData.dangerousWaterDetectionIndex = 70;
        }
        break;

      case 'gas_sensor':
        if (!enrichedSensorData.dangerousMethanLevel) {
          enrichedSensorData.dangerousMethanLevel = 100;
        }
        if (!enrichedSensorData.dangerousPropaneLevel) {
          enrichedSensorData.dangerousPropaneLevel = 50;
        }
        if (!enrichedSensorData.dangerousCarbonDioxideLevel) {
          enrichedSensorData.dangerousCarbonDioxideLevel = 1000;
        }
        if (!enrichedSensorData.dangerousCarbonMonoxideLevel) {
          enrichedSensorData.dangerousCarbonMonoxideLevel = 30;
        }
        if (!enrichedSensorData.dangerousNitrogenDioxideLevel) {
          enrichedSensorData.dangerousNitrogenDioxideLevel = 100;
        }
        if (!enrichedSensorData.dangerousOzoneLevel) {
          enrichedSensorData.dangerousOzoneLevel = 70;
        }
        break;

      case 'air_quality_sensor':
        if (!enrichedSensorData.dangerousAQI) {
          enrichedSensorData.dangerousAQI = 150;
        }
        if (!enrichedSensorData.dangerousPM25) {
          enrichedSensorData.dangerousPM25 = 35;
        }
        if (!enrichedSensorData.dangerousPM10) {
          enrichedSensorData.dangerousPM10 = 50;
        }
        break;

      case 'light_sensor':
        if (!enrichedSensorData.dangerousLux) {
          enrichedSensorData.dangerousLux = 10000;
        }
        break;

      case 'power_sensor':
        if (!enrichedSensorData.dangerousPower) {
          enrichedSensorData.dangerousPower = 3000;
        }
        if (!enrichedSensorData.dangerousVoltage) {
          enrichedSensorData.dangerousVoltage = 250;
        }
        if (!enrichedSensorData.dangerousCurrent) {
          enrichedSensorData.dangerousCurrent = 15;
        }
        break;

      case 'weather_sensor':
        if (!enrichedSensorData.dangerousTemperaturePlus) {
          enrichedSensorData.dangerousTemperaturePlus = 35;
        }
        if (!enrichedSensorData.dangerousTemperatureMinus) {
          enrichedSensorData.dangerousTemperatureMinus = -15;
        }
        if (!enrichedSensorData.dangerousWindSpeed) {
          enrichedSensorData.dangerousWindSpeed = 20;
        }
        if (!enrichedSensorData.dangerousRainIntensity) {
          enrichedSensorData.dangerousRainIntensity = 8;
        }
        break;
    }

    // Create a sensor-like object with the required properties for the generator
    const mockSensor = {
      ...enrichedSensorData,
      _id: 'new_sensor',
    };

    // Use the same generation logic as the batch updater
    const envFactors = {
      isWinter,
      isSpring,
      isSummer,
      isFall,
      isDaytime,
      hour,
      month,
    };
    const currentValues = this.sensorEmulator.generateCurrentValues(
      mockSensor,
      envFactors
    );

    if (!currentValues) {
      console.warn(
        `Failed to generate initial values for sensor type: ${sensorData.sensorType}`
      );
      return enrichedSensorData;
    }

    // Set isActive to true by default for new sensors
    if (enrichedSensorData.isActive === undefined) {
      enrichedSensorData.isActive = true;
    }

    // Return merged data
    return {
      ...enrichedSensorData,
      ...currentValues,
      lastUpdate: now,
    };
  }

  /**
   * Generates initial values for a new device's properties
   * based on device type, room type, and time of day
   * @param {Object} deviceData - The device data to enrich with initial values
   * @returns {Object} - The enriched device data
   */
  async generateInitialDeviceValues(deviceData) {
    const now = new Date();
    const updates = { ...deviceData };

    // Only generate values for certain device types
    switch (deviceData.deviceType) {
      case 'smart_plug':
        // Get the room type if roomId is available
        let roomType = 'custom'; // Default room type

        if (deviceData.roomId) {
          try {
            // Import dynamically to avoid circular dependencies
            const { default: Room } = await import('../models/Room.js');
            const room = await Room.findById(deviceData.roomId);
            if (room) {
              roomType = room.type;
            }
          } catch (error) {
            console.error('Error fetching room type:', error);
          }
        }

        // When creating a new device, assume it's powered on
        // We don't have state.power yet as it's a new device
        const isOn = deviceData.isActive;

        // Generate currentLoad based on room type
        updates.currentLoad = this.deviceEmulator.generateSmartPlugLoad(
          deviceData,
          {
            roomType,
            isOn,
          }
        );
        break;

      // Add other device types here as needed

      default:
        // No specific initialization needed for other device types
        break;
    }

    // Add lastUpdate timestamp
    updates.lastUpdate = now;

    return updates;
  }

  /**
   * Get the current emulation status for both sensors and devices
   */
  async getEmulationStatus() {
    return {
      sensors: this.sensorEmulator.getEmulationStatus(),
      devices: this.deviceEmulator.getEmulationStatus(),
      automations: this.automationEmulator.getAutomationStatus(),
    };
  }

  /**
   * Start emulation for all sensors and devices
   * @param {Object} options Emulation options
   * @param {Number} options.updateInterval Update interval in milliseconds
   */
  async startAll(options = {}) {
    try {
      const updateInterval = options.updateInterval || 3600000; // 1 hour default

      // Start sensor emulator
      if (options.startSensors !== false) {
        this.sensorEmulator.startBatchUpdates(updateInterval);
      }

      // Start device emulator
      if (options.startDevices !== false) {
        this.deviceEmulator.startBatchUpdates(updateInterval);
      }

      // Initialize automation emulator
      if (options.startAutomations !== false) {
        await this.automationEmulator.initialize();
      }

      return {
        success: true,
        message: 'Emulation started successfully',
        updateInterval,
      };
    } catch (error) {
      console.error('Error starting emulation:', error);
      return {
        success: false,
        message: `Error starting emulation: ${error.message}`,
      };
    }
  }

  /**
   * Stop all emulation processes
   */
  async stopAll() {
    this.sensorEmulator.stopBatchUpdates();
    this.deviceEmulator.stopBatchUpdates();
    this.automationEmulator.stopAll();
    return {
      success: true,
      message: 'All emulation stopped',
    };
  }

  /**
   * Configure batch update settings
   * @param {Object} options Batch update options
   * @param {Boolean} options.enabled Whether batch updates are enabled
   * @param {Number} options.updateInterval Update interval in milliseconds
   */
  async configureBatchUpdates(options = {}) {
    const {
      enabled = true,
      updateInterval = 3600000, // Default: 1 hour
    } = options;

    let result = {
      sensors: false,
      devices: false,
    };

    if (enabled) {
      result.sensors = this.sensorEmulator.startBatchUpdates(updateInterval);
      result.devices = this.deviceEmulator.startBatchUpdates(updateInterval);
    } else {
      result.sensors = this.sensorEmulator.stopBatchUpdates();
      result.devices = this.deviceEmulator.stopBatchUpdates();
    }

    return result;
  }

  /**
   * Trigger an immediate batch update of all sensors and devices
   */
  async triggerImmediateUpdate() {
    try {
      await Promise.all([
        this.sensorEmulator.updateAllSensors(),
        this.deviceEmulator.updateAllDevices(),
        // No immediate update needed for automations as they're event/schedule based
      ]);

      return {
        success: true,
        message: 'Immediate update triggered successfully',
      };
    } catch (error) {
      console.error('Error triggering immediate update:', error);
      return {
        success: false,
        message: `Error triggering update: ${error.message}`,
      };
    }
  }
}

export default new EmulatorService();
