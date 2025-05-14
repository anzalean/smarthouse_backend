import {
  RoomRepository,
  DeviceRepository,
  SensorRepository,
} from '../repositories/index.js';

class RoomService {
  constructor() {
    this.roomRepository = RoomRepository;
    this.deviceRepository = DeviceRepository;
    this.sensorRepository = SensorRepository;
  }

  async getAllRooms(filter = {}) {
    return this.roomRepository.find(filter);
  }

  async getRoomsByHome(homeId, filter = {}) {
    return this.roomRepository.findByHomeId(homeId, filter);
  }

  async getRoomById(roomId) {
    return this.roomRepository.findById(roomId);
  }

  async createRoom(roomData) {
    return this.roomRepository.create(roomData);
  }

  async updateRoom(roomId, updateData) {
    return this.roomRepository.update(roomId, updateData);
  }

  async deleteRoom(roomId) {
    // First, we need to find all devices and sensors in this room
    const [devices, sensors] = await Promise.all([
      this.deviceRepository.find({ roomId }),
      this.sensorRepository.find({ roomId }),
    ]);

    // Then, remove the roomId from all devices and sensors
    // Alternative approach would be to delete them, but this is safer
    await Promise.all([
      this.deviceRepository.updateMany({ roomId }, { $unset: { roomId: 1 } }),
      this.sensorRepository.updateMany({ roomId }, { $unset: { roomId: 1 } }),
    ]);

    // Finally, delete the room
    return this.roomRepository.delete(roomId);
  }

  async getRoomWithDevicesAndSensors(roomId) {
    const room = await this.roomRepository.findById(roomId);

    if (!room) {
      return null;
    }

    const [devices, sensors] = await Promise.all([
      this.deviceRepository.find({ roomId }),
      this.sensorRepository.find({ roomId }),
    ]);

    return {
      ...room.toObject(),
      devices,
      sensors,
    };
  }

  // Add new method to delete all rooms for a specific home
  async deleteRoomsByHomeId(homeId) {
    // Get all rooms in this home
    const rooms = await this.roomRepository.findByHomeId(homeId);

    // For each room, handle devices and sensors
    for (const room of rooms) {
      // Update all devices and sensors in this room to remove roomId
      await Promise.all([
        this.deviceRepository.updateMany(
          { roomId: room._id },
          { $unset: { roomId: 1 } }
        ),
        this.sensorRepository.updateMany(
          { roomId: room._id },
          { $unset: { roomId: 1 } }
        ),
      ]);
    }

    // Delete all rooms in this home
    return this.roomRepository.deleteMany({ homeId });
  }
}

export default new RoomService();
