import express, { Request, Response } from 'express';
import openapi from './openapi.json';
import authRouter from './routes/auth';
import contentRouter from './routes/content';
import analyticsRouter from './routes/analytics';
import searchRouter from './routes/search';
import notificationsRouter from './routes/notifications';

const app = express();
app.use(express.json());

app.get('/docs', (_req: Request, res: Response) => {
  res.json(openapi);
});

app.use('/auth', authRouter);
app.use('/content', contentRouter);
app.use(analyticsRouter);
app.use('/search', searchRouter);
app.use('/notifications', notificationsRouter);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
