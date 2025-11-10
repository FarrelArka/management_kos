module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      kos_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      comment: { type: DataTypes.TEXT, allowNull: false },
      rating: { type: DataTypes.TINYINT },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "reviews",
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  // 🔗 Association
  Review.associate = (models) => {
    Review.belongsTo(models.Kos, {
      foreignKey: "kos_id",
      as: "Kos",
    });

    Review.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "User", // ⬅️ alias harus "User" (bukan Owner)
    });
  };

  return Review;
};
