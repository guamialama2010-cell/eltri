import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import authRoutes from './routes/auth.js.js';
import estudianteRoutes from './routes/estudiante.js.js';
import profesorRoutes from './routes/profesor.js.js';
import materiasRoutes from './routes/materias.js.js';
import tareasRoutes from './routes/tareas.js.js';
import calificacionesRoutes from './routes/calificaciones.js.js';
import iaRoutes from './routes/ia.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

await initDatabase();

app.use('/auth', authRoutes);
app.use('/estudiante', estudianteRoutes);
app.use('/profesor', profesorRoutes);
app.use('/materias', materiasRoutes);
app.use('/tareas', tareasRoutes);
app.use('/calificaciones', calificacionesRoutes);
app.use('/ia', iaRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});