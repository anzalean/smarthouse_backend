class EmulationPatterns {
  constructor() {
    this.patterns = {
      // Temperature patterns
      temperature_sensor: {
        default: this.generateDefaultTemperature.bind(this),
        home: this.generateHomeTemperature.bind(this),
        outdoor: this.generateOutdoorTemperature.bind(this),
        fridge: this.generateFridgeTemperature.bind(this),
        stable: this.generateStableTemperature.bind(this),
      },

      // Humidity patterns
      humidity_sensor: {
        default: this.generateDefaultHumidity.bind(this),
        bathroom: this.generateBathroomHumidity.bind(this),
        outdoor: this.generateOutdoorHumidity.bind(this),
        basement: this.generateBasementHumidity.bind(this),
      },

      // Motion sensor patterns
      motion_sensor: {
        default: this.generateDefaultMotionIntensity.bind(this),
        living_area: this.generateLivingAreaMotionIntensity.bind(this),
        entrance: this.generateEntranceMotionIntensity.bind(this),
      },

      // Smoke sensor patterns
      smoke_sensor: {
        default: this.generateDefaultSmoke.bind(this),
        kitchen: this.generateKitchenSmoke.bind(this),
      },

      // Light sensor patterns
      light_sensor: {
        default: this.generateDefaultLight.bind(this),
        outdoor: this.generateOutdoorLight.bind(this),
        window: this.generateWindowLight.bind(this),
      },

      // Default pattern for all other sensor types
      default: {
        default: this.generateRandomValue.bind(this),
      },
    };
  }

  // Main method to generate values for any sensor type and pattern
  generateValue(sensorType, patternName = 'default') {
    // Get the appropriate pattern generator for this sensor type
    const sensorPatterns =
      this.patterns[sensorType] || this.patterns['default'];

    // Get the specific pattern or default if not found
    const pattern = sensorPatterns[patternName] || sensorPatterns['default'];

    // Generate and return the value
    return pattern();
  }

  // Temperature patterns
  generateDefaultTemperature() {
    // Base indoor temperature with small random variation
    return 22 + (Math.random() - 0.5) * 2;
  }

  generateHomeTemperature() {
    // Indoor home temperature that varies throughout the day
    const hour = new Date().getHours();

    // Base temperature curve by time of day
    let baseTemp;
    if (hour >= 0 && hour < 6) {
      baseTemp = 21; // Night - slightly cooler
    } else if (hour >= 6 && hour < 9) {
      baseTemp = 22; // Morning warmup
    } else if (hour >= 9 && hour < 18) {
      baseTemp = 23; // Day
    } else if (hour >= 18 && hour < 22) {
      baseTemp = 22.5; // Evening
    } else {
      baseTemp = 21.5; // Late night cooling down
    }

    // Add small random variation
    return baseTemp + (Math.random() - 0.5) * 1.5;
  }

  generateOutdoorTemperature() {
    // Outdoor temperature varies more dramatically by time of day
    const hour = new Date().getHours();
    const date = new Date();
    const month = date.getMonth(); // 0-11

    // Seasonal base temperature (very simplified)
    let seasonalBase;
    if (month >= 11 || month <= 1) {
      seasonalBase = 0; // Winter
    } else if (month >= 2 && month <= 4) {
      seasonalBase = 10; // Spring
    } else if (month >= 5 && month <= 7) {
      seasonalBase = 25; // Summer
    } else {
      seasonalBase = 15; // Fall
    }

    // Daily variation
    const timeOfDay = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    const dailyVariation = timeOfDay * 5; // +/- 5 degrees C from base

    // Random variation (weather effects)
    const randomVariation = (Math.random() - 0.5) * 3;

    return seasonalBase + dailyVariation + randomVariation;
  }

  generateFridgeTemperature() {
    // Fridge temperature doesn't vary much but cycles with compressor
    const baseTemp = 4;
    const compressorCycle =
      Math.sin((Date.now() / 1000 / 60 / 10) * Math.PI) * 0.5;
    return baseTemp + compressorCycle + (Math.random() - 0.5) * 0.5;
  }

  generateStableTemperature() {
    // Very stable temperature for areas like server rooms
    return 19 + (Math.random() - 0.5) * 0.3;
  }

  // Humidity patterns
  generateDefaultHumidity() {
    // Default indoor humidity
    return 40 + (Math.random() - 0.5) * 10;
  }

  generateBathroomHumidity() {
    // Bathroom humidity with occasional spikes (showers)
    const baseHumidity = 60;

    // Simulate shower at certain times of day
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const isShowerTime =
      (hour === 7 && minute >= 0 && minute <= 20) || // Morning shower
      (hour === 22 && minute >= 0 && minute <= 20); // Evening shower

    if (isShowerTime) {
      return baseHumidity + 20 + Math.random() * 10;
    }

    return baseHumidity + (Math.random() - 0.5) * 10;
  }

  generateOutdoorHumidity() {
    // Outdoor humidity varies by time of day and season
    const hour = new Date().getHours();
    const baseHumidity = 70; // Higher base for outdoor

    // Early morning tends to be more humid
    const timeEffect = hour >= 5 && hour <= 10 ? 10 : 0;

    return baseHumidity + timeEffect + (Math.random() - 0.5) * 20;
  }

  generateBasementHumidity() {
    // Basement tends to be more humid and stable
    return 65 + (Math.random() - 0.5) * 5;
  }

  // Motion sensor patterns
  generateDefaultMotionIntensity() {
    // Return intensity from 0-100, with 10% chance of higher values
    return Math.random() < 0.1 ? Math.random() * 80 + 20 : Math.random() * 5;
  }

  generateLivingAreaMotionIntensity() {
    // Living areas have more motion during day and evening
    const hour = new Date().getHours();

    // Probability and intensity based on time of day
    let motionIntensity;
    let activityChance;
    
    if (hour >= 0 && hour < 6) {
      // Very low at night
      activityChance = 0.02;
      motionIntensity = 10;
    } else if (hour >= 6 && hour < 9) {
      // Morning activities
      activityChance = 0.4;
      motionIntensity = 60;
    } else if (hour >= 9 && hour < 17) {
      // During work day
      activityChance = 0.1;
      motionIntensity = 30;
    } else if (hour >= 17 && hour < 23) {
      // Evening activities
      activityChance = 0.5;
      motionIntensity = 70;
    } else {
      // Late night
      activityChance = 0.05;
      motionIntensity = 15;
    }

    return Math.random() < activityChance 
           ? motionIntensity + (Math.random() - 0.5) * 20 
           : Math.random() * 5;
  }

  generateEntranceMotionIntensity() {
    // Entrance has brief activity patterns
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();

    // Movement at key times
    const isEntryTime =
      (hour === 8 && minute >= 0 && minute <= 5) || // Morning departure
      (hour === 17 && minute >= 30 && minute <= 40); // Evening return

    // Higher intensity during usual coming/going times
    const isActivityTime = 
      (hour >= 7 && hour <= 9) || // Morning activity hours
      (hour >= 16 && hour <= 19);  // Evening activity hours

    if (isEntryTime) {
      // Intense activity during entry/exit
      return 80 + Math.random() * 20;
    } else if (isActivityTime) {
      // Moderate activity during active hours
      return Math.random() < 0.3 ? 30 + Math.random() * 40 : Math.random() * 10;
    }

    // Very low activity during other times
    return Math.random() < 0.05 ? 10 + Math.random() * 20 : Math.random() * 5;
  }

  // Smoke sensor patterns
  generateDefaultSmoke() {
    // Very low probability of smoke detection
    return Math.random() < 0.005 ? Math.random() * 50 : 0;
  }

  generateKitchenSmoke() {
    // Kitchen has higher smoke probability during meal times
    const hour = new Date().getHours();

    // Cooking times
    const isCookingTime =
      (hour >= 7 && hour <= 8) || // Breakfast
      (hour >= 12 && hour <= 13) || // Lunch
      (hour >= 18 && hour <= 19); // Dinner

    // Higher smoke probability during cooking
    const smokeProbability = isCookingTime ? 0.05 : 0.002;

    if (Math.random() < smokeProbability) {
      return Math.random() * 150; // Random smoke level when detected
    }

    return 0;
  }

  // Light sensor patterns
  generateDefaultLight() {
    // Default indoor light level (lux)
    return Math.random() * 300;
  }

  generateOutdoorLight() {
    // Outdoor light varies dramatically by time of day
    const hour = new Date().getHours();

    // Night time
    if (hour >= 22 || hour < 5) {
      return Math.random() * 5; // Very dark with maybe some moonlight or street lights
    }

    // Dawn/dusk
    if (hour === 5 || hour === 6 || hour === 20 || hour === 21) {
      return 100 + Math.random() * 1000;
    }

    // Daylight
    if (hour >= 7 && hour <= 19) {
      const midday = 12;
      const distance = Math.abs(hour - midday);
      const maxLight = 50000; // Max daylight lux

      // Light peaks at midday
      const lightLevel = maxLight * (1 - distance / 12);

      // Cloud variation (random)
      const cloudFactor = 0.5 + Math.random() * 0.5;

      return lightLevel * cloudFactor;
    }

    return Math.random() * 50; // Fallback
  }

  generateWindowLight() {
    // Window light combines indoor lights and some outdoor influence
    const outdoor = this.generateOutdoorLight() * 0.3; // Reduced through window
    const indoor = this.generateDefaultLight();

    return indoor + outdoor;
  }

  // Generic random value generator
  generateRandomValue() {
    // Generate a random value between 0 and 100
    return Math.random() * 100;
  }
}

export default EmulationPatterns;
