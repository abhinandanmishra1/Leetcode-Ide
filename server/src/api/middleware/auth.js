import jwt from 'jsonwebtoken';
import config from '../../utils/config.js';
import User from '../../db/models/User.js';
import logger from '../../utils/logger.js';

export async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not found or deleted' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn({ err: err.message }, 'Invalid authentication token');
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

export default {
  authenticateUser,
  optionalAuth,
};
