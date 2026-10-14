const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    ubicacion: {
      type: String,
      required: true,
      trim: true
    },
    capacidad: {
      type: Number,
      required: true,
      min: 1
    },
    tipo: {
      type: String,
      required: true,
      trim: true
    },
    disponible: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salon', salonSchema);
