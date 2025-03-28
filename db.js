const { Sequelize } = require('sequelize');

// Use :memory: for pure in-memory database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

module.exports = sequelize;