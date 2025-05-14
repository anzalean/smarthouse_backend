import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { setupServer } from './server.js';
import { initMongoDB } from './config/database.js';
import { WebSocketManager, EmulatorService } from './emulator/index.js';
import { env } from './utils/env.js';
import { AutomationService } from './services/index.js';

const bootstrap = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await initMongoDB();

    console.log('Setting up server...');
    const app = await setupServer();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket server
    console.log('Initializing WebSocket server...');
    const websocketManager = new WebSocketManager();
    websocketManager.initialize(httpServer);

    // Initialize the emulator service
    console.log('Initializing emulator service...');
    EmulatorService.initialize();

    // Set emulator reference in AutomationService
    console.log('Connecting AutomationService to Emulator...');
    AutomationService.setEmulatorService(EmulatorService);

    // Start emulation if AUTO_START_EMULATION is enabled
    if (env('AUTO_START_EMULATION', 'false') === 'true') {
      console.log('Auto-starting sensor emulation...');
      // Use specified update interval
      const updateIntervalMs = parseInt(
        env('EMULATION_UPDATE_INTERVAL', '3600000')
      );
      try {
        const startResult = await EmulatorService.startAll({
          updateInterval: updateIntervalMs,
        });
        console.log(`Emulation started: ${JSON.stringify(startResult)}`);
      } catch (err) {
        console.error('Failed to auto-start emulation:', err);
      }
    }

    const PORT = env('PORT', '5000');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(
        `API documentation available at: http://localhost:${PORT}/api-docs`
      );
      console.log(`WebSocket server available at: ws://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', err => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      httpServer.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
};

void bootstrap();
