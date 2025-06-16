export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El comentario no puede estar vacío'
        },
        len: {
          args: [1, 2000],
          msg: 'El comentario debe tener entre 1 y 2000 caracteres'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true, // Para soft delete
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['albumId']
      }
    ]
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });
    
    Comment.belongsTo(models.Album, {
      foreignKey: 'albumId',
      onDelete: 'CASCADE' // Eliminar comentarios si se borra el álbum
    });
  };

  // Métodos personalizados (opcional)
  Comment.prototype.getPreview = function() {
    return this.text.length > 50 
      ? this.text.substring(0, 50) + '...' 
      : this.text;
  };

  return Comment;
};