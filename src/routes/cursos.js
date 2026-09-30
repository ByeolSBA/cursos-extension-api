const express = require('express');
const Curso = require('../models/Curso');
const Inscripcion = require('../models/Inscripcion');
const Salon = require('../models/Salon');

const router = express.Router();

router.get('/:id/inscritos', async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const inscritosConfirmados = await Inscripcion.countDocuments({
      curso_id: curso._id,
      estado: 'Confirmada'
    });

    return res.json({
      curso: curso.nombre,
      inscritos_confirmados: inscritosConfirmados
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/salones-disponibles', async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const inscritosConfirmados = await Inscripcion.countDocuments({
      curso_id: curso._id,
      estado: 'Confirmada'
    });
    const salones = await Salon.find({
      disponible: true,
      capacidad: { $gte: inscritosConfirmados }
    }).sort({ capacidad: 1 });

    return res.json(salones);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    return res.json(await Curso.find().sort({ nombre: 1 }));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    return res.json(curso);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const curso = await Curso.create(req.body);
    return res.status(201).json(curso);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    return res.json(curso);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    return res.json({ message: 'Curso eliminado correctamente', curso });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
