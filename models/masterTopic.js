module.exports = function (sequelize, DataTypes) {
  return sequelize.define('MasterTopic', {
    archived: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    id: {
      allowNull: false,
      type: DataTypes.UUID
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
