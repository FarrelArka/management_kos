module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Kos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    price_per_month: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    gender: { type: DataTypes.ENUM('male','female','all'), defaultValue: 'all' },
    createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
  }, {
    tableName: 'kos',
    timestamps: true,
    underscored: true
  });
};
