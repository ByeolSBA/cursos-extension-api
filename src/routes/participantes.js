const express = require('express');
const Participante = require('../models/Participante');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    return res.json(await Participante.find().sort({ nombre: 1 }));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const participante = await Participante.findById(req.params.id);
    if (!participante) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }
    return res.json(participante);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const participante = await Participante.create(req.body);
    return res.status(201).json(participante);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
