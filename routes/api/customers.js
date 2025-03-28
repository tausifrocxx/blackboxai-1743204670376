const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');

// Get all customers with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) query['interest.status'] = status;
    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .populate('interest.bikeModel', 'model variant price')
      .sort({ createdAt: -1 });
      
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('interest.bikeModel');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    contact: req.body.contact,
    address: req.body.address,
    interest: req.body.interest
  });

  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update customer
router.patch('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (req.body.name) customer.name = req.body.name;
    if (req.body.contact) customer.contact = req.body.contact;
    if (req.body.address) customer.address = req.body.address;
    if (req.body.interest) customer.interest = req.body.interest;

    // Add new visit if provided
    if (req.body.visit) {
      customer.visits.push(req.body.visit);
    }

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    await customer.remove();
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;