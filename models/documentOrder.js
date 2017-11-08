module.exports = function (sequelize, DataTypes) {
  return sequelize.define('document_order', {
    order: {
      allowNull: false,
      type: DataTypes.ARRAY(DataTypes.UUID)
    }
  })
}
