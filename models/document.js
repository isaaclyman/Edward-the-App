module.exports = function (sequelize, DataTypes) {
  return sequelize.define('document', {
    guid: {
      allowNull: false,
      primaryKey: false,
      type: DataTypes.UUID
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
