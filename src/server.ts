import express from 'express';
import { join } from 'node:path';

const app = express();

const browserDistFolder = join(import.meta.dirname, '../browser');

// Serve static files
app.use(express.static(browserDistFolder, {
  index: false,
  redirect: false,
}));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  const indexPath = join(browserDistFolder, 'index.html');
  res.sendFile(indexPath);
});

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
