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

// Initialize sample data
async function initializeData() {
  try {
    const { Bike, Customer } = require('./db');


    // Clear existing data
    await Bike.destroy({ where: {} });
    await Customer.destroy({ where: {} });


    await Bike.bulkCreate([
      { 
        model: 'Mountain Pro', 
        price: 899, 
        inStock: 5,
        variant: 'Standard',
        fuelType: 'Petrol',
        transmission: 'Manual',
        power: '75 HP',
        mileage: '25 kmpl',
        engine: '250cc'
      },
      { 
        model: 'Road Elite', 
        price: 1299, 
        inStock: 3,
        variant: 'Deluxe',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        power: '100 HP',
        mileage: '20 kmpl',
        engine: '350cc'
      },
      { 
        model: 'Hybrid Comfort', 
        price: 599, 
        inStock: 8,
        variant: 'Eco',
        fuelType: 'Hybrid',
        transmission: 'Automatic',
        power: '60 HP',
        mileage: '30 kmpl',
        engine: '200cc'
      }
    ]);

    await Customer.bulkCreate([
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
    // Initialize database through db.js
  const { sequelize } = await require('./db').syncDB();
  await initializeData();


    let server;
  const startServer = (port) => {
    server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };
  
  startServer(PORT);


  // Graceful shutdown
  process.on('SIGINT', async () => {
    await sequelize.close();
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
})();


module.exports = app;