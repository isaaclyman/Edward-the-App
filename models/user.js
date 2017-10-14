module.exports = function (sequelize, DataTypes) {
  return sequelize.define('User', {
    username: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    password_hash: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
