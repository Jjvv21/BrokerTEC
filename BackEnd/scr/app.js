import express from 'express';
import cors from 'cors';
import routes from './routes/index.js'; // ← QUITAR /src
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js'; // ← QUITAR /src

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;