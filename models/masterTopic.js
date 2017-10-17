module.exports = function (sequelize, DataTypes) {
  return sequelize.define('master_topic', {
    archived: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    guid: {
      allowNull: false,
      type: DataTypes.UUID
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
