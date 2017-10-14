module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Chapter', {
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
      type: DataTypes.UUID
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
