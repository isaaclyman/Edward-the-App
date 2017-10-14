module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Document', {
    guid: {
      allowNull: false,
      type: DataTypes.UUID
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
