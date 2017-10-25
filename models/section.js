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
    tags: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    }
  })
}
