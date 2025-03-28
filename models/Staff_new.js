const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    phone: {
      type: String,
      required: true,
      validate: {
        validator: v => /^[0-9]{10}$/.test(v),
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: props => `${props.value} is not a valid email!`
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['Sales', 'Mechanic', 'Manager', 'Admin', 'Accountant'],
    index: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Sales', 'Service', 'Finance', 'Admin', 'Parts'],
    default: 'Sales'
  },
  salary: {
    base: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String
    }
  },
  attendance: [{
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On Leave', 'Half Day'],
      default: 'Present'
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    notes: String
  }],
  performance: {
    rating: { type: Number, min: 1, max: 5 },
    kpis: [{
      name: String,
      target: Number,
      achieved: Number
    }]
  },
  leaveBalance: {
    casual: { type: Number, default: 12, min: 0 },
    sick: { type: Number, default: 10, min: 0 },
    earned: { type: Number, default: 0, min: 0 }
  },
  joinedDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Virtual for total salary
staffSchema.virtual('totalSalary').get(function() {
  return this.salary.base + (this.salary.bonus || 0);
});

// Virtual for attendance percentage
staffSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance || this.attendance.length === 0) return 0;
  const presentDays = this.attendance.filter(a => a.status === 'Present').length;
  return Math.round((presentDays / this.attendance.length) * 100);
});

module.exports = mongoose.model('Staff', staffSchema);