export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    type: {
      type: DataTypes.ENUM('friend_request', 'comment', 'like'),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { as: 'sender' });
    Notification.belongsTo(models.User, { as: 'receiver' });
  };

  return Notification;
};