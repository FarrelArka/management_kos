// models/Room.js
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    kos_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nama_kamar: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    harga_per_bulan: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('tersedia', 'dipesan', 'tidak_aktif'),
      defaultValue: 'tersedia'
    },
    gender: {
      type: DataTypes.ENUM('laki-laki', 'perempuan', 'campur'),
      allowNull: false
    }
  }, {
    tableName: 'rooms',
    timestamps: true
  });

  // Relasi
  Room.associate = models => {
    Room.belongsTo(models.Kos, { foreignKey: 'kos_id', as: 'kos' });
    Room.hasMany(models.RoomImage, { foreignKey: 'room_id', as: 'images' });
  };

  return Room;
};
