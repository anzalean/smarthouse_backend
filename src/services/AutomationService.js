import AutomationRepository from '../repositories/AutomationRepository.js';
import EmulatorService from '../emulator/EmulatorService.js';

class AutomationService {
  constructor() {
    this.emulatorService = null;
  }

  // Set the emulator service reference (called during app initialization)
  setEmulatorService(emulatorService) {
    this.emulatorService = emulatorService;
  }

  async getAutomationById(automationId) {
    const automation = await AutomationRepository.findById(automationId);

    if (!automation) {
      throw new Error('Automation not found');
    }

    return automation;
  }

  async getAutomationsByHomeId(homeId) {
    return AutomationRepository.findByHomeId(homeId);
  }

  async getActiveAutomationsByHomeId(homeId) {
    return AutomationRepository.findActiveByHomeId(homeId);
  }

  async getAutomationsByTriggerType(homeId, triggerType) {
    return AutomationRepository.findByTriggerType(homeId, triggerType);
  }

  async createAutomation(automationData) {
    // Create automation in database
    const automation = await AutomationRepository.create(automationData);

    // Update automation schedules if automation is active and time-based
    if (
      automation.isActive &&
      automation.triggerType === 'time' &&
      this.emulatorService
    ) {
      try {
        await this.emulatorService.websocketManager.emit('automation:update', {
          automationId: automation._id,
          action: 'create',
        });
      } catch (error) {
        console.error('Error notifying emulator about new automation:', error);
      }
    }

    return automation;
  }

  async updateAutomation(automationId, automationData) {
    const automation = await AutomationRepository.findById(automationId);

    if (!automation) {
      throw new Error('Automation not found');
    }

    // Update automation in database
    const updatedAutomation = await AutomationRepository.update(automationId, {
      ...automationData,
      updatedAt: new Date(),
    });

    // Update automation schedules if changes affect timing
    if (this.emulatorService) {
      try {
        await this.emulatorService.websocketManager.emit('automation:update', {
          automationId: updatedAutomation._id,
          action: 'update',
        });
      } catch (error) {
        console.error(
          'Error notifying emulator about automation update:',
          error
        );
      }
    }

    return updatedAutomation;
  }

  async deleteAutomation(automationId) {
    const automation = await AutomationRepository.findById(automationId);

    if (!automation) {
      throw new Error('Automation not found');
    }

    // Remove automation from database
    const result = await AutomationRepository.delete(automationId);

    // Update automation schedules
    if (this.emulatorService) {
      try {
        await this.emulatorService.websocketManager.emit('automation:update', {
          automationId: automation._id,
          action: 'delete',
        });
      } catch (error) {
        console.error(
          'Error notifying emulator about automation deletion:',
          error
        );
      }
    }

    return result;
  }

  async deleteAutomationsByHomeId(homeId) {
    // Get automations before deleting them
    const automations = await this.getAutomationsByHomeId(homeId);

    // Delete from database
    const result = await AutomationRepository.deleteMany({ homeId });

    // Notify emulator about deleted automations
    if (this.emulatorService && automations.length > 0) {
      try {
        for (const automation of automations) {
          await this.emulatorService.websocketManager.emit(
            'automation:update',
            {
              automationId: automation._id,
              action: 'delete',
            }
          );
        }
      } catch (error) {
        console.error(
          'Error notifying emulator about home automations deletion:',
          error
        );
      }
    }

    return result;
  }

  async toggleAutomationStatus(automationId) {
    const automation = await AutomationRepository.findById(automationId);

    if (!automation) {
      throw new Error('Automation not found');
    }

    // Update automation status in database
    const updatedAutomation = await AutomationRepository.update(automationId, {
      isActive: !automation.isActive,
      updatedAt: new Date(),
    });

    // Update automation schedules
    if (this.emulatorService) {
      try {
        await this.emulatorService.websocketManager.emit('automation:update', {
          automationId: automation._id,
          action: 'toggle',
        });
      } catch (error) {
        console.error(
          'Error notifying emulator about automation status toggle:',
          error
        );
      }
    }

    return updatedAutomation;
  }

  // New method to execute automation manually (for testing)
  async executeAutomationManually(automationId) {
    const automation = await AutomationRepository.findById(automationId);

    if (!automation) {
      throw new Error('Automation not found');
    }

    if (!automation.isActive) {
      throw new Error('Cannot execute inactive automation');
    }

    if (!this.emulatorService) {
      throw new Error('Emulator service not available');
    }

    try {
      // Emit event to execute automation
      await this.emulatorService.websocketManager.emit('automation:execute', {
        automationId: automation._id,
      });

      return {
        success: true,
        message: 'Automation execution requested',
        automationId: automation._id,
      };
    } catch (error) {
      console.error('Error executing automation manually:', error);
      throw new Error(`Failed to execute automation: ${error.message}`);
    }
  }
}

export default new AutomationService();
