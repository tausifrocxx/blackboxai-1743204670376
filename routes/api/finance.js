const express = require('express');
const router = express.Router();
const finance = require('../../utils/finance');
const Bike = require('../../models/Bike');
const Customer = require('../../models/Customer');

// Calculate financing options for a bike
router.post('/calculate', async (req, res) => {
  try {
    const { bikeId, customerId, downPaymentPercent, tenureMonths, interestRate } = req.body;
    
    // Get bike details
    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    // Get customer details if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
    }

    // Calculate financing
    const downPayment = finance.calculateDownPayment(bike.price, downPaymentPercent);
    const emiDetails = finance.calculateEMI(
      downPayment.loanAmount,
      interestRate / 100,
      tenureMonths
    );
    const insurance = finance.calculateInsurance(bike.price);

    // Prepare response
    const response = {
      bike: {
        _id: bike._id,
        model: bike.model,
        variant: bike.variant,
        price: bike.price,
        imageUrl: bike.imageUrl
      },
      customer: customer ? {
        _id: customer._id,
        name: customer.name,
        contact: customer.contact
      } : null,
      downPayment,
      tenureMonths,
      interestRate,
      emi: emiDetails.emi,
      totalInterest: emiDetails.totalInterest,
      totalPayment: emiDetails.totalPayment,
      insurancePremium: insurance,
      paymentSchedule: emiDetails.schedule,
      calculationDate: new Date()
    };

    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Save finance application
router.post('/applications', async (req, res) => {
  try {
    const { bikeId, customerId, calculation } = req.body;
    
    // Verify bike exists
    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // In a real application, you would save to database
    // Here we'll return a mock response
    const application = {
      _id: Math.random().toString(36).substring(2, 9),
      bike: bikeId,
      customer: customerId,
      calculation,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update customer interest
    customer.interest = {
      bikeModel: bikeId,
      status: 'Finance Application',
      notes: `Finance application submitted for ${bike.model}`
    };
    await customer.save();

    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all finance applications
router.get('/applications', async (req, res) => {
  try {
    // In a real application, you would query the database
    // Here we'll return a mock response
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;