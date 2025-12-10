import express, { type Request, type Response } from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';

const app = express();
app.use(
  cors({
    origin: '*', // dev-friendly; tighten in production
  }),
);
app.use(express.json());

app.use('/tasks', taskRoutes);

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

