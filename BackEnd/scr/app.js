import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import userRoutes from "./routes/user.routes.js";


const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📍 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`);
  console.log('📦 Headers:', req.headers.authorization ? 'Con token' : 'Sin token');
  next();
});

// Routes
app.use('/api', routes);
app.use("/api/usuarios", userRoutes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;