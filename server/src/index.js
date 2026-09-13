import { startServer } from './api/server.js';
import config from './utils/config.js';

startServer(config.port).catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
