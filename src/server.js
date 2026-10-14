require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const cursosRoutes = require('./routes/cursos');
const participantesRoutes = require('./routes/participantes');
const inscripcionesRoutes = require('./routes/inscripciones');
const salonesRoutes = require('./routes/salones');
const asignacionesRoutes = require('./routes/asignaciones');

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API de Cursos de Extensión funcionando' });
});

app.use('/api/cursos', cursosRoutes);
app.use('/api/participantes', participantesRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/salones', salonesRoutes);
app.use('/api/asignaciones', asignacionesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError' || error.name === 'CastError' || error.code === 11000) {
    return res.status(400).json({
      error: 'Solicitud inválida',
      detalle: error.message
    });
  }

  if (error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido' });
  }

  console.error('Error interno:', error);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

async function startServer() {
  if (!mongoUri) {
    throw new Error('La variable de entorno MONGODB_URI es obligatoria');
  }

  await mongoose.connect(mongoUri);

  app.listen(port, () => {
    console.log('API Cursos de Extensión');
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
    console.log('MongoDB conectada correctamente');
  });
}

startServer().catch((error) => {
  console.error('No se pudo iniciar la API:', error.message);
  process.exit(1);
});
