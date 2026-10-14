const express = require('express');
const Asignacion = require('../models/Asignacion');
const Curso = require('../models/Curso');
const Salon = require('../models/Salon');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const asignaciones = await Asignacion.find()
      .populate('curso_id')
      .populate('salon_id')
      .sort({ fecha_inicio: 1, hora_inicio: 1 });
    return res.json(asignaciones);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const asignacion = await Asignacion.findById(req.params.id)
      .populate('curso_id')
      .populate('salon_id');
    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    return res.json(asignacion);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { curso_id: cursoId, salon_id: salonId } = req.body;
    const [curso, salon] = await Promise.all([
      Curso.findById(cursoId),
      Salon.findById(salonId)
    ]);
    if (!curso) {
      return res.status(400).json({ error: 'curso_id no corresponde a un curso existente' });
    }
    if (!salon) {
      return res.status(400).json({ error: 'salon_id no corresponde a un salón existente' });
    }

    const asignacion = await Asignacion.create(req.body);
    return res.status(201).json(asignacion);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
