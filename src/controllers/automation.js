import AutomationService from '../services/AutomationService.js';

export const getAutomationsByHome = async (req, res) => {
  try {
    const { homeId } = req.query;
    if (!homeId) {
      return res.status(400).json({ error: 'homeId is required' });
    }
    const automations = await AutomationService.getAutomationsByHomeId(homeId);
    res.status(200).json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
};

export const getActiveAutomationsByHome = async (req, res) => {
  try {
    const { homeId } = req.query;
    if (!homeId) {
      return res.status(400).json({ error: 'homeId is required' });
    }
    const automations =
      await AutomationService.getActiveAutomationsByHomeId(homeId);
    res.status(200).json(automations);
  } catch (error) {
    console.error('Error fetching active automations:', error);
    res.status(500).json({ error: 'Failed to fetch active automations' });
  }
};

export const getAutomationsByTriggerType = async (req, res) => {
  try {
    const { homeId } = req.query;
    const { type } = req.params;
    if (!homeId) {
      return res.status(400).json({ error: 'homeId is required' });
    }
    const automations = await AutomationService.getAutomationsByTriggerType(
      homeId,
      type
    );
    res.status(200).json(automations);
  } catch (error) {
    console.error('Error fetching automations by trigger type:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch automations by trigger type' });
  }
};

export const getAutomationById = async (req, res) => {
  try {
    const { id } = req.params;
    const automation = await AutomationService.getAutomationById(id);
    res.status(200).json(automation);
  } catch (error) {
    console.error('Error fetching automation:', error);
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
};

export const createAutomation = async (req, res) => {
  try {
    const automation = await AutomationService.createAutomation(req.body);
    res.status(201).json(automation);
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
};

export const updateAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    const automation = await AutomationService.updateAutomation(id, req.body);
    res.status(200).json(automation);
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
};

export const toggleAutomationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const automation = await AutomationService.toggleAutomationStatus(id);
    res.status(200).json(automation);
  } catch (error) {
    console.error('Error toggling automation status:', error);
    res.status(500).json({ error: 'Failed to toggle automation status' });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    await AutomationService.deleteAutomation(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
};
