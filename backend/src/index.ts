import express, { Request, Response } from 'express';
import authRouter from './routes/auth';
import contentRouter from './routes/content';
import analyticsRouter from './routes/analytics';
import searchRouter from './routes/search';

const app = express();
app.use(express.json());

app.use('/auth', authRouter);
app.use('/content', contentRouter);
app.use('/analytics', analyticsRouter);
app.use('/search', searchRouter);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
