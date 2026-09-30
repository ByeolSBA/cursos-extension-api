const express = require('express');
const Salon = require('../models/Salon');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    return res.json(await Salon.find().sort({ capacidad: 1 }));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) {
      return res.status(404).json({ error: 'Salón no encontrado' });
    }
    return res.json(salon);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const salon = await Salon.create(req.body);
    return res.status(201).json(salon);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
