const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    tipo: {
      type: String,
      required: true,
      enum: ['Curso', 'Diplomado', 'Seminario', 'Taller']
    },
    duracion_horas: {
      type: Number,
      required: true,
      min: 1
    },
    cupo_maximo: {
      type: Number,
      required: true,
      min: 1
    },
    modalidad: {
      type: String,
      required: true,
      enum: ['Presencial', 'Virtual']
    },
    responsable: {
      type: String,
      required: true,
      trim: true
    },
    estado: {
      type: String,
      required: true,
      enum: ['Activo', 'Inactivo'],
      default: 'Activo'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Curso', cursoSchema);
