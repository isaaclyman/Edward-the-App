module.exports = function (sequelize, DataTypes) {
  return sequelize.define('order', {
    ownerGuid: {
      allowNull: true,
      type: DataTypes.UUID
    },
    ownerType: {
      allowNull: true,
      type: DataTypes.STRING
    },
    order: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.UUID)
    }
  })
}
