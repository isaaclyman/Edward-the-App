module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Document', {
    id: {
      allowNull: false,
      type: DataTypes.GUID
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
