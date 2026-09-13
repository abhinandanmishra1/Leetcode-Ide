import rateLimit from 'express-rate-limit';
import config from '../../utils/config.js';

export const submissionRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Maximum ${config.rateLimit.max} submissions per minute.`,
  },
});

export default {
  submissionRateLimiter,
};
