const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./user')(sequelize, DataTypes);
const Kos = require('./kos')(sequelize, DataTypes);
const KosImage = require('./kos_image')(sequelize, DataTypes);
const KosFacility = require('./kos_facility')(sequelize, DataTypes);
const Review = require('./review')(sequelize, DataTypes);
const Booking = require('./booking')(sequelize, DataTypes);

// Associations
User.hasMany(Kos, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Kos.belongsTo(User, { foreignKey: 'user_id' });

Kos.hasMany(KosImage, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
KosImage.belongsTo(Kos, { foreignKey: 'kos_id' });

Kos.hasMany(KosFacility, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
KosFacility.belongsTo(Kos, { foreignKey: 'kos_id' });

Kos.hasMany(Review, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
Review.belongsTo(Kos, { foreignKey: 'kos_id' });

User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Kos.hasMany(Booking, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
Booking.belongsTo(Kos, { foreignKey: 'kos_id' });

User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User, Kos, KosImage, KosFacility, Review, Booking
};
