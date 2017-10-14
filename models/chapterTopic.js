module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ChapterTopic', {
    content: {
      allowNull: true,
      type: DataTypes.JSON
    }
  })
}
