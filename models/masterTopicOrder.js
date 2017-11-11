module.exports = function (sequelize, DataTypes) {
  return sequelize.define('master_topic_order', {
    ownerGuid: {
      allowNull: false,
      type: DataTypes.UUID
    },
    order: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.UUID)
    }
  })
}
