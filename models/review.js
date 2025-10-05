module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kos_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.TINYINT },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW }
  }, {
    tableName: 'reviews',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });
};
