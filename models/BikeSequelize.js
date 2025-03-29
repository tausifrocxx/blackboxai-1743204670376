const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bike = sequelize.define('Bike', {
    model: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    variant: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      min: 0
    },
    engine: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mileage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    power: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transmission: {
      type: DataTypes.ENUM('Manual', 'Automatic'),
      allowNull: false
    },
    fuelType: {
      type: DataTypes.ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid'),
      allowNull: false
    },
    inStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
        matches: /\.(jpg|jpeg|png|webp)$/
      }
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  });

    Bike.associate = function(models) {
    Bike.hasMany(models.Customer, {
      foreignKey: 'bikeModelInterest',
      as: 'customers'
    });
  };

  return Bike;

};