import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import { seedInitialData } from './seed';
import { router } from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database schema and initial data
initDb();
seedInitialData();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'service-request-automation-demo-api',
  });
});

export const server = app.listen(PORT, () => {
  console.log(`🚀 Service Request API running on http://localhost:${PORT}`);
});

export default app;

