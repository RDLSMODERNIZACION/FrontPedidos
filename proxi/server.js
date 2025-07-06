import app from './src/app.js';
import { PORT } from './src/config.js';
import { logger } from './src/utils/logger.js';

app.listen(PORT, () => {
  logger.info(`🚀 Proxy activo en http://localhost:${PORT}`);
});
