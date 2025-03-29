const express = require('express');
const router = express.Router();
const { Bike } = require('../../db');

// Get all bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.findAll();
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single bike
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new bike
router.post('/', async (req, res) => {
  const bike = Bike.build({
    model: req.body.model,
    variant: req.body.variant,
    price: req.body.price,
    engine: req.body.engine,
    mileage: req.body.mileage,
    power: req.body.power,
    transmission: req.body.transmission,
    fuelType: req.body.fuelType,
    inStock: req.body.inStock,
    imageUrl: req.body.imageUrl,
    featured: req.body.featured || false
  });

  try {
    const newBike = await bike.save();
    res.status(201).json(newBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update bike
router.patch('/:id', async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    if (req.body.model) bike.model = req.body.model;
    if (req.body.variant) bike.variant = req.body.variant;
    if (req.body.price) bike.price = req.body.price;
    if (req.body.engine) bike.engine = req.body.engine;
    if (req.body.mileage) bike.mileage = req.body.mileage;
    if (req.body.power) bike.power = req.body.power;
    if (req.body.transmission) bike.transmission = req.body.transmission;
    if (req.body.fuelType) bike.fuelType = req.body.fuelType;
    if (req.body.inStock) bike.inStock = req.body.inStock;
    if (req.body.imageUrl) bike.imageUrl = req.body.imageUrl;
    if (req.body.featured) bike.featured = req.body.featured;

    const updatedBike = await bike.save();
    res.json(updatedBike);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete bike
router.delete('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    await bike.destroy();
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;