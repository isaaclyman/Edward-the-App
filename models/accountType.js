module.exports = function (sequelize, DataTypes) {
  return sequelize.define('AccountType', {
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
