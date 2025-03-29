const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pincode: DataTypes.STRING,
    bikeModelInterest: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Bikes',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('New', 'Contacted', 'Test Drive', 'Negotiation', 'Purchased', 'Lost'),
      defaultValue: 'New'
    },
    notes: DataTypes.TEXT,
    lastVisitDate: DataTypes.DATE,
    visitPurpose: DataTypes.STRING,
    visitOutcome: DataTypes.STRING,
    followUpDate: DataTypes.DATE
  }, {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  });

  return Customer;
};