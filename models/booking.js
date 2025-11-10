module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Booking",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      kos_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      start_date: { type: DataTypes.DATEONLY, allowNull: false },
      end_date: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "accept", "reject"),
        defaultValue: "pending",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
      updatedAt: { type: DataTypes.DATE, field: "updated_at" },
    },
    {
      tableName: "books",
      timestamps: true,
      underscored: true,
    }
  );
};
