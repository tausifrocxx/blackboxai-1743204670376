const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
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
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
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
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['Sales', 'Mechanic', 'Manager', 'Admin']
  },
  salary: {
    base: {
      type: Number,
      required: true,
      min: 0
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'On Leave'],
      default: 'Present'
    },
    checkIn: Date,
    checkOut: Date
  }],
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    salesTarget: Number,
    salesAchieved: Number
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Staff', staffSchema);