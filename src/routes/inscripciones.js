const express = require('express');
const Inscripcion = require('../models/Inscripcion');
const Participante = require('../models/Participante');
const Curso = require('../models/Curso');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const inscripciones = await Inscripcion.find()
      .populate('participante_id')
      .populate('curso_id')
      .sort({ fecha_inscripcion: -1 });
    return res.json(inscripciones);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id)
      .populate('participante_id')
      .populate('curso_id');
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    return res.json(inscripcion);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { participante_id: participanteId, curso_id: cursoId } = req.body;
    const [participante, curso] = await Promise.all([
      Participante.findById(participanteId),
      Curso.findById(cursoId)
    ]);
    if (!participante) {
      return res.status(400).json({ error: 'participante_id no corresponde a un participante existente' });
    }
    if (!curso) {
      return res.status(400).json({ error: 'curso_id no corresponde a un curso existente' });
    }

    const inscripcion = await Inscripcion.create(req.body);
    return res.status(201).json(inscripcion);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
