import mongoose from 'mongoose';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

let isConnected = false;
let memoryServer = null;

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
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    });
    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    logger.warn({ err: error.message }, 'Standard MongoDB connection failed, checking in-memory fallback...');

    if (config.nodeEnv !== 'production' && !process.env.MONGODB_URI) {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        logger.info(`In-memory MongoDB Connected for development at ${memUri}`);
        return conn.connection;
      } catch (memErr) {
        logger.warn({ err: memErr.message }, 'Failed to start in-memory MongoDB');
      }
    }

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
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
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
