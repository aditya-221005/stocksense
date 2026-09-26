import app from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/db.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 StockSense Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server & Prisma connection.');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed.');
  });
});
