import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TaskPilot API' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
