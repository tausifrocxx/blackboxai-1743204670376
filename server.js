require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
async function connectDB() {
  try {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    });
    
    await sequelize.authenticate();
    console.log('SQLite connection established');
    await sequelize.sync(); // Creates tables if they don't exist
    return sequelize;
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

// Initialize sample data
async function initializeData() {
  try {
    const Bike = require('./models/Bike');
    const Customer = require('./models/Customer');

    await Bike.destroy({ where: {} });
    await Customer.destroy({ where: {} });

    await Bike.create([
      { 
        model: 'Mountain Pro', 
        price: 899, 
        inStock: 5,
        variant: 'Standard',
        specs: {
          fuelType: 'Petrol',
          transmission: 'Manual',
          power: '75 HP',
          mileage: '25 kmpl',
          engine: '250cc'
        }
      },
      { 
        model: 'Road Elite', 
        price: 1299, 
        inStock: 3,
        variant: 'Deluxe',
        specs: {
          fuelType: 'Petrol',
          transmission: 'Automatic',
          power: '100 HP',
          mileage: '20 kmpl',
          engine: '350cc'
        }
      },
      { 
        model: 'Hybrid Comfort', 
        price: 599, 
        inStock: 8,
        variant: 'Eco',
        specs: {
          fuelType: 'Hybrid',
          transmission: 'Automatic',
          power: '60 HP',
          mileage: '30 kmpl',
          engine: '200cc'
        }
      }
    ]);

    await Customer.create([
      { name: 'John Doe', email: 'john@example.com', phone: '555-0101' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0202' }
    ]);

    console.log('Sample data initialized');
  } catch (err) {
    console.error('Data initialization error:', err);
  }
}

// Import routes
const bikeRoutes = require('./routes/api/bikes');
const customerRoutes = require('./routes/api/customers');

// Use routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
(async () => {
  const mongod = await connectDB();
  await initializeData();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    await mongod.stop();
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
})();

module.exports = app;