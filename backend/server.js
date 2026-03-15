const app = require('./src/app');
const { PORT } = process.env;

app.listen(PORT || 5000, () => {
  console.log(`Backend server running on port ${PORT || 5000}`);
});
