import mongoose from 'mongoose';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

let isConnected = false;

export async function connectDB(uri = config.mongoUri) {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (!uri) {
    logger.warn('MONGODB_URI is not set. Database features will be unavailable.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    logger.error({ err: error.message }, 'MongoDB connection error');
    // In dev or testing, do not crash the entire process if MongoDB is not running locally
    if (config.nodeEnv === 'production') {
      throw error;
    }
    return null;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
}

export function getDBStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
  };
}

export default {
  connectDB,
  disconnectDB,
  getDBStatus,
};
