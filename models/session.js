module.exports = function (sequelize, DataTypes) {
  return sequelize.define('session', {
    sid: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true
    },
    sess: {
      allowNull: false,
      type: DataTypes.JSON
    },
    expire: {
      allowNull: false,
      type: DataTypes.DATE(6)
    }
  }, {
    freezeTableName: true,
    tableName: 'session'
  })
}
