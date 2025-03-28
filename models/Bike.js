const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  specs: {
    engine: {
      type: String,
      required: true
    },
    mileage: {
      type: String,
      required: true
    },
    power: {
      type: String,
      required: true
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      required: true
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric'],
      required: true
    },
    colors: [{
      type: String,
      required: true
    }]
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/).+\.(jpg|jpeg|png|webp)$/.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bikeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bike', bikeSchema);