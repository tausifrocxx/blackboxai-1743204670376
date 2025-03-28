const express = require('express');
const router = express.Router();
const Staff = require('../../models/Staff');

// Get all staff with optional filtering
router.get('/', async (req, res) => {
  try {
    const { role, active } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (active) query.active = active === 'true';
    
    const staff = await Staff.find(query)
      .sort({ joinedDate: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single staff member
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new staff member
router.post('/', async (req, res) => {
  const staff = new Staff({
    employeeId: req.body.employeeId,
    name: req.body.name,
    contact: req.body.contact,
    role: req.body.role,
    salary: req.body.salary
  });

  try {
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update staff member
router.patch('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (req.body.name) staff.name = req.body.name;
    if (req.body.contact) staff.contact = req.body.contact;
    if (req.body.role) staff.role = req.body.role;
    if (req.body.salary) staff.salary = req.body.salary;
    if (req.body.active !== undefined) staff.active = req.body.active;

    // Add attendance record if provided
    if (req.body.attendance) {
      staff.attendance.push(req.body.attendance);
    }

    // Update performance if provided
    if (req.body.performance) {
      staff.performance = req.body.performance;
    }

    const updatedStaff = await staff.save();
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    await staff.remove();
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Special endpoint for attendance marking
router.post('/:id/attendance', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const today = new Date().toISOString().split('T')[0];
    const existingRecord = staff.attendance.find(record => 
      record.date.toISOString().split('T')[0] === today
    );

    if (existingRecord) {
      // Update existing record
      if (req.body.checkOut) existingRecord.checkOut = req.body.checkOut;
      if (req.body.status) existingRecord.status = req.body.status;
    } else {
      // Create new record
      staff.attendance.push({
        date: new Date(),
        status: req.body.status || 'Present',
        checkIn: req.body.checkIn || new Date(),
        checkOut: req.body.checkOut
      });
    }

    const updatedStaff = await staff.save();
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;