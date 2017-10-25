module.exports = function (sequelize, DataTypes) {
  return sequelize.define('plan', {
    archived: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    guid: {
      allowNull: false,
      primaryKey: false,
      type: DataTypes.UUID
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
