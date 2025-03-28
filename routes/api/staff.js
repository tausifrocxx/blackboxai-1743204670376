const express = require('express');
const router = express.Router();
const Staff = require('../../models/Staff_new');
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../../middleware/auth');

// Validation middleware
const validateStaff = [
  check('employeeId').not().isEmpty().withMessage('Employee ID is required'),
  check('name').not().isEmpty().withMessage('Name is required'),
  check('contact.phone').isMobilePhone().withMessage('Invalid phone number'),
  check('contact.email').isEmail().withMessage('Invalid email'),
  check('role').isIn(['Sales', 'Mechanic', 'Manager', 'Admin']).withMessage('Invalid role'),
  check('salary.base').isNumeric().withMessage('Base salary must be a number')
];

// Get all staff with pagination and filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active, department } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (active) query.active = active === 'true';
    if (department) query.department = department;
    
    const staff = await Staff.find(query)
      .sort({ joinedDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()
      .exec();

    const count = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

// Get single staff member with virtuals
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .select('+documents +emergencyContact')
      .lean()
      .exec();

    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    // Calculate virtuals
    staff.totalSalary = staff.salary.base + (staff.salary.bonus || 0);
    staff.attendancePercentage = staff.attendance.length > 0 ? 
      (staff.attendance.filter(a => a.status === 'Present').length / staff.attendance.length * 100) : 0;

    res.json({ 
      success: true,
      data: staff 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

// Create new staff member
router.post('/', [authMiddleware, ...validateStaff], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const staffData = {
      ...req.body,
      documents: req.body.documents || [],
      leaveBalance: {
        casual: 12,
        sick: 10,
        earned: 0
      }
    };

    const staff = new Staff(staffData);
    const newStaff = await staff.save();

    res.status(201).json({ 
      success: true,
      data: newStaff 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update staff member
router.patch('/:id', [authMiddleware, ...validateStaff], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    // Update fields
    const updatableFields = [
      'name', 'contact', 'role', 'salary', 'active', 
      'department', 'documents', 'emergencyContact'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    });

    const updatedStaff = await staff.save();
    res.json({ 
      success: true,
      data: updatedStaff 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Deactivate staff member
router.patch('/:id/deactivate', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    staff.active = false;
    await staff.save();

    res.json({ 
      success: true,
      data: { message: 'Staff deactivated successfully' } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Server Error' 
    });
  }
});

// Attendance management
router.post('/:id/attendance', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    const result = await staff.markAttendance(req.body);
    res.json({ 
      success: true,
      data: result 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Leave management
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    const leaveData = {
      type: req.body.type,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      reason: req.body.reason
    };

    await staff.applyLeave(leaveData);
    res.json({ 
      success: true,
      data: { message: 'Leave application submitted' } 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Approve/Reject leave
router.patch('/:id/leave/:leaveId', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    const leave = staff.leaveApplications.id(req.params.leaveId);
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        error: 'Leave application not found' 
      });
    }

    if (!['Approved', 'Rejected'].includes(req.body.status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status' 
      });
    }

    leave.status = req.body.status;
    
    // Deduct leave balance if approved
    if (req.body.status === 'Approved') {
      const leaveDays = Math.ceil((leave.endDate - leave.startDate) / (86400000)) + 1;
      staff.leaveBalance[leave.type] -= leaveDays;
    }

    await staff.save();
    res.json({ 
      success: true,
      data: leave 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Salary processing
router.post('/:id/salary', authMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        error: 'Staff not found' 
      });
    }

    // Process salary payment
    const paymentData = {
      month: req.body.month,
      year: req.body.year,
      amount: staff.salary.base + (staff.salary.bonus || 0),
      paymentDate: new Date(),
      reference: `SAL-${Date.now()}`
    };

    // In a real app, this would connect to a payment gateway
    res.json({ 
      success: true,
      data: {
        message: 'Salary processed successfully',
        payment: paymentData
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;
