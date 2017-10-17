module.exports = function (sequelize, DataTypes) {
  return sequelize.define('account_type', {
    name: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
