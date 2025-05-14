import mongoose from 'mongoose';
import { env } from '../utils/env.js';

export const initMongoDB = async () => {
  try {
    const user = env('MONGODB_USER');
    const password = env('MONGODB_PASSWORD');
    const url = env('MONGODB_PATH');
    const db = env('MONGODB_DB');

    const uri = `mongodb+srv://${user}:${password}@${url}/${db}?retryWrites=true&w=majority`;

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up global mongoose configuration
    mongoose.set('debug', env('NODE_ENV', 'development') === 'development');

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
