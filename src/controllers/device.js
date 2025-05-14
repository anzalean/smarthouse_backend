import { DeviceService } from '../services/index.js';

export const getDeviceById = async (req, res) => {
  try {
    const device = await DeviceService.getDeviceById(req.params.id);
    res.status(200).json(device);
  } catch (error) {
    console.error('Get device error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getDevicesByHomeId = async (req, res) => {
  try {
    const devices = await DeviceService.getDevicesByHomeId(req.params.homeId);
    res.status(200).json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getDevicesByRoomId = async (req, res) => {
  try {
    const devices = await DeviceService.getDevicesByRoomId(req.params.roomId);
    res.status(200).json(devices);
  } catch (error) {
    console.error('Get devices by room error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const createDevice = async (req, res) => {
  try {
    // Ensure deviceType is properly set
    if (!req.body.deviceType) {
      return res.status(400).json({
        message:
          'Device type is required. Supported types: AirPurifier, Camera, Gate, HeatingValve, IrrigationSystem, SmartLock, SmartPlug, Thermostat, Ventilation, SmartLight',
      });
    }

    const device = await DeviceService.createDevice(req.body);
    res.status(201).json({
      message: 'Device created successfully',
      device,
    });
  } catch (error) {
    console.error('Create device error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const updatedDevice = await DeviceService.updateDevice(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    await DeviceService.deleteDevice(req.params.id);
    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(404).json({ message: error.message });
  }
};
