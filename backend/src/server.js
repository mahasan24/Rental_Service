import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Rentel API running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
