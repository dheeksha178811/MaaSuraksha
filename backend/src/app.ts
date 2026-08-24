import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
