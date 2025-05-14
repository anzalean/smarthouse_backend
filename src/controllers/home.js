import { HomeService } from '../services/index.js';

export const createHome = async (req, res) => {
  try {
    const { homeData, addressData } = req.body;

    const result = await HomeService.createHome(
      homeData,
      addressData,
      req.user
    );

    res.status(201).json({
      message: 'Home created successfully',
      home: result.home,
      address: result.address,
    });
  } catch (error) {
    console.error('Create home error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserHomes = async (req, res) => {
  try {
    const homes = await HomeService.getHomesByUserId(req.user.id);
    res.status(200).json(homes);
  } catch (error) {
    console.error('Get user homes error:', error);
    res.status(404).json({ message: error.message });
  }
};

export const getHomeById = async (req, res) => {
  try {
    const home = await HomeService.getHomeById(req.params.id, req.user.id);
    res.status(200).json(home);
  } catch (error) {
    console.error('Get home by ID error:', error);
    const statusCode = error.message.includes('Access denied') ? 403 : 404;
    res.status(statusCode).json({ message: error.message });
  }
};

export const updateHome = async (req, res) => {
  try {
    const { homeData, addressData } = req.body;

    const result = await HomeService.updateHomeWithAddress(
      req.params.id,
      homeData,
      addressData,
      req.user.id
    );

    res.status(200).json({
      message: 'Home updated successfully',
      home: result.home,
      address: result.address,
    });
  } catch (error) {
    console.error('Update home error:', error);

    if (error.message.includes('No valid fields')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes('Only home owners')) {
      return res.status(403).json({ message: error.message });
    }

    res.status(404).json({ message: error.message });
  }
};

export const deleteHome = async (req, res) => {
  try {
    const result = await HomeService.deleteHome(req.params.id, req.user.id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Delete home error:', error);

    if (error.message.includes('Only home owners')) {
      return res.status(403).json({ message: error.message });
    }

    if (error.message.includes('Home not found')) {
      return res.status(404).json({ message: error.message });
    }

    res
      .status(500)
      .json({ message: 'Failed to delete home. Please try again later.' });
  }
};
