require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Backend server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
