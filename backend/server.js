require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  await connectDB();

  // Import queues to register workers after DB connection is established
  require('./src/queues/datasetQueue');
  require('./src/queues/reportQueue');

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  const shutdown = (signal) => {
    console.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      console.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
