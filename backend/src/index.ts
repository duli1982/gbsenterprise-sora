import express, { Request, Response } from 'express';
import authRouter from './routes/auth';
import contentRouter from './routes/content';

const app = express();

app.use('/auth', authRouter);
app.use('/content', contentRouter);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
