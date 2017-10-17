module.exports = function (sequelize, DataTypes) {
  return sequelize.define('chapter_topic', {
    content: {
      allowNull: true,
      type: DataTypes.JSON
    }
  })
}
