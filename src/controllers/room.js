import { RoomService } from '../services/index.js';

// Get all rooms for a specific home
export const getRoomsByHome = async (req, res) => {
  try {
    const { homeId } = req.query;
    if (!homeId) {
      return res.status(400).json({ error: 'homeId is required' });
    }

    const rooms = await RoomService.getRoomsByHome(homeId);
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get a specific room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await RoomService.getRoomById(id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

// Get room with all devices and sensors
export const getRoomDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const roomDetails = await RoomService.getRoomWithDevicesAndSensors(id);

    if (!roomDetails) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(roomDetails);
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { homeId, name, type } = req.body;

    if (!homeId || !name) {
      return res.status(400).json({ error: 'homeId and name are required' });
    }

    const roomData = { homeId, name };
    if (type) roomData.type = type;

    const newRoom = await RoomService.createRoom(roomData);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Update an existing room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name && !type) {
      return res
        .status(400)
        .json({ error: 'At least one of name or type is required for update' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;

    const updatedRoom = await RoomService.updateRoom(id, updateData);

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await RoomService.deleteRoom(id);

    if (!deletedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};
