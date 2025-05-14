import { SensorRepository } from '../repositories/index.js';
import { SensorLogService } from '../services/index.js';

class SensorEmulator {
  constructor(websocketManager) {
    this.websocketManager = websocketManager;
    this.jobIntervalId = null;
    this.updateInterval = 3600000; // Default: update every hour (in ms)
  }

  /**
   * Start batch update job for all sensors
   * @param {Number} interval - Update interval in milliseconds (default: 1 hour)
   */
  startBatchUpdates(interval = 3600000) {
    if (this.jobIntervalId) {
      clearInterval(this.jobIntervalId);
    }

    this.updateInterval = interval;
    this.jobIntervalId = setInterval(() => this.updateAllSensors(), interval);
    console.log(
      `Started batch sensor updates every ${interval / 1000} seconds`
    );

    // Run immediately for first update
    this.updateAllSensors();

    return true;
  }

  /**
   * Stop batch update job
   */
  stopBatchUpdates() {
    if (this.jobIntervalId) {
      clearInterval(this.jobIntervalId);
      this.jobIntervalId = null;
      console.log('Stopped batch sensor updates');
      return true;
    }
    return false;
  }

  /**
   * Update all sensors in the database
   * This is the primary method for updating sensor data
   */
  async updateAllSensors() {
    try {
      const startTime = Date.now();

      // Get all active sensors
      const sensors = await SensorRepository.find({ isActive: true });

      if (sensors.length === 0) {
        return;
      }

      // Prepare batch of updates
      const updates = [];
      const logs = [];
      const websocketUpdates = [];

      // Current time and environmental factors for consistent generation
      const now = new Date();
      const month = now.getMonth();
      const hour = now.getHours();
      const isWinter = month === 11 || month === 0 || month === 1;
      const isSpring = month >= 2 && month <= 4;
      const isSummer = month >= 5 && month <= 7;
      const isFall = month >= 8 && month <= 10;
      const isDaytime = hour >= 8 && hour < 20;

      // Process each sensor
      for (const sensor of sensors) {
        try {
          // Generate updated values based on sensor type
          const sensorUpdates = this.generateCurrentValues(sensor, {
            isWinter,
            isSpring,
            isSummer,
            isFall,
            isDaytime,
            hour,
            month,
          });

          if (!sensorUpdates) continue;

          // Prepare database update
          updates.push({
            updateOne: {
              filter: { _id: sensor._id },
              update: {
                $set: {
                  ...sensorUpdates,
                  lastUpdate: now,
                },
              },
            },
          });

          // Create log entry
          logs.push({
            homeId: sensor.homeId,
            roomId: sensor.roomId,
            sensorType: sensor.sensorType,
            sensorId: sensor._id,
            type: 'measurement',
            timestamp: now,
            ...sensorUpdates,
          });

          // Prepare websocket update
          websocketUpdates.push({
            sensorId: sensor._id.toString(),
            sensorType: sensor.sensorType,
            homeId: sensor.homeId.toString(),
            roomId: sensor.roomId ? sensor.roomId.toString() : null,
            data: sensorUpdates,
            timestamp: now,
          });
        } catch (err) {
          console.error(`Error processing sensor ${sensor._id}:`, err);
        }
      }

      // Execute batch updates if we have any
      if (updates.length > 0) {
        await SensorRepository.bulkWrite(updates);
      }

      // Create logs in batch
      if (logs.length > 0) {
        await SensorLogService.createBatchLogs(logs);
      }

      // Send websocket updates
      if (websocketUpdates.length > 0) {
        this.websocketManager.emit('sensors:batch-update', websocketUpdates);
      }
    } catch (error) {
      console.error('Error in batch sensor update:', error);
    }
  }

  /**
   * Generate appropriate current values for a specific sensor
   * based on sensor type and environmental factors
   */
  generateCurrentValues(sensor, envFactors) {
    const { isWinter, isSpring, isSummer, isFall, isDaytime, hour } =
      envFactors;

    // Create object to hold updates
    const updates = {};

    switch (sensor.sensorType) {
      case 'temperature_sensor':
        // Base temperature varies by season in Ukraine
        let baseTemp = 22; // Default room temperature

        if (sensor.location === 'outdoor') {
          // Outdoor temperature based on season
          if (isWinter)
            baseTemp = -5 + Math.random() * 10; // -5 to 5°C
          else if (isSpring)
            baseTemp = 10 + Math.random() * 10; // 10 to 20°C
          else if (isSummer)
            baseTemp = 25 + Math.random() * 8; // 25 to 33°C
          else if (isFall) baseTemp = 10 + Math.random() * 10; // 10 to 20°C

          // Day/night variation
          if (!isDaytime) baseTemp -= 5; // Cooler at night
        } else {
          // Indoor temperature logic - comfortable for humans
          baseTemp = 22; // Default comfortable room temperature

          // Slight variation based on time of day
          if (!isDaytime) {
            baseTemp = Math.max(18, baseTemp - 2); // Slightly cooler at night but never below 18°C
          }

          // Ensure indoor temperature is always comfortable
          baseTemp = Math.max(baseTemp, 10); // Never below 10°C indoor
        }

        // Apply slight random variation
        baseTemp += (Math.random() - 0.5) * 2;

        // Check against dangerous thresholds if they exist
        if (
          sensor.dangerousTemperaturePlus !== undefined &&
          sensor.dangerousTemperatureMinus !== undefined
        ) {
          // Convert string values to numbers
          const maxTemp = Number(sensor.dangerousTemperaturePlus);
          const minTemp = Number(sensor.dangerousTemperatureMinus);

          // Check if temperature is outside the allowed range
          if (baseTemp > maxTemp || baseTemp < minTemp) {
            // Calculate middle value of the safe range
            const middleTemp = (maxTemp + minTemp) / 2;

            // Get the range width
            const rangeWidth = maxTemp - minTemp;

            // Determine an appropriate comfortable temperature within the range
            if (rangeWidth > 10) {
              // For wide ranges, prefer human comfort temperatures (18-24°C) if possible
              if (minTemp <= 18 && maxTemp >= 22) {
                // Can fit comfort zone within range, pick a comfortable temperature
                baseTemp = 18 + Math.random() * 4; // 18-22°C range
              } else if (maxTemp > 0) {
                // If max is positive, prefer higher temperature but below max
                const buffer = Math.min(3, maxTemp * 0.2); // Smaller buffer for smaller max
                baseTemp = maxTemp - buffer - Math.random() * buffer;
              } else {
                // If entire range is negative, prefer the highest temperature in range
                baseTemp =
                  minTemp +
                  rangeWidth * 0.8 +
                  Math.random() * (rangeWidth * 0.2);
              }
            } else if (rangeWidth > 2) {
              // For medium ranges, add some randomness but favor upper part of range
              baseTemp =
                minTemp + rangeWidth * 0.6 + Math.random() * (rangeWidth * 0.4);
            } else {
              // For very narrow ranges, just use the middle with slight randomness
              baseTemp = middleTemp + (Math.random() - 0.5) * rangeWidth * 0.5;
            }
          }
        }

        updates.currentTemperature = Math.round(baseTemp);
        break;

      case 'humidity_sensor':
        // Humidity varies by season and indoor/outdoor
        let baseHumidity = 40; // Default indoor humidity

        if (sensor.location === 'outdoor') {
          if (isWinter)
            baseHumidity = 70 + Math.random() * 15; // Higher in winter
          else if (isSummer)
            baseHumidity = 50 + Math.random() * 20; // Variable in summer
          else baseHumidity = 60 + Math.random() * 20; // Spring/fall
        } else if (sensor.location === 'bathroom') {
          baseHumidity = 60 + Math.random() * 15; // Higher in bathroom
        } else if (sensor.location === 'basement') {
          baseHumidity = 65 + Math.random() * 10; // Higher in basement
        }

        // Consider dangerous threshold if set
        if (sensor.dangerousHumidity) {
          // Convert string value to number
          const dangerousHumidity = Number(sensor.dangerousHumidity);
          // Ensure humidity is typically below dangerous level (90% of time)
          if (Math.random() < 0.9) {
            baseHumidity = Math.min(baseHumidity, dangerousHumidity - 10);
          }
        }

        updates.currentHumidity = Math.round(baseHumidity);
        break;

      case 'motion_sensor':
        // Motion is based on time of day and location
        let motionProbability = 0.1; // Default low probability

        if (sensor.location === 'living_room' && isDaytime) {
          motionProbability = 0.4; // Higher in living areas during day
        } else if (sensor.location === 'entrance') {
          // Morning or evening hours have higher activity at entrance
          const morningActivity = hour >= 7 && hour <= 9;
          const eveningActivity = hour >= 17 && hour <= 19;
          if (morningActivity || eveningActivity) {
            motionProbability = 0.6;
          }
        }

        // Consider dangerous threshold if set
        if (sensor.dangerousMotionIntensity) {
          // Convert string value to number
          const dangerousMotionIntensity = Number(
            sensor.dangerousMotionIntensity
          );
          // Occasionally generate above threshold values (1% of time)
          if (Math.random() < 0.01) {
            updates.currentMotionIntensity = Math.round(
              dangerousMotionIntensity + Math.random() * 10
            );
          } else {
            updates.currentMotionIntensity =
              Math.random() < motionProbability
                ? Math.round(20 + Math.random() * 60)
                : 0;
          }
        } else {
          updates.currentMotionIntensity =
            Math.random() < motionProbability
              ? Math.round(20 + Math.random() * 60)
              : 0;
        }
        break;

      case 'smoke_sensor':
        // Smoke is rare, almost always zero unless in kitchen during cooking time
        let smokeProbability = 0.01; // Very low probability

        if (sensor.location === 'kitchen') {
          const cookingTime =
            (hour >= 7 && hour <= 8) ||
            (hour >= 12 && hour <= 13) ||
            (hour >= 18 && hour <= 19);
          if (cookingTime) {
            smokeProbability = 0.1; // Higher during cooking times
          }
        }

        // Consider dangerous threshold if set
        if (sensor.dangerousSmokeLevel) {
          // Convert string value to number
          const dangerousSmokeLevel = Number(sensor.dangerousSmokeLevel);
          // Occasionally generate above threshold values (0.3% of time)
          if (Math.random() < 0.003) {
            updates.currentSmokeLevel = Math.round(
              dangerousSmokeLevel + Math.random() * 10
            );
          } else {
            updates.currentSmokeLevel =
              Math.random() < smokeProbability
                ? Math.round(
                    Math.random() * Math.min(20, dangerousSmokeLevel - 5)
                  )
                : 0;
          }
        } else {
          updates.currentSmokeLevel =
            Math.random() < smokeProbability
              ? Math.round(Math.random() * 20)
              : 0;
        }
        break;

      case 'water_leak_sensor':
        // Water leak is now an index, not just boolean
        const leakProbability = 0.01; // 1% chance of leak

        // Consider dangerous threshold if set
        if (sensor.dangerousWaterDetectionIndex) {
          // Convert string value to number
          const dangerousWaterDetectionIndex = Number(
            sensor.dangerousWaterDetectionIndex
          );
          // Occasionally generate above threshold values (0.2% of time)
          if (Math.random() < 0.002) {
            updates.currentWaterDetectionIndex = Math.round(
              dangerousWaterDetectionIndex + Math.random() * 10
            );
          } else {
            updates.currentWaterDetectionIndex =
              Math.random() < leakProbability
                ? Math.round(
                    Math.random() *
                      Math.min(30, dangerousWaterDetectionIndex - 10)
                  )
                : 0;
          }
        } else {
          updates.currentWaterDetectionIndex =
            Math.random() < leakProbability
              ? Math.round(Math.random() * 30)
              : 0;
        }
        break;

      case 'gas_sensor':
        // Gas levels - usually low, occasionally higher in kitchen
        let gasBase = 10; // Base level (ppm)
        let gasVariation = 5; // Normal variation

        if (sensor.location === 'kitchen') {
          const cookingTime =
            (hour >= 7 && hour <= 8) ||
            (hour >= 12 && hour <= 13) ||
            (hour >= 18 && hour <= 19);
          if (cookingTime) {
            gasBase = 30;
            gasVariation = 20;
          }
        }

        // Setting all gas measurements with respect to dangerous thresholds
        // Methan
        const dangerousMethanLevel = sensor.dangerousMethanLevel
          ? Number(sensor.dangerousMethanLevel)
          : null;
        const safeMethanLevel = dangerousMethanLevel
          ? Math.max(0.1, dangerousMethanLevel * 0.5)
          : 10;
        updates.currentMethanLevel =
          Math.random() < 0.002 && dangerousMethanLevel
            ? dangerousMethanLevel + Math.random() * 1 // Occasionally dangerous
            : safeMethanLevel * (0.5 + Math.random() * 0.3); // Normal range

        // Propane
        const dangerousPropaneLevel = sensor.dangerousPropaneLevel
          ? Number(sensor.dangerousPropaneLevel)
          : null;
        const safePropaneLevel = dangerousPropaneLevel
          ? Math.max(0.1, dangerousPropaneLevel * 0.5)
          : 5;
        updates.currentPropaneLevel =
          Math.random() < 0.002 && dangerousPropaneLevel
            ? dangerousPropaneLevel + Math.random() * 0.5 // Occasionally dangerous
            : safePropaneLevel * (0.5 + Math.random() * 0.3); // Normal range

        // Carbon Dioxide (CO2)
        const dangerousCarbonDioxideLevel = sensor.dangerousCarbonDioxideLevel
          ? Number(sensor.dangerousCarbonDioxideLevel)
          : null;
        const safeCO2Level = dangerousCarbonDioxideLevel
          ? dangerousCarbonDioxideLevel * 0.7
          : 400;
        updates.currentCarbonDioxideLevel =
          Math.random() < 0.002 && dangerousCarbonDioxideLevel
            ? dangerousCarbonDioxideLevel + Math.random() * 100 // Occasionally dangerous
            : Math.min(safeCO2Level, 400 + Math.random() * 200); // Normal range

        // Carbon Monoxide (CO)
        const dangerousCarbonMonoxideLevel = sensor.dangerousCarbonMonoxideLevel
          ? Number(sensor.dangerousCarbonMonoxideLevel)
          : null;
        const safeCOLevel = dangerousCarbonMonoxideLevel
          ? dangerousCarbonMonoxideLevel * 0.3
          : 5;
        updates.currentCarbonMonoxideLevel =
          Math.random() < 0.002 && dangerousCarbonMonoxideLevel
            ? dangerousCarbonMonoxideLevel + Math.random() * 10 // Occasionally dangerous
            : Math.min(safeCOLevel, 1 + Math.random() * 3); // Normal range

        // Nitrogen Dioxide (NO2)
        const dangerousNitrogenDioxideLevel =
          sensor.dangerousNitrogenDioxideLevel
            ? Number(sensor.dangerousNitrogenDioxideLevel)
            : null;
        const safeNO2Level = dangerousNitrogenDioxideLevel
          ? dangerousNitrogenDioxideLevel * 0.4
          : 20;
        updates.currentNitrogenDioxideLevel =
          Math.random() < 0.002 && dangerousNitrogenDioxideLevel
            ? dangerousNitrogenDioxideLevel + Math.random() * 20 // Occasionally dangerous
            : Math.min(safeNO2Level, 5 + Math.random() * 10); // Normal range

        // Ozone (O3)
        const dangerousOzoneLevel = sensor.dangerousOzoneLevel
          ? Number(sensor.dangerousOzoneLevel)
          : null;
        const safeO3Level = dangerousOzoneLevel
          ? dangerousOzoneLevel * 0.4
          : 20;
        updates.currentOzoneLevel =
          Math.random() < 0.002 && dangerousOzoneLevel
            ? dangerousOzoneLevel + Math.random() * 10 // Occasionally dangerous
            : Math.min(safeO3Level, 2 + Math.random() * 5); // Normal range

        // Round all values to make them more readable
        updates.currentMethanLevel =
          Math.round(updates.currentMethanLevel * 100) / 100;
        updates.currentPropaneLevel =
          Math.round(updates.currentPropaneLevel * 100) / 100;
        updates.currentCarbonDioxideLevel = Math.round(
          updates.currentCarbonDioxideLevel
        );
        updates.currentCarbonMonoxideLevel = Math.round(
          updates.currentCarbonMonoxideLevel
        );
        updates.currentNitrogenDioxideLevel = Math.round(
          updates.currentNitrogenDioxideLevel
        );
        updates.currentOzoneLevel = Math.round(updates.currentOzoneLevel);
        break;

      case 'air_quality_sensor':
        // Air quality based on location and season
        let aqiBase = 30; // Good baseline AQI

        if (sensor.location === 'outdoor') {
          // Urban areas tend to have worse air quality
          if (sensor.area === 'urban') {
            aqiBase = 60; // Moderate in urban areas

            // Rush hour effects
            const rushHour =
              (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
            if (rushHour) aqiBase += 20;

            // Winter tends to have worse air quality due to heating
            if (isWinter) aqiBase += 15;
          }
        }

        // Consider dangerous thresholds if set
        updates.currentAQI = Math.round(aqiBase + (Math.random() - 0.5) * 10);
        updates.currentPM25 = Math.round(aqiBase / 2 + Math.random() * 5);
        updates.currentPM10 = Math.round(aqiBase + Math.random() * 10);

        if (sensor.dangerousAQI && Math.random() < 0.003) {
          const dangerousAQI = Number(sensor.dangerousAQI);
          updates.currentAQI = Math.round(dangerousAQI + Math.random() * 10);
        }
        if (sensor.dangerousPM25 && Math.random() < 0.003) {
          const dangerousPM25 = Number(sensor.dangerousPM25);
          updates.currentPM25 = Math.round(dangerousPM25 + Math.random() * 5);
        }
        if (sensor.dangerousPM10 && Math.random() < 0.003) {
          const dangerousPM10 = Number(sensor.dangerousPM10);
          updates.currentPM10 = Math.round(dangerousPM10 + Math.random() * 10);
        }
        break;

      case 'light_sensor':
        // Light levels based on time of day and location
        let lightBase = 0; // Night time default

        if (isDaytime) {
          if (sensor.location === 'outdoor') {
            lightBase = 10000 + Math.random() * 40000; // Bright daylight

            // Cloudy days in fall/winter
            if ((isFall || isWinter) && Math.random() < 0.6) {
              lightBase = 2000 + Math.random() * 5000; // Overcast day
            }
          } else if (sensor.location === 'window') {
            lightBase = 2000 + Math.random() * 8000; // Indoor by window
          } else {
            lightBase = 200 + Math.random() * 500; // Indoor lighting
          }
        } else {
          // Night time
          if (sensor.location !== 'outdoor') {
            lightBase = Math.random() < 0.3 ? 100 + Math.random() * 200 : 0; // Some rooms have lights on
          }
        }

        // Consider dangerous threshold if set
        if (sensor.dangerousLux && Math.random() < 0.003) {
          const dangerousLux = Number(sensor.dangerousLux);
          updates.currentLux = Math.round(dangerousLux + Math.random() * 1000);
        } else {
          updates.currentLux = Math.round(lightBase);
        }
        break;

      case 'power_sensor':
        // Power consumption based on time of day
        let basePower = 50; // Base standby power

        // More electricity usage during waking hours
        if (hour >= 7 && hour <= 23) {
          basePower = 100 + Math.random() * 200;

          // Peak usage times
          const peakTime =
            (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21);
          if (peakTime) {
            basePower += 200 + Math.random() * 300;
          }
        }

        updates.currentPower = Math.round(basePower);
        updates.currentVoltage = Math.round(220 + (Math.random() - 0.5) * 10); // ~220V in Ukraine
        updates.currentCurrent = Math.round((basePower / 220) * 100) / 100; // I = P/V, rounded to 2 decimal places

        // Consider dangerous thresholds if set
        if (sensor.dangerousPower && Math.random() < 0.003) {
          const dangerousPower = Number(sensor.dangerousPower);
          updates.currentPower = Math.round(
            dangerousPower + Math.random() * 200
          );
        }
        if (sensor.dangerousVoltage && Math.random() < 0.003) {
          const dangerousVoltage = Number(sensor.dangerousVoltage);
          updates.currentVoltage = Math.round(
            dangerousVoltage + Math.random() * 20
          );
        }
        if (sensor.dangerousCurrent && Math.random() < 0.003) {
          const dangerousCurrent = Number(sensor.dangerousCurrent);
          updates.currentCurrent =
            Math.round((dangerousCurrent + Math.random()) * 100) / 100;
        }
        break;

      case 'weather_sensor':
        // Weather data is comprehensive
        // Temperature
        let weatherTemp = 20; // Default
        if (isWinter) weatherTemp = -5 + Math.random() * 10;
        else if (isSpring) weatherTemp = 10 + Math.random() * 10;
        else if (isSummer) weatherTemp = 25 + Math.random() * 8;
        else if (isFall) weatherTemp = 10 + Math.random() * 10;
        if (!isDaytime) weatherTemp -= 5;

        // Rain likelihood based on season
        let rainChance = 0.3; // Default
        if (isWinter)
          rainChance = 0.2; // Less rain, more snow in winter
        else if (isSpring)
          rainChance = 0.5; // Rainy spring
        else if (isSummer)
          rainChance = 0.3; // Summer thunderstorms
        else if (isFall) rainChance = 0.6; // Rainy fall

        // Wind based on season
        let windSpeed = 2 + Math.random() * 3; // Base wind
        if (isWinter || isFall) windSpeed += 2 + Math.random() * 4; // Windier in cold seasons

        // Consider dangerous thresholds if set
        if (
          sensor.dangerousTemperaturePlus &&
          sensor.dangerousTemperatureMinus &&
          Math.random() < 0.8
        ) {
          const dangerousTemperaturePlus = Number(
            sensor.dangerousTemperaturePlus
          );
          const dangerousTemperatureMinus = Number(
            sensor.dangerousTemperatureMinus
          );
          const safeMin = dangerousTemperatureMinus + 5;
          const safeMax = dangerousTemperaturePlus - 5;
          if (safeMax > safeMin) {
            weatherTemp = safeMin + Math.random() * (safeMax - safeMin);
          }
        }

        updates.currentTemperature = Math.round(weatherTemp);
        updates.currentHumidity = Math.round(60 + Math.random() * 20);
        updates.currentPressure = Math.round(1000 + (Math.random() - 0.5) * 20); // hPa
        updates.currentWindSpeed = Math.round(windSpeed);
        updates.currentWindDirection = Math.round(Math.random() * 360); // 0-359 degrees

        // In the model it's called currentRainIntensity, not currentRainfall
        updates.currentRainIntensity =
          Math.random() < rainChance ? Math.round(Math.random() * 5) : 0;

        // Remove currentUVIndex as it's not in the model
        break;

      default:
        console.warn(`Unknown sensor type: ${sensor.sensorType}`);
        return null;
    }

    if (Object.keys(updates).length === 0) {
      console.warn(
        `No updates generated for sensor type: ${sensor.sensorType}`
      );
      return null;
    }

    console.log('Generated updates: ', updates);

    return updates;
  }

  /**
   * Get the main value to use for the sensor log based on sensor type
   */
  getSensorMainValue(sensorType, updates) {
    switch (sensorType) {
      case 'temperature_sensor':
        return updates.currentTemperature;
      case 'humidity_sensor':
        return updates.currentHumidity;
      case 'motion_sensor':
        return updates.currentMotionIntensity;
      case 'smoke_sensor':
        return updates.currentSmokeLevel;
      case 'water_leak_sensor':
        return updates.currentWaterDetectionIndex;
      case 'gas_sensor':
        return updates.currentMethanLevel; // Primary gas value
      case 'air_quality_sensor':
        return updates.currentAQI;
      case 'light_sensor':
        return updates.currentLux;
      case 'power_sensor':
        return updates.currentPower;
      case 'weather_sensor':
        return updates.currentTemperature; // Use temperature as primary value
      default:
        return 0;
    }
  }

  generateBatteryLevel(sensor) {
    // Simulate battery level decrease over time
    const lastLevel = sensor.status?.batteryLevel || 100;
    const decrease = Math.random() * 0.1; // Small random decrease
    return Math.max(0, lastLevel - decrease);
  }

  generateSignalStrength(sensor) {
    // Random fluctuation in signal strength
    const baseStrength = sensor.status?.signalStrength || 90;
    const fluctuation = (Math.random() - 0.5) * 10;
    return Math.min(100, Math.max(0, baseStrength + fluctuation));
  }

  getSensorUnit(sensorType) {
    const units = {
      temperature_sensor: '°C',
      humidity_sensor: '%',
      motion_sensor: 'level',
      smoke_sensor: 'ppm',
      water_leak_sensor: 'index',
      contact_sensor: '',
      gas_sensor: 'ppm',
      air_quality_sensor: 'AQI',
      light_sensor: 'lux',
      power_sensor: 'W',
      weather_sensor: '°C', // Use temperature as primary unit
    };

    return units[sensorType] || '';
  }

  getEmulationStatus() {
    return {
      enabled: !!this.jobIntervalId,
      updateInterval: this.updateInterval,
      lastRun: this.lastRun,
    };
  }

  stopAll() {
    // Stop batch update job
    this.stopBatchUpdates();
  }
}

export default SensorEmulator;
