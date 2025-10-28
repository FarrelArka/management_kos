const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import semua model
const User = require('./user')(sequelize, DataTypes);
const Kos = require('./kos')(sequelize, DataTypes);
const KosImage = require('./kos_image')(sequelize, DataTypes);
const KosFacility = require('./kos_facility')(sequelize, DataTypes);
const Review = require('./review')(sequelize, DataTypes);
const Booking = require('./booking')(sequelize, DataTypes);
const Room = require('./room')(sequelize, DataTypes);
const RoomImage = require('./room_image')(sequelize, DataTypes);

// =====================================================
// 🔗 ASSOCIATIONS
// =====================================================

// User ↔ Kos
User.hasMany(Kos, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Kos.belongsTo(User, { foreignKey: 'user_id' });

// Kos ↔ KosImage
Kos.hasMany(KosImage, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
KosImage.belongsTo(Kos, { foreignKey: 'kos_id' });

// Kos ↔ KosFacility
Kos.hasMany(KosFacility, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
KosFacility.belongsTo(Kos, { foreignKey: 'kos_id' });

// Kos ↔ Review ↔ User
Kos.hasMany(Review, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
Review.belongsTo(Kos, { foreignKey: 'kos_id' });

User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Kos ↔ Booking ↔ User
Kos.hasMany(Booking, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
Booking.belongsTo(Kos, { foreignKey: 'kos_id' });

User.hasMany(Booking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// =====================================================
// 🏠 KOS ↔ ROOM ↔ ROOM IMAGE
// =====================================================

// Kos → Room (1 kos bisa punya banyak kamar)
Kos.hasMany(Room, { foreignKey: 'kos_id', onDelete: 'CASCADE' });
Room.belongsTo(Kos, { foreignKey: 'kos_id' });

// Room → RoomImage (1 kamar bisa punya banyak gambar)
Room.hasMany(RoomImage, { foreignKey: 'room_id', onDelete: 'CASCADE' });
RoomImage.belongsTo(Room, { foreignKey: 'room_id' });

// =====================================================
// 📦 EXPORT SEMUA MODEL
// =====================================================
module.exports = {
  sequelize,
  User,
  Kos,
  KosImage,
  KosFacility,
  Review,
  Booking,
  Room,
  RoomImage
};
