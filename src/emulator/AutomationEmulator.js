import { CronJob } from 'cron';
import AutomationRepository from '../repositories/AutomationRepository.js';
import DeviceRepository from '../repositories/DeviceRepository.js';
import SensorRepository from '../repositories/SensorRepository.js';
import { DeviceLogService } from '../services/index.js';

class AutomationEmulator {
  constructor(websocketManager, deviceEmulator) {
    this.websocketManager = websocketManager;
    this.deviceEmulator = deviceEmulator;
    this.timeJobs = new Map(); // Store time-based cron jobs: Map<automationId, {startJob, endJob}>
    this.initialized = false;
    this.sensorTriggerHandler = this.handleSensorValueChange.bind(this);
  }

  /**
   * Initialize the automation emulator
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Register for sensor change events
      this.websocketManager.onEvent(
        'sensors:batch-update',
        this.sensorTriggerHandler
      );
      this.websocketManager.onEvent(
        'sensors:update',
        this.sensorTriggerHandler
      );

      // Load and schedule all active time-based automations
      await this.loadTimeAutomations();

      console.log('Automation emulator initialized');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize automation emulator:', error);
    }
  }

  /**
   * Load all time-based automations and schedule them
   */
  async loadTimeAutomations() {
    try {
      // Get all active time-based automations
      const automations = await AutomationRepository.find({
        isActive: true,
        triggerType: 'time',
      });

      console.log(`Loading ${automations.length} time-based automations`);

      // Schedule each automation
      for (const automation of automations) {
        this.scheduleTimeAutomation(automation);
      }
    } catch (error) {
      console.error('Error loading time automations:', error);
    }
  }

  /**
   * Schedule a time-based automation with cron jobs
   * @param {Object} automation - The automation object to schedule
   */
  scheduleTimeAutomation(automation) {
    if (!automation.isActive || automation.triggerType !== 'time') {
      return;
    }

    try {
      // Clear existing jobs for this automation if they exist
      this.clearAutomationJobs(automation._id);

      const { startTime, endTime, daysOfWeek, isRecurring } =
        automation.timeTrigger;

      // Parse time format "HH:MM" to create cron expressions
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');

      // Create cron expressions
      let startCronExpression;
      let endCronExpression;

      if (isRecurring && daysOfWeek && daysOfWeek.length > 0) {
        // Map day names to cron day numbers (0-6, where 0 is Sunday)
        const dayMap = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        // Convert day names to cron day numbers
        const cronDays = daysOfWeek
          .map(day => dayMap[day.toLowerCase()])
          .join(',');

        // Format: "0 MM HH * * DAY" (seconds minutes hours day-of-month month day-of-week)
        startCronExpression = `0 ${startMinute} ${startHour} * * ${cronDays}`;
        endCronExpression = `0 ${endMinute} ${endHour} * * ${cronDays}`;
      } else {
        // Non-recurring or no specific days - run every day
        startCronExpression = `0 ${startMinute} ${startHour} * * *`;
        endCronExpression = `0 ${endMinute} ${endHour} * * *`;
      }

      // Create jobs
      console.log(
        `Scheduling automation ${automation._id} with cron: start=${startCronExpression}, end=${endCronExpression}`
      );

      const startJob = new CronJob(
        startCronExpression,
        () => this.executeAutomationStart(automation),
        null,
        true,
        'Europe/Kiev' // Ukrainian time zone
      );

      const endJob = new CronJob(
        endCronExpression,
        () => this.executeAutomationEnd(automation),
        null,
        true,
        'Europe/Kiev' // Ukrainian time zone
      );

      // Store jobs for future reference
      this.timeJobs.set(automation._id.toString(), { startJob, endJob });

      // Log next execution times
      console.log(
        `Automation ${automation._id} - Next start: ${startJob.nextDate()}, Next end: ${endJob.nextDate()}`
      );
    } catch (error) {
      console.error(
        `Error scheduling time automation ${automation._id}:`,
        error
      );
    }
  }

  /**
   * Clear scheduled jobs for an automation
   * @param {String} automationId - The ID of the automation
   */
  clearAutomationJobs(automationId) {
    const id = automationId.toString();
    const jobPair = this.timeJobs.get(id);

    if (jobPair) {
      // Stop both jobs
      if (jobPair.startJob) jobPair.startJob.stop();
      if (jobPair.endJob) jobPair.endJob.stop();

      // Remove from the map
      this.timeJobs.delete(id);
      console.log(`Cleared scheduled jobs for automation ${id}`);
    }
  }

  /**
   * Handle sensor value changes to check for trigger conditions
   * @param {Array|Object} data - Sensor update data
   */
  async handleSensorValueChange(data) {
    // Normalize data to array format
    const updates = Array.isArray(data) ? data : [data];

    try {
      // Get all active sensor-triggered automations
      const automations = await AutomationRepository.find({
        isActive: true,
        triggerType: 'sensor',
      });

      if (automations.length === 0) return;

      // Check each sensor update against all automations
      for (const update of updates) {
        const { sensorId, sensorType, data: sensorData } = update;

        // Skip if no sensor data
        if (!sensorData) continue;

        // Check each automation for this sensor
        for (const automation of automations) {
          // Skip if sensor types don't match
          if (automation.sensorTrigger.sensorType !== sensorType) continue;

          // Skip if not the correct sensor
          if (automation.sensorTrigger.sensorId.toString() !== sensorId)
            continue;

          // Get the condition to check
          const { property, triggerValue } = automation.sensorTrigger.condition;

          // Skip if property not in update data
          if (!sensorData[property] && sensorData[property] !== 0) continue;

          // Check if condition is met
          const sensorValue = sensorData[property];

          // Simple value comparison - can be enhanced for different comparison types
          if (sensorValue >= triggerValue) {
            console.log(
              `Sensor trigger condition met for automation ${automation._id}: ${property}=${sensorValue} >= ${triggerValue}`
            );

            // Execute the automation
            await this.executeAutomationAction(automation);
          }
        }
      }
    } catch (error) {
      console.error('Error processing sensor automation triggers:', error);
    }
  }

  /**
   * Execute an automation's start action
   * @param {Object} automation - The automation to execute
   */
  async executeAutomationStart(automation) {
    console.log(
      `Executing time automation start for ${automation._id}: ${automation.name}`
    );

    try {
      // Execute the automation action
      await this.executeAutomationAction(automation);
    } catch (error) {
      console.error(
        `Error executing automation start ${automation._id}:`,
        error
      );
    }
  }

  /**
   * Execute an automation's end action (for time-based automations)
   * @param {Object} automation - The automation to end
   */
  async executeAutomationEnd(automation) {
    console.log(
      `Executing time automation end for ${automation._id}: ${automation.name}`
    );

    try {
      // For time automation end, we typically would reverse the action
      // This is a simplified implementation - you may need to enhance this
      // based on your specific requirements

      // For now, we'll just log it
      console.log(`Time automation ${automation._id} ended`);
    } catch (error) {
      console.error(`Error executing automation end ${automation._id}:`, error);
    }
  }

  /**
   * Execute an automation's action on devices
   * @param {Object} automation - The automation to execute
   */
  async executeAutomationAction(automation) {
    try {
      const { deviceType, deviceIds, settings } = automation.deviceAction;

      if (!deviceIds || deviceIds.length === 0) {
        console.warn(
          `Automation ${automation._id} has no device IDs configured`
        );
        return;
      }

      console.log(
        `Executing automation ${automation._id} on ${deviceIds.length} ${deviceType} devices`
      );

      // Process each device
      for (const deviceId of deviceIds) {
        // Get the device
        const device = await DeviceRepository.findById(deviceId);

        if (!device) {
          console.warn(
            `Device ${deviceId} not found for automation ${automation._id}`
          );
          continue;
        }

        // Skip if device type doesn't match
        if (device.deviceType !== deviceType) {
          console.warn(
            `Device ${deviceId} type mismatch: expected ${deviceType}, got ${device.deviceType}`
          );
          continue;
        }

        // Determine the action and parameters based on device type and settings
        let action = '';
        let parameters = {};

        // Map settings to appropriate device actions
        switch (deviceType) {
          case 'smart_plug':
            action = settings.isActive ? 'turnOn' : 'turnOff';
            break;

          case 'smart_light':
            action = settings.isActive ? 'turnOn' : 'turnOff';
            parameters = {
              brightness: settings.brightness,
              color: settings.color,
            };
            break;

          case 'thermostat':
            action = 'setTemperature';
            parameters = {
              temperature: settings.currentTemperature,
              mode: settings.currentMode,
            };
            break;

          case 'smart_lock':
            action = settings.currentDoorState === 'open' ? 'unlock' : 'lock';
            break;

          case 'gate':
            action = settings.currentPosition === 'open' ? 'open' : 'close';
            break;

          case 'irrigation_system':
            action = settings.isActive ? 'startIrrigation' : 'stopIrrigation';
            parameters = {
              waterFlow: settings.currentWaterFlow,
              duration: settings.duration,
            };
            break;

          case 'ventilation':
            action = settings.isActive ? 'turnOn' : 'turnOff';
            parameters = {
              fanSpeed: settings.currentFanSpeed,
            };
            break;

          default:
            console.warn(
              `Unsupported device type for automation: ${deviceType}`
            );
            continue;
        }

        // Log the action
        console.log(
          `Automation ${automation._id} controlling device ${device._id}: action=${action}, params=`,
          parameters
        );

        // Execute the action using the device emulator
        await this.deviceEmulator.controlDevice(
          deviceId.toString(),
          action,
          parameters
        );

        // Create a log entry
        await DeviceLogService.createLog({
          homeId: device.homeId,
          roomId: device.roomId,
          deviceType: device.deviceType,
          deviceId: device._id,
          type: 'automation_action',
          timestamp: new Date(),
          action: action,
          parameters: parameters,
          success: true,
          details: {
            automationId: automation._id,
            automationName: automation.name,
          },
        });
      }

      // Emit event for UI update
      this.websocketManager.emit('automation:executed', {
        automationId: automation._id.toString(),
        name: automation.name,
        triggerType: automation.triggerType,
        timestamp: new Date(),
        deviceType: automation.deviceAction.deviceType,
        deviceCount: automation.deviceAction.deviceIds.length,
      });
    } catch (error) {
      console.error(
        `Error executing automation action ${automation._id}:`,
        error
      );
    }
  }

  /**
   * Update or create a automation schedule
   * @param {String} automationId - The automation ID
   */
  async updateAutomationSchedule(automationId) {
    try {
      const automation = await AutomationRepository.findById(automationId);

      if (!automation) {
        console.warn(
          `Automation ${automationId} not found for schedule update`
        );
        return;
      }

      // Clear existing jobs
      this.clearAutomationJobs(automationId);

      // If active and time-based, schedule it
      if (automation.isActive && automation.triggerType === 'time') {
        this.scheduleTimeAutomation(automation);
      }
    } catch (error) {
      console.error(
        `Error updating automation schedule ${automationId}:`,
        error
      );
    }
  }

  /**
   * Get the status of all scheduled automations
   */
  getAutomationStatus() {
    const timeJobsStatus = [];

    // Collect info on time-based automations
    for (const [automationId, jobPair] of this.timeJobs.entries()) {
      timeJobsStatus.push({
        automationId,
        nextStartTime: jobPair.startJob ? jobPair.startJob.nextDate() : null,
        nextEndTime: jobPair.endJob ? jobPair.endJob.nextDate() : null,
      });
    }

    return {
      initialized: this.initialized,
      timeAutomationsCount: this.timeJobs.size,
      timeAutomationsScheduled: timeJobsStatus,
    };
  }

  /**
   * Stop all automation jobs
   */
  stopAll() {
    // Stop all cron jobs
    for (const [automationId, jobPair] of this.timeJobs.entries()) {
      if (jobPair.startJob) jobPair.startJob.stop();
      if (jobPair.endJob) jobPair.endJob.stop();
      console.log(`Stopped automation jobs for ${automationId}`);
    }

    // Clear the map
    this.timeJobs.clear();

    // Remove event listeners
    this.websocketManager.removeListener(
      'sensors:batch-update',
      this.sensorTriggerHandler
    );
    this.websocketManager.removeListener(
      'sensors:update',
      this.sensorTriggerHandler
    );

    this.initialized = false;
    console.log('All automation jobs stopped');

    return true;
  }
}

export default AutomationEmulator;
