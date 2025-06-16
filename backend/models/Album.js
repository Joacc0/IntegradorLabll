export default (sequelize, DataTypes) => {
  const Album = sequelize.define('Album', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El título no puede estar vacío'
        },
        len: {
          args: [3, 100],
          msg: 'El título debe tener entre 3 y 100 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [0, 500],
          msg: 'La descripción no puede exceder los 500 caracteres'
        }
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true, // Para soft delete
    defaultScope: {
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt']
      }
    },
    scopes: {
      withDates: {
        attributes: { include: ['createdAt', 'updatedAt'] }
      }
    }
  });

  Album.associate = (models) => {
    Album.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'owner'
    });
    
    Album.hasMany(models.Comment, {
      foreignKey: 'albumId',
      as: 'comments',
      onDelete: 'CASCADE'
    });
    
    Album.hasMany(models.Image, {
      foreignKey: 'albumId',
      as: 'images',
      onDelete: 'CASCADE'
    });
  };

  // Método para verificar permisos (opcional)
  Album.prototype.checkPermission = function(userId) {
    return this.userId === userId || this.isPublic;
  };

  return Album;
};