export default (sequelize, DataTypes) => {
  const FriendRequest = sequelize.define('FriendRequest', {
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
    }
  });

  FriendRequest.associate = (models) => {
    FriendRequest.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    FriendRequest.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
  };

  return FriendRequest;
};