const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  partNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  compatibleModels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike'
  }],
  category: {
    type: String,
    required: true,
    enum: ['Engine', 'Electrical', 'Body', 'Suspension', 'Brakes', 'Accessories']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    leadTime: Number // in days
  },
  lastOrdered: Date,
  nextOrderDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

partSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate next order date if stock is below minimum
  if (this.stock < this.minStockLevel) {
    const leadTimeDays = this.supplier?.leadTime || 7;
    this.nextOrderDate = new Date(Date.now() + leadTimeDays * 24 * 60 * 60 * 1000);
  } else {
    this.nextOrderDate = undefined;
  }
  
  next();
});

// Static method to find parts needing reorder
partSchema.statics.findLowStock = function() {
  return this.find({ 
    $expr: { $lt: ['$stock', '$minStockLevel'] } 
  });
};

module.exports = mongoose.model('Part', partSchema);