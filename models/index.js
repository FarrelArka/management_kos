const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// =====================================================
// 🧩 IMPORT SEMUA MODEL
// =====================================================
const User = require("./user")(sequelize, DataTypes);
const Kos = require("./kos")(sequelize, DataTypes);
const KosImage = require("./kos_image")(sequelize, DataTypes);
const KosFacility = require("./kos_facility")(sequelize, DataTypes);
const Review = require("./review")(sequelize, DataTypes);
const Booking = require("./booking")(sequelize, DataTypes);
const Room = require("./room")(sequelize, DataTypes);
const RoomImage = require("./roomimage")(sequelize, DataTypes);

// =====================================================
// 🔗 ASSOCIATIONS
// =====================================================

// 👤 User ↔ Kos
User.hasMany(Kos, { foreignKey: "user_id", as: "Kosts", onDelete: "CASCADE" });
Kos.belongsTo(User, { foreignKey: "user_id", as: "Owner" });

// 🏠 Kos ↔ KosImage
Kos.hasMany(KosImage, {
  foreignKey: "kos_id",
  as: "Images",
  onDelete: "CASCADE",
});
KosImage.belongsTo(Kos, { foreignKey: "kos_id", as: "Kos" });

// 🧩 Kos ↔ KosFacility
Kos.hasMany(KosFacility, {
  foreignKey: "kos_id",
  as: "Facilities",
  onDelete: "CASCADE",
});
KosFacility.belongsTo(Kos, { foreignKey: "kos_id", as: "Kos" });

// 💬 Kos ↔ Review ↔ User
Kos.hasMany(Review, {
  foreignKey: "kos_id",
  as: "Reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(Kos, { foreignKey: "kos_id", as: "Kos" });

User.hasMany(Review, {
  foreignKey: "user_id",
  as: "UserReviews",
  onDelete: "CASCADE",
});
Review.belongsTo(User, { foreignKey: "user_id", as: "User" });

// 📅 Kos ↔ Booking ↔ User
Kos.hasMany(Booking, {
  foreignKey: "kos_id",
  as: "Bookings",
  onDelete: "CASCADE",
});
Booking.belongsTo(Kos, {
  foreignKey: "kos_id",
  as: "Kos",
  onDelete: "CASCADE",
});

User.hasMany(Booking, {
  foreignKey: "user_id",
  as: "Bookings",
  onDelete: "CASCADE",
});
Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
  onDelete: "CASCADE",
});

// =====================================================
// 🏠 KOS ↔ ROOM ↔ ROOM IMAGE
// =====================================================

// Kos → Room (1 kos bisa punya banyak kamar)
Kos.hasMany(Room, { foreignKey: "kos_id", as: "Rooms", onDelete: "CASCADE" });
Room.belongsTo(Kos, { foreignKey: "kos_id", as: "Kos" });

// Room → RoomImage (1 kamar bisa punya banyak gambar)
Room.hasMany(RoomImage, {
  foreignKey: "room_id",
  as: "Images",
  onDelete: "CASCADE",
});
RoomImage.belongsTo(Room, { foreignKey: "room_id", as: "Room" });

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
  RoomImage,
};
