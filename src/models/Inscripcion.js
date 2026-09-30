const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema(
  {
    participante_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participante',
      required: true
    },
    curso_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: true
    },
    fecha_inscripcion: {
      type: Date,
      required: true,
      default: Date.now
    },
    estado: {
      type: String,
      required: true,
      enum: ['Confirmada', 'Cancelada', 'Pendiente'],
      default: 'Pendiente'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
