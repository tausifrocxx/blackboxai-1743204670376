const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Model definitions
const modelDefiners = [
  require('./models/BikeSequelize'),
  require('./models/CustomerSequelize')
];

// Initialize models
for (const definer of modelDefiners) {
  definer(sequelize);
}

// Set up associations
const { Bike, Customer } = sequelize.models;

if (Bike && Customer) {
  Bike.hasMany(Customer, {
    foreignKey: 'bikeModelInterest',
    as: 'customers'
  });
  Customer.belongsTo(Bike, {
    foreignKey: 'bikeModelInterest', 
    as: 'bike'
  });
}

// Database sync function
async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    return sequelize;
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  syncDB,
  ...sequelize.models
};