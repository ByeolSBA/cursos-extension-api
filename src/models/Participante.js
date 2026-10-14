const mongoose = require('mongoose');

const participanteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    tipo_participante: {
      type: String,
      required: true,
      enum: ['Estudiante', 'Administrativo', 'Externo']
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

module.exports = mongoose.model('Participante', participanteSchema);
