const express = require('express');
const router = express.Router();
const Part = require('../../models/Part');

// Get all parts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (lowStock === 'true') query = { $expr: { $lt: ['$stock', '$minStockLevel'] } };
    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const parts = await Part.find(query)
      .populate('compatibleModels', 'model variant')
      .sort({ name: 1 });
      
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock parts
router.get('/low-stock', async (req, res) => {
  try {
    const parts = await Part.findLowStock()
      .populate('compatibleModels', 'model variant');
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single part
router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id)
      .populate('compatibleModels', 'model variant');
    if (!part) return res.status(404).json({ message: 'Part not found' });
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new part
router.post('/', async (req, res) => {
  const part = new Part({
    partNumber: req.body.partNumber,
    name: req.body.name,
    description: req.body.description,
    compatibleModels: req.body.compatibleModels,
    category: req.body.category,
    price: req.body.price,
    cost: req.body.cost,
    stock: req.body.stock,
    minStockLevel: req.body.minStockLevel,
    supplier: req.body.supplier
  });

  try {
    const newPart = await part.save();
    res.status(201).json(newPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update part
router.patch('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: 'Part not found' });

    if (req.body.name) part.name = req.body.name;
    if (req.body.description) part.description = req.body.description;
    if (req.body.compatibleModels) part.compatibleModels = req.body.compatibleModels;
    if (req.body.category) part.category = req.body.category;
    if (req.body.price) part.price = req.body.price;
    if (req.body.cost) part.cost = req.body.cost;
    if (req.body.stock) part.stock = req.body.stock;
    if (req.body.minStockLevel) part.minStockLevel = req.body.minStockLevel;
    if (req.body.supplier) part.supplier = req.body.supplier;

    // Mark as ordered if stock is updated
    if (req.body.stock && req.body.stock > part.stock) {
      part.lastOrdered = new Date();
    }

    const updatedPart = await part.save();
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update part stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { action, quantity } = req.body;
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: 'Part not found' });

    if (action === 'add') {
      part.stock += quantity;
    } else if (action === 'subtract') {
      part.stock = Math.max(0, part.stock - quantity);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const updatedPart = await part.save();
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete part
router.delete('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: 'Part not found' });
    await part.remove();
    res.json({ message: 'Part deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;