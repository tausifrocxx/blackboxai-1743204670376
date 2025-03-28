const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
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
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  interest: {
    bikeModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Test Drive', 'Negotiation', 'Purchased', 'Lost'],
      default: 'New'
    },
    notes: String
  },
  visits: [{
    date: {
      type: Date,
      default: Date.now
    },
    purpose: String,
    outcome: String,
    followUpDate: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);