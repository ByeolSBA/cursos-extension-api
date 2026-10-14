const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema(
  {
    curso_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: true
    },
    salon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true
    },
    fecha_inicio: {
      type: Date,
      required: true
    },
    hora_inicio: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    duracion_horas: {
      type: Number,
      required: true,
      min: 1
    },
    estado: {
      type: String,
      required: true,
      enum: ['Asignada', 'Cancelada', 'Pendiente'],
      default: 'Pendiente'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asignacion', asignacionSchema);
