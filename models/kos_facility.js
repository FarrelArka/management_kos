module.exports = (sequelize, DataTypes) => {
  return sequelize.define('KosFacility', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kos_id: { type: DataTypes.INTEGER, allowNull: false },
    facility: { type: DataTypes.STRING(100), allowNull: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW }
  }, {
    tableName: 'kos_facilities',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });
};
