import logger from '../../utils/logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logMeta = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip: ip || req.socket.remoteAddress,
    };

    if (statusCode >= 500) {
      logger.error(logMeta, `${method} ${originalUrl} ${statusCode} (${duration}ms)`);
    } else if (statusCode >= 400) {
      logger.warn(logMeta, `${method} ${originalUrl} ${statusCode} (${duration}ms)`);
    } else {
      logger.info(logMeta, `${method} ${originalUrl} ${statusCode} (${duration}ms)`);
    }
  });

  next();
}

export default requestLogger;
