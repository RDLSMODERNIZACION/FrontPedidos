import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { FRONTEND_ORIGIN } from './config.js';
import apiRoutes from './routes/apiRoutes.js';
import { stream } from './utils/logger.js';

const app = express();

app.use(cors({ origin: FRONTEND_ORIGIN || '*' }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('[:date[iso]] :method :url :status - :response-time ms', { stream }));

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({ estado: 'error', mensaje: 'Endpoint no encontrado' });
});

