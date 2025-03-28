const express = require('express');
const router = express.Router();
const Bike = require('../../models/Bike');

// Get all bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single bike
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new bike
router.post('/', async (req, res) => {
  const bike = new Bike({
    model: req.body.model,
    variant: req.body.variant,
    price: req.body.price,
    specs: req.body.specs,
    imageUrl: req.body.imageUrl,
    stock: req.body.stock
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
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    if (req.body.model) bike.model = req.body.model;
    if (req.body.variant) bike.variant = req.body.variant;
    if (req.body.price) bike.price = req.body.price;
    if (req.body.specs) bike.specs = req.body.specs;
    if (req.body.imageUrl) bike.imageUrl = req.body.imageUrl;
    if (req.body.stock) bike.stock = req.body.stock;

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

    await bike.remove();
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;