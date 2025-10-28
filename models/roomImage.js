// models/RoomImage.js
module.exports = (sequelize, DataTypes) => {
  const RoomImage = sequelize.define('RoomImage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'room_images',
    timestamps: false
  });

  // Relasi
  RoomImage.associate = models => {
    RoomImage.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
  };

  return RoomImage;
};
