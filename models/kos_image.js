module.exports = (sequelize, DataTypes) => {
  return sequelize.define('KosImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kos_id: { type: DataTypes.INTEGER, allowNull: false },
    file: { type: DataTypes.STRING(255), allowNull: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW }
  }, {
    tableName: 'kos_images',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });
};
