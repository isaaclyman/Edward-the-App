module.exports = function (sequelize, DataTypes) {
  return sequelize.define('chapter', {
    archived: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    content: {
      allowNull: true,
      type: DataTypes.JSON
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
