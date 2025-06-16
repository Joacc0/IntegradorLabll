export default (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: DataTypes.STRING
  });

  Image.associate = (models) => {
    Image.belongsTo(models.Album);
    Image.belongsTo(models.User);
  };

  return Image;
};