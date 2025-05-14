# Smart House Emulator Module

This module provides a virtual emulation system for IoT devices and sensors, allowing the smart house application to function without physical hardware.

## Features

- **Real-time data generation** for various sensor types with realistic patterns
- **Device state simulation** with appropriate state changes
- **WebSocket integration** for real-time updates to the UI
- **RESTful API** for controlling the emulation
- **Configurable patterns** for different sensor and device types
- **Integration with existing database models** and services

## Architecture

The emulator consists of several components:

- **EmulatorService**: Central coordinator that manages the emulation ecosystem
- **WebSocketManager**: Manages WebSocket connections for real-time data streaming
- **SensorEmulator**: Handles sensor data generation with realistic patterns
- **DeviceEmulator**: Handles device state changes and actions
- **EmulationPatterns**: Defines realistic data patterns for different sensor types

## API Endpoints

The emulator exposes several REST endpoints:

- `GET /api/emulator/status` - Get current emulation status
- `POST /api/emulator/sensor/:sensorId` - Configure sensor emulation
- `POST /api/emulator/device/:deviceId` - Configure device emulation
- `POST /api/emulator/device/:deviceId/control` - Control a device
- `POST /api/emulator/home/:homeId/start` - Start emulation for all devices in a home
- `POST /api/emulator/stop-all` - Stop all emulation

## WebSocket Events

The emulator broadcasts the following WebSocket events:

- `sensor:update` - When a sensor value is updated
- `device:update` - When a device state changes
- `device:status` - When a device emulation status changes

## Usage Examples

### Starting Sensor Emulation

```javascript
// Configure a temperature sensor with a specific pattern
await fetch('/api/emulator/sensor/123456789', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enabled: true,
    pattern: 'home',
    updateInterval: 5000, // Update every 5 seconds
  }),
});
```

### Controlling a Device

```javascript
// Turn on a smart plug
await fetch('/api/emulator/device/987654321/control', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'setPower',
    parameters: {
      power: true,
    },
  }),
});
```

### Listening for Real-time Updates

```javascript
// Connect to WebSocket and listen for updates
const socket = io();

// Listen for sensor updates
socket.on('sensor:update', data => {
  console.log(`Sensor ${data.sensorId} updated: ${data.value}${data.unit}`);
});

// Listen for device updates
socket.on('device:update', data => {
  console.log(`Device ${data.deviceId} updated: `, data.state);
});
```

## Supported Sensor Types

- Temperature Sensors
- Humidity Sensors
- Motion Sensors
- Smoke Sensors
- Water Leak Sensors
- Contact Sensors
- Gas Sensors
- Air Quality Sensors
- Light Sensors
- Power Sensors
- Weather Sensors

## Supported Device Types

- Smart Plugs
- Thermostats
- Heating Valves
- Smart Locks
- Gates
- Irrigation Systems
- Ventilation
- Air Purifiers
- Cameras

## Emulation Patterns

Each sensor type supports different emulation patterns. For example, temperature sensors support:

- `default`: Simple random variation around a base temperature
- `home`: Realistic indoor temperature that varies throughout the day
- `outdoor`: Outdoor temperature with weather and seasonal effects
- `fridge`: Refrigerator temperature with compressor cycles
- `stable`: Very stable temperature for controlled environments
